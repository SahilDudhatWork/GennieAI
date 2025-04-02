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
  Animated,
  Platform,
  Easing,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import {Colors, FontFamily} from '../../../Utils/Themes';
import {StartChatIcon, ShareIcon} from '../../components/Icons';
import Modal from 'react-native-modal';

import Voice from '@react-native-voice/voice';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Tts from 'react-native-tts';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../../../config'; // Import your config file

function chat({navigation}) {
  const [showInput, setShowInput] = useState(false);
  const [showChatBubble, setShowChatBubble] = useState(false);
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef(null);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  // const [isHistoryVisible, setHistoryVisible] = useState(false);

  //  chat -----------------
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentChat, setCurrentChat] = useState(null);
  const [userName, setUserName] = useState('');

  // Animation values
  const circle1Opacity = useRef(new Animated.Value(0)).current;
  const circle2Opacity = useRef(new Animated.Value(0)).current;
  const circle3Opacity = useRef(new Animated.Value(0)).current;
  const circle1Scale = useRef(new Animated.Value(1)).current;
  const circle2Scale = useRef(new Animated.Value(1)).current;
  const circle3Scale = useRef(new Animated.Value(1)).current;

  // Add a focus listener to reset states when the screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset all states when screen comes into focus
      setIsListening(false);
      setIsResponding(false);
      setIsSpeaking(false);
      stopAnimation();

      // Reload the current chat
      loadCurrentChat();
    });

    return unsubscribe;
  }, [navigation]);

  // Load current chat when component mounts
  useEffect(() => {
    loadCurrentChat();
    setIsListening(false);
    setIsResponding(false);
    setIsSpeaking(false);
  }, []);

  // Initialize TTS settings
  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);

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

    return () => {
      Tts.removeEventListener('tts-start', handleTtsStart);
      Tts.removeEventListener('tts-finish', handleTtsFinish);
      Tts.removeEventListener('tts-cancel', handleTtsCancel);
    };
  }, []);

  // Set up Voice recognition with proper cleanup
  useEffect(() => {
    const setupVoiceListeners = () => {
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechRecognized = onSpeechRecognized;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechResults = onSpeechResults;
    };

    setupVoiceListeners();

    return () => {
      // Proper cleanup - first destroy then remove listeners
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
        // Reset states on unmount
        setIsListening(false);
        stopAnimation();
      });
    };
  }, []);

  // Create a new chat object only when absolutely necessary
  const createNewChat = () => ({
    id: Date.now().toString(),
    messages: [],
    createdAt: new Date(),
    title: `Chat ${new Date().toLocaleTimeString()}`,
  });

  // Load the current chat from AsyncStorage
  const loadCurrentChat = async () => {
    return;
    try {
      const storedChatsJson = await AsyncStorage.getItem('chatList');
      const storedChats = storedChatsJson ? JSON.parse(storedChatsJson) : [];

      if (storedChats.length === 0) {
        // If no chats exist at all, only then create a new one
        const newChat = createNewChat();
        storedChats.push(newChat);
        await AsyncStorage.setItem('chatList', JSON.stringify(storedChats));
        setCurrentChat(newChat);
      } else {
        // Use the most recent chat
        setCurrentChat(storedChats[storedChats.length - 1]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Save a message to the current chat
  const saveMessageToChat = async (userMessage, aiResponse) => {
    try {
      // If no current chat, load the most recent one
      if (!currentChat) {
        await loadCurrentChat();
      }

      // If we still don't have a current chat (which means there were no chats at all),
      // then we need to handle this case, but it should be rare
      if (!currentChat) {
        const storedChatsJson = await AsyncStorage.getItem('chatList');
        const storedChats = storedChatsJson ? JSON.parse(storedChatsJson) : [];

        // Check one more time if there are any chats now
        if (storedChats.length === 0) {
          // Only create a new chat if absolutely necessary
          const newChat = createNewChat();
          storedChats.push(newChat);
          await AsyncStorage.setItem('chatList', JSON.stringify(storedChats));
          setCurrentChat(newChat);

          // Now that we have a current chat, update it with the messages
          return await updateChatWithMessages(newChat, userMessage, aiResponse);
        } else {
          // Use the most recent chat that might have been created elsewhere
          const latestChat = storedChats[storedChats.length - 1];
          setCurrentChat(latestChat);
          return await updateChatWithMessages(
            latestChat,
            userMessage,
            aiResponse,
          );
        }
      }

      // Normal case: we have a current chat, so update it
      return await updateChatWithMessages(currentChat, userMessage, aiResponse);
    } catch (error) {
      console.error('Error saving message to chat:', error);
      return null;
    }
  };

  // Helper function to update a chat with messages
  const updateChatWithMessages = async (chat, userMessage, aiResponse) => {
    // Create a deep copy to avoid reference issues
    const updatedChat = JSON.parse(JSON.stringify(chat));

    // Ensure messages array exists
    if (!updatedChat.messages) {
      updatedChat.messages = [];
    }

    // Add user message
    if (userMessage) {
      updatedChat.messages.push({
        id: Date.now().toString(),
        text: userMessage,
        sender: 'user',
        timestamp: new Date(),
      });
    }

    // Add AI response if available
    if (aiResponse) {
      updatedChat.messages.push({
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      });
    }

    // Update the chat in storage
    const storedChatsJson = await AsyncStorage.getItem('chatList');
    const storedChats = storedChatsJson ? JSON.parse(storedChatsJson) : [];

    // Find and update the current chat in the list
    const chatIndex = storedChats.findIndex(c => c.id === updatedChat.id);
    if (chatIndex !== -1) {
      storedChats[chatIndex] = updatedChat;
    } else {
      // This should rarely happen, but if the chat isn't in the list, add it
      storedChats.push(updatedChat);
    }

    await AsyncStorage.setItem('chatList', JSON.stringify(storedChats));
    setCurrentChat(updatedChat);

    return updatedChat;
  };

  const checkNetworkConnectivity = async () => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
  };

  const onSpeechStart = () => {
    console.log('Speech started');
    // Explicitly set the listening state to true here
    setIsListening(true);
  };

  const onSpeechRecognized = () => {
    console.log('Speech recognized');
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    // Explicitly set the listening state to false here
    setIsListening(false);
    stopAnimation();
  };

  const onSpeechError = useCallback(
    async e => {
      console.error('Speech error:', e);
      // Explicitly set the listening state to false here
      setIsListening(false);
      stopAnimation();

      if (e.error.code === '2' && retryCount < MAX_RETRY) {
        // Network error, attempt retry
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
                  // Make sure states are reset before retrying
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
        // Other error or max retries reached
        Alert.alert(
          'Speech Recognition Error',
          'There was a problem with speech recognition. Please try again.',
        );
        setRetryCount(0);
      }
    },
    [retryCount],
  );

  const onSpeechResults = useCallback(
    async e => {
      console.log('Speech results:', e.value);
      // Make sure to set listening to false
      setIsListening(false);
      stopAnimation();

      if (e.value && e.value.length > 0) {
        const recognizedText = e.value[0];
        // setInputText(recognizedText);

        // Make sure we have a current chat
        if (!currentChat) {
          // await loadCurrentChat();
        }

        getAIResponse(recognizedText);
      }
    },
    [currentChat],
  );

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

  const getAIResponse = async userQuery => {
    try {
      // First ensure we're not in listening mode
      setIsListening(false);
      // Then set responding to true
      setIsResponding(true);

      // Make sure we have a currentChat before proceeding
      if (!currentChat) {
        // await loadCurrentChat();
      }

      // Save user message first
      // const updatedChatWithUserMsg = await saveMessageToChat(userQuery, null);

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{role: 'user', content: userQuery}],
        },
        {
          headers: {
            Authorization: `Bearer ${Config.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const aiResponse = response.data.choices[0].message.content.trim();
      console.log('AI Response:', aiResponse);

      // Update chat with AI response
      // await updateChatWithMessages(updatedChatWithUserMsg, null, aiResponse);
      // setInputText(aiResponse);
      // Set responding to false before speaking
      setIsResponding(false);

      // Speak the response
      speakResponse(aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      Alert.alert('Error', 'Failed to get response. Try again.');
      return null;
    } finally {
      // Ensure responding is set to false in all cases
      setIsResponding(false);
    }
  };

  const speakResponse = text => {
    if (!text) return;

    // Stop any ongoing speech before starting new one
    Tts.stop().then(() => {
      // Set speaking state explicitly before speaking
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

  const startAnimation = () => {
    // Reset animation values first
    stopAnimation();

    circle1Opacity.setValue(0.7);
    circle2Opacity.setValue(0.5);
    circle3Opacity.setValue(0.3);
    circle1Scale.setValue(1);
    circle2Scale.setValue(1);
    circle3Scale.setValue(1);

    Animated.loop(
      Animated.parallel([
        Animated.timing(circle1Scale, {
          toValue: 1.5,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(circle1Opacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(circle2Scale, {
          toValue: 1.5,
          duration: 2000,
          delay: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(circle2Opacity, {
          toValue: 0,
          duration: 2000,
          delay: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(circle3Scale, {
          toValue: 1.5,
          duration: 2000,
          delay: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(circle3Opacity, {
          toValue: 0,
          duration: 2000,
          delay: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopAnimation = () => {
    circle1Opacity.stopAnimation();
    circle2Opacity.stopAnimation();
    circle3Opacity.stopAnimation();
    circle1Scale.stopAnimation();
    circle2Scale.stopAnimation();
    circle3Scale.stopAnimation();

    // Reset animation values
    circle1Opacity.setValue(0);
    circle2Opacity.setValue(0);
    circle3Opacity.setValue(0);
  };

  const startListening = async () => {
    try {
      // First reset all states
      setIsListening(false);
      setIsResponding(false);
      setIsSpeaking(false);
      // stopAnimation();

      // Stop any ongoing TTS
      await Tts.stop();

      // Reset Voice
      await Voice.destroy();
      console.log('Voice', Voice);
      // Re-setup Voice listeners
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechRecognized = onSpeechRecognized;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechResults = onSpeechResults;

      // Always fetch the most recent chat before starting
      // await loadCurrentChat();

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

      // Set listening state before starting Voice
      // startAnimation();

      // Start Voice recognition
      if (Voice) {
        setIsListening(true);
        console.log('Voice-------', Voice);
        await Voice.start('en-US');
      } else {
        console.log('Voice is not initialized');
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      // Reset state on error
      setIsListening(false);
      // stopAnimation();
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
        // stopAnimation();
      }
    }
  };

  const isButtonDisabled = isListening || isResponding || isSpeaking;

  // --------------chat end------------------------

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  }, [messages]);

  const handleChatClick = async () => {
    if (!chatText.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
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
      console.log(botResponse, 'botResponse');
      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'ai',
      };

      setMessages(prevMessages => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.log('API Error:', error?.request);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.userImageContainer}>
        <TouchableOpacity
          onPress={() => setDropdownVisible(!isDropdownVisible)}>
          <Image
            source={require('../../assets/Images/profile-user.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <Modal
          isVisible={isDropdownVisible}
          onBackdropPress={() => setDropdownVisible(false)}
          backdropOpacity={0}
          style={styles.modal}>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setDropdownVisible(false);
                setMessages([]);
                setShowInput(false);
              }}>
              <Text style={styles.menuText}>New Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setDropdownVisible(false);
                navigation.navigate('Profile');
              }}>
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setDropdownVisible(false);
                setHistoryVisible(true);
              }}>
              <Text style={styles.menuText}>History</Text>
            </TouchableOpacity> */}
          </View>
        </Modal>

        {/* Bottom Drawer (History) */}
        {/* <Modal
          isVisible={isHistoryVisible}
          onBackdropPress={() => setHistoryVisible(false)}
          swipeDirection="down"
          onSwipeComplete={() => setHistoryVisible(false)}
          style={styles.bottomModal}>
          <View style={styles.bottomDrawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Chat History</Text>
              <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.historyList}>
              <Text style={styles.historyItem}>Chat 1</Text>
              <Text style={styles.historyItem}>Chat 2</Text>
              <Text style={styles.historyItem}>Chat 3</Text>
            </View>
          </View>
        </Modal> */}
      </View>

      {!showInput && (
        <View style={styles.gennieImageContainer}>
          <Image source={require('../../assets/Images/gennie.png')} />
        </View>
      )}
      {!showInput && !showChatBubble && (
        <TouchableOpacity
          onPress={() => {
            if (isButtonDisabled) {
              // If currently active, stop the current process
              if (isListening) {
                stopListening();
              }
              if (isSpeaking) {
                Tts.stop();
              }
            } else {
              // Otherwise start listening
              startListening();
            }
          }}
          activeOpacity={0.7}
          style={{opacity: isButtonDisabled ? 0.5 : 1}}>
          <Text style={styles.talkText}>
            {isListening
              ? 'Listening...'
              : isResponding
              ? 'Processing...'
              : isSpeaking
              ? 'Speaking...'
              : 'Tap to Talk'}
          </Text>
        </TouchableOpacity>
      )}
      {showInput && messages.length > 0 && (
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
                key={index}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userMessage : styles.aiMessage,
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
                source={require('../../assets/Images/gennie.png')}
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
  container: {
    flex: 1,
  },
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
    borderColor: '#FFFFFF',
    width: 100,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#282828',
    fontFamily: FontFamily.TimeRoman,
    fontWeight: '400',
  },

  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomDrawer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: -2},
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 16,
    color: 'red',
  },
  historyList: {
    paddingVertical: 10,
  },
  historyItem: {
    paddingVertical: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  chatContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.56)',
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
    borderColor: '#FFFFFF',
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
    fontFamily: FontFamily.TimeRoman,
    fontWeight: '400',
  },
  aiText: {
    fontSize: 13,
    color: '#4A05AD',
    fontFamily: FontFamily.TimeRoman,
    fontWeight: '400',
  },

  userImageContainer: {
    paddingTop: 25,
    paddingRight: 10,
    display: 'flex',
    alignItems: 'flex-end',
  },
  gennieImageContainer: {
    paddingTop: 25,
    paddingRight: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 35,
    height: 35,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 60,
    backgroundColor: '#D9D9D9',
  },
  talkText: {
    fontWeight: '400',
    fontSize: 21,
    color: Colors.white,
    fontFamily: FontFamily.TimeRoman,
    textAlign: 'center',
  },
  startChatContainer: {
    backgroundColor: Colors.white,
    width: 40,
    height: 40,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  inputStyle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FontFamily.TimeRoman,
    fontWeight: '400',
    color: '#5A5A5A',
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 8,
    backgroundColor: Colors.white,
    paddingLeft: 14,
    paddingRight: 40,
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

export default chat;
