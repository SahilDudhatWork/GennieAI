import React, {useEffect, useState} from 'react';
import {Keyboard, SafeAreaView} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Chat from '../screens/chat/chat';
import ChatHistory from '../screens/chatHistory/chatHistory';
import UpdateProfile from '../screens/profile/profile';
import BottomNavigator from '../components/bottomNavigator';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const [selectedTab, setSelectedTab] = useState('Chat');
  const [keyboardShown, setKeyboardShown] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShown(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShown(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={({navigation}) =>
        !keyboardShown && (
          <SafeAreaView edges={['bottom']} style={{backgroundColor: 'white'}}>
            <BottomNavigator
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              navigation={navigation}
            />
          </SafeAreaView>
        )
      }>
      <Tab.Screen
        name="Chat"
        component={Chat}
        initialParams={{setSelectedTab}}
      />
      <Tab.Screen
        name="History"
        component={ChatHistory}
        initialParams={{setSelectedTab}}
      />
      <Tab.Screen
        name="Profile"
        component={UpdateProfile}
        initialParams={{setSelectedTab}}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
