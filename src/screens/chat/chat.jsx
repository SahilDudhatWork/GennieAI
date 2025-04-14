import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import {Colors, FontFamily} from '../../../Utils/Themes';
import {
  StartChatIcon,
  ShareIcon,
  SideArrowIcon,
  MicroPhoneIcon,
} from '../../components/Icons';
import Modal from 'react-native-modal';

import Voice from '@react-native-voice/voice';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Tts from 'react-native-tts';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../../../config';
import LottieView from 'lottie-react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import {useFocusEffect, useRoute} from '@react-navigation/native';
function Chat({navigation}) {
  const [showInput, setShowInput] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(false);
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  //  chat -----------------
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentChat, setCurrentChat] = useState(null);
  const [uuid, setUUID] = useState(null);
  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      if (route.params?.setSelectedTab) {
        route.params.setSelectedTab('Chat');
      }
    }, [route.params]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsListening(false);
      setIsResponding(false);
      setIsSpeaking(false);
      loadCurrentChat();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadCurrentChat();
    setIsListening(false);
    setIsResponding(false);
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
    // Tts.voices().then(voices => console.log('voices--',voices));

    // Tts.setDefaultLanguage('en-US'); // Set a natural English voice
    // Tts.setDefaultVoice('en-us-x-sfg#male_1-local'); // Choose a better human voice
    // Tts.setDefaultRate(0.5); // Adjust speed (1.0 is default)
    // Tts.setDefaultPitch(1.1); // Slightly raise pitch for a natural tone

    const handleTtsStart = () => {
      console.log('TTS started');
      setIsSpeaking(true);
    };

    const handleTtsFinish = () => {
      console.log('TTS finished');
      setIsSpeaking(false);
    };

    const handleTtsCancel = () => {
      console.log('TTS canceled');
      setIsSpeaking(false);
    };

    Tts.addEventListener('tts-start', handleTtsStart);
    Tts.addEventListener('tts-finish', handleTtsFinish);
    Tts.addEventListener('tts-cancel', handleTtsCancel);

    const startSub = Tts.addEventListener('tts-start', handleTtsStart);
    const finishSub = Tts.addEventListener('tts-finish', handleTtsFinish);
    const cancelSub = Tts.addEventListener('tts-cancel', handleTtsCancel);

    return () => {
      startSub.remove();
      finishSub.remove();
      cancelSub.remove();
    };
  }, []);

  useEffect(() => {
    setUUID(generateUUID());
    const setupVoiceListeners = () => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    };

    setupVoiceListeners();

    return async () => {
      await Voice.destroy().then(() => {
        Voice.removeAllListeners();
        setIsListening(false);
      });
    };
  }, []);

  const createNewChat = () => ({
    id: Date.now().toString(),
    messages: [],
    createdAt: new Date(),
    title: `Chat ${new Date().toLocaleTimeString()}`,
  });

  const loadCurrentChat = async () => {
    try {
      const storedChatsJson = await AsyncStorage.getItem('chatMessages');
      const storedChats = storedChatsJson ? JSON.parse(storedChatsJson) : [];

      if (storedChats.length === 0) {
        const newChat = createNewChat();
        storedChats.push(newChat);
        await AsyncStorage.setItem('chatMessages', JSON.stringify(storedChats));

        setCurrentChat(newChat);
      } else {
        setCurrentChat(storedChats[storedChats.length - 1]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const checkNetworkConnectivity = async () => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
  };

  const onSpeechStart = () => {
    setIsListening(true);
  };
  const generateUUID = () =>
    'xxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  const onSpeechRecognized = () => {
    console.log('Speech recognized');
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    setIsListening(false);
  };

  const onSpeechError = useCallback(
    async e => {
      console.error('Speech error:', e);
      setIsListening(false);

      if (e.error.code === '2' && retryCount < MAX_RETRY) {
        setRetryCount(prevCount => prevCount + 1);
        const isConnected = await checkNetworkConnectivity();
        if (isConnected) {
          Alert.alert(
            'Network Error',
            'There was a problem connecting to the speech recognition service. Retrying...',
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsListening(false);
                  setTimeout(() => startListening(), 500);
                },
              },
            ],
          );
        } else {
          Alert.alert(
            'No Internet Connection',
            'Please check your internet connection and try again.',
          );
        }
      } else {
        Alert.alert(
          'Speech Recognition Error',
          'There was a problem with speech recognition. Please try again.',
        );
        setRetryCount(0);
      }
    },
    [retryCount],
  );
  const endTimeoutRef = useRef(null);
  const isRespondingRef = useRef(false);
  const speechProcessedRef = useRef(false);
  
  useEffect(() => {
    isRespondingRef.current = isResponding;
  }, [isResponding]);
  

  const onSpeechResults = useCallback((e) => {
    const transcript = e.value?.[0];
    console.log('Speech results:', transcript);
  
    if (!transcript || isRespondingRef.current || speechProcessedRef.current) return;
  
    // Clear any existing timeout
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
    }
  
    // Debounce + lock logic
    endTimeoutRef.current = setTimeout(() => {
      if (isRespondingRef.current || speechProcessedRef.current) {
        console.log('Skipping due to active response or already processed speech');
        return;
      }
  
      console.log('Simulated speech end', transcript);
      setIsListening(false);
      speechProcessedRef.current = true;
      getAIResponse(transcript);
    }, 1200);
  }, []);
  
  
  
  
  

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.MICROPHONE);
      if (result === RESULTS.GRANTED) return true;
      if (result === RESULTS.DENIED) {
        return (await request(PERMISSIONS.IOS.MICROPHONE)) === RESULTS.GRANTED;
      }
      return false;
    }
  };
  const getAIResponse = async (userQuery) => {
    try {
      isRespondingRef.current = true;
      speechProcessedRef.current = true;
      setIsResponding(true);
      setIsListening(false);
      await Voice.stop();
  
      console.log('userQuery', userQuery);
  
      const newUserMessage = {
        id: Date.now().toString(),
        chatId: uuid,
        text: userQuery,
        sender: 'user',
      };
  
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userQuery }],
        },
        {
          headers: {
            Authorization: `Bearer ${Config.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const aiResponse = response.data.choices[0].message.content.trim();
      console.log('response.data', response.data);
  
      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        chatId: uuid,
        text: aiResponse,
        sender: 'ai',
      };
  
      await saveMessagesToStorage([newUserMessage, newBotMessage]);
      speakResponse(aiResponse);
  
      return aiResponse;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      Alert.alert('Error', 'Failed to get response. Try again.');
      return null;
    } finally {
      isRespondingRef.current = false;
      speechProcessedRef.current = false; // reset for next input
      setIsResponding(false);
    }
  };
  
  

  const speakResponse = text => {
    if (!text) return;

    Tts.stop().then(() => {
      setIsSpeaking(true);

      Tts.speak(text, {
        androidParams: {
          KEY_PARAM_PAN: 0,
          KEY_PARAM_VOLUME: 1.0,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      });
    });
  };

  const startListening = async () => {
    try {
      setIsListening(false);
      setIsResponding(false);
      setIsSpeaking(false);
      await Tts.stop();

      await Voice.destroy();
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechRecognized = onSpeechRecognized;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechResults = onSpeechResults;

      await loadCurrentChat();

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Microphone permission is required.');
        return;
      }

      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
        );
        return;
      }

      if (Voice) {
        setIsListening(true);
        await Voice.start('en-US');
      } else {
        console.log('Voice is not initialized');
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      Alert.alert(
        'Error',
        'Failed to start speech recognition. Please try again.',
      );
    }
  };

  const stopListening = async () => {
    if (isListening) {
      try {
        await Voice.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      } finally {
        setIsListening(false);
      }
    }
  };

  const isButtonDisabled = isListening || isResponding || isSpeaking;

  // --------------chat end------------------------

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [messages]);

  useEffect(() => {
    if (route.params?.fromHistory && route.params.chatId) {
      handleHistoryItemClick(route.params.chatId);
    }
  }, [route.params]);
  const saveMessagesToStorage = async newMessages => {
    try {
      const storedMessages = await AsyncStorage.getItem('chatMessages');
      const storedChats = storedMessages ? JSON.parse(storedMessages) : [];

      const updatedChats = Array.isArray(storedChats)
        ? [...storedChats, ...newMessages]
        : [...newMessages];
      await AsyncStorage.setItem('chatMessages', JSON.stringify(updatedChats));
    } catch (error) {
      console.log(' Error storing messages:', error);
    }
  };
  const handleNewChat = async () => {
    const newId = generateUUID();
    setUUID(newId);
    console.log('New UUID:', newId);
    setDropdownVisible(false);
    setMessages([]);
    setShowInput(false);
    // const newId = generateUUID();
    // setUUID(newId);
    // console.log('New UUID:', newId);
    // setUUID(generateUUID());
    // console.log('uuid', uuid);
  };

  const handleHistoryItemClick = async chatId => {
    try {
      const storedMessages = await AsyncStorage.getItem('chatMessages');
      let storedChatArray = storedMessages ? JSON.parse(storedMessages) : [];

      if (!Array.isArray(storedChatArray)) {
        Alert.alert(
          'No Chat History',
          'Your chat history is empty. Start a conversation now to see your history here!',
        );
        return;
      }

      const selectedChatMessages = storedChatArray.filter(
        msg => msg.chatId === chatId,
      );

      if (selectedChatMessages.length > 0) {
        setUUID(chatId);
        setMessages(selectedChatMessages);
        setShowInput(true);
      } else {
        console.log('No messages found for this chatId.');
      }
    } catch (error) {
      console.log('Error fetching chat history from AsyncStorage:', error);
    }
  };

 
  const handleChatClick = async () => {
    if (!chatText.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      chatId: uuid,
      text: chatText,
      sender: 'user',
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setChatText('');
    setShowChatBubble(false);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {role: 'system', content: 'You are a helpful assistant.'},
            {role: 'user', content: chatText},
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${Config.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const botResponse = response.data.choices[0].message.content;
      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        chatId: uuid,
        text: botResponse,
        sender: 'ai',
      };

      setMessages(prevMessages => [...prevMessages, newBotMessage]);
      await saveMessagesToStorage([newUserMessage, newBotMessage]);
    } catch (error) {
      console.log('API Error:', error?.request);
    }
  };

  return (
    <ScreenWrapper isSpecialBg={showInput}>
      
      {!showInput && (
        <View style={styles.imageContainer}>
          {!showInput && !showChatBubble && (
            <Text style={styles.talkText}>
              {isListening
                ? 'Listening...'
                : isResponding
                ? 'Processing...'
                : isSpeaking
                ? 'Speaking...'
                : 'Tap to Talk'}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => {
              if (isButtonDisabled) {
                if (isListening) {
                  stopListening();
                }
                if (isSpeaking) {
                  Tts.stop();
                }
              } else {
                startListening();
              }
            }}
            activeOpacity={0.7}
            style={{opacity: isButtonDisabled ? 0.5 : 1}}>
            <LottieView
              style={{width: 200, height: 200}}
              source={require('../../assets/gif/micAnimation.json')}
              autoPlay={!isButtonDisabled}
              loop={!isButtonDisabled}
            />
          </TouchableOpacity>
        </View>
      )}

      {showInput && messages.length > 0 && (
        <LinearGradient
          colors={['#DAD4FF', '#FFFFFF00']}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          style={styles.chatContainer}>
          <View style={styles.chatContainer}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{flexGrow: 1}}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({animated: true})
              }>
              {messages.map((msg, index) => (
                <View
                  key={`${msg.sender}-${index}`}
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user'
                      ? styles.userMessage
                      : styles.aiMessage,
                  ]}>
                  <Text
                    style={
                      msg.sender === 'user' ? styles.userText : styles.aiText
                    }>
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </LinearGradient>
      )}
      <TouchableOpacity
        style={showInput ? styles.expandedContainer : styles.startChatContainer}
        activeOpacity={1}
        onPress={() => setShowInput(!showInput)}>
        {showInput ? (
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputStyle}
                placeholder="Ask what's on mind"
                placeholderTextColor="#5A5A5A"
                autoCapitalize="none"
                value={chatText}
                onChangeText={setChatText}
              />
              <TouchableOpacity
                style={styles.shareIcon}
                onPress={handleChatClick}>
                <ShareIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.gennieWrapper}>
              <Image
                source={require('../../assets/Images/chatLogo.png')}
                style={styles.gennieImage}
              />
            </View>
          </View>
        ) : (
          <StartChatIcon />
        )}
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-start',
    margin: 0,
    marginTop: 60,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.white,
    width: 100,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#282828',
    fontFamily: FontFamily.SpaceGrotesk,
    fontWeight: '400',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  drawer: {
    height: '70%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: FontFamily.SpaceGrotesk,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 100,
    paddingRight: 16,
    paddingLeft: 7,
    paddingBottom: 7,
    paddingTop: 7,
    marginVertical: 8,
    marginTop: 5,
    marginBottom: 20,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#4A05AD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    padding: 4,
  },
  chatText: {
    flex: 1,
    fontSize: 16,
    color: '#494949E5',
    fontWeight: '400',
    fontFamily: FontFamily.Inter,
  },

  chatContainer: {
    flex: 1,
    padding: 10,
    marginBottom: 60,
    marginTop: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  messageBubble: {
    padding: 10,
    maxWidth: '70%',
    marginBottom: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#4A05AD',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  userText: {
    fontSize: 13,
    color: '#282828',
    fontFamily: FontFamily.SpaceGrotesk,
    fontWeight: '400',
  },
  aiText: {
    fontSize: 13,
    color: '#4A05AD',
    fontFamily: FontFamily.SpaceGrotesk,
    fontWeight: '400',
  },

  addChatContainer: {
    paddingTop: 25,
    paddingRight: 10,
    display: 'flex',
    alignItems: 'flex-end',
  },
  imageContainer: {
    paddingTop: 25,
    paddingRight: 10,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChatIcon: {
    width: 35,
    height: 35,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 50,
    backgroundColor: Colors.white,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  talkText: {
    fontWeight: '400',
    fontSize: 21,
    color: Colors.deepViolet,
    fontFamily: FontFamily.SpaceGrotesk,
    textAlign: 'center',
    paddingTop: 10,
  },
  startChatContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  gennieImage: {
    width: 30,
    height: 30,
  },
  expandedContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 8,
  },
  inputWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  shareIcon: {
    position: 'absolute',
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
    width: 28,
    height: 28,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputStyle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FontFamily.SpaceGrotesk,
    fontWeight: '400',
    color: Colors.darkGray,
    borderRadius: 8,
    backgroundColor: '#C6B0F942',
    paddingLeft: 14,
    paddingRight: 40,
    paddingVertical: 15,
  },
  gennieWrapper: {
    backgroundColor: Colors.white,
    width: 40,
    height: 40,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Chat;

