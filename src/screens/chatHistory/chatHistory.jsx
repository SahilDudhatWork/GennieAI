import React, {useCallback, useEffect, useState} from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import {Colors, FontFamily} from '../../../Utils/Themes';
import {
  MessageIcon,
  MicroPhoneIcon,
  SideArrowIcon,
} from '../../components/Icons';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {BlurView} from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ChatHistory({navigation}) {
  const [chatHistory, setChatHistory] = useState([]);

  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      if (route.params?.setSelectedTab) {
        route.params.setSelectedTab('History');
      }
      fetchData();
    }, [route.params]),
  );

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, []);

  const formatDate = timestamp => {
    const messageDate = new Date(Number(timestamp));
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const fetchData = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('chatMessages');
      let storedChatArray = storedMessages ? JSON.parse(storedMessages) : [];
      if (storedChatArray.length === 0) {
        Alert.alert(
          'No Chat History',
          'Your chat history is empty. Start a conversation now to see your history here!',
        );
        return;
      }

      const groupedChats = storedChatArray.reduce((acc, message) => {
        const dateLabel = formatDate(message.id);

        if (!message.chatId) {
          return acc;
        }

        if (!acc[dateLabel]) {
          acc[dateLabel] = {};
        }

        if (!acc[dateLabel][message.chatId]) {
          acc[dateLabel][message.chatId] = {
            firstMessage: message,
            messages: [],
          };
        }

        acc[dateLabel][message.chatId].messages.push(message);
        return acc;
      }, {});

      setChatHistory(groupedChats);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      Alert.alert('Error', 'Failed to load chat history.');
    }
  };

  return (
    <ScreenWrapper style={{padding: 0}} isSpecialBg={true}>
      <View style={styles.container}>
        <View style={styles.historyContainer}>
          <Text style={styles.historyText}>History</Text>
        </View>
        <BlurView
          style={styles.drawerBlur}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white">
          <View style={styles.drawer}>
            {Object.keys(chatHistory).length === 0 ? (
              <View style={styles.noHistoryContainer}>
                <Text style={styles.noHistoryText}>No chat history found</Text>
              </View>
            ) : (
              <FlatList
                data={Object.entries(chatHistory).reverse()}
                keyExtractor={(item, index) => index}
                renderItem={({item}) => {
                  const [dateLabel, chats] = item;
                  return (
                    <View>
                      <Text style={styles.dateHeader}>{dateLabel}</Text>
                      {Object.values(chats)
                        .sort((a, b) => b.firstMessage.id - a.firstMessage.id)
                        .map(chat => (
                          <TouchableOpacity
                            key={String(chat.chatId || Math.random())}
                            onPress={() =>
                              navigation.navigate('Main', {
                                screen: 'Chat',
                                params: {
                                  fromHistory: true,
                                  chatId: chat.firstMessage.chatId,
                                },
                              })
                            }
                            style={styles.chatItem}>
                            {chat.firstMessage.type === 'speak' ? (
                              <View style={styles.microPhoneIcon}>
                                <MicroPhoneIcon />
                              </View>
                            ) : (
                              <View style={styles.chatIcon}>
                                <MessageIcon />
                              </View>
                            )}
                            <Text style={styles.chatText} numberOfLines={1}>
                              {chat.firstMessage.text}{' '}
                            </Text>
                            <SideArrowIcon />
                          </TouchableOpacity>
                        ))}
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </BlurView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  historyText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.deepViolet,
    fontSize: 17,
    fontWeight: '700',
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

  noHistoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },

  noHistoryText: {
    fontSize: 16,
    color: Colors.darkGray,
  },

  historyContainer: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  drawerBlur: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 15,
    marginBottom: 20,
    flex: 1,
  },

  drawer: {
    flex: 1,
    borderRadius: 30,
    padding: 20,
    backgroundColor: '#C6B0F91A',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  dateHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.deepViolet,
    fontFamily: FontFamily.SpaceGrotesk,
    marginBottom: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 100,
    paddingRight: 16,
    paddingLeft: 7,
    paddingVertical: 7,
    marginVertical: 6,
  },
  microPhoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#4A05AD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    padding: 4,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#FFB341',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    padding: 4,
  },
  chatText: {
    flex: 1,
    fontSize: 14,
    color: '#494949E5',
    fontWeight: '400',
    fontFamily: FontFamily.SpaceGrotesk,
  },
  chatContainer: {
    flex: 1,
    padding: 10,
    marginBottom: 60,
    marginTop: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
export default ChatHistory;
