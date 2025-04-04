import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context'; // Import SafeAreaProvider
import Splash from './src/screens/splash/Splash';
import Login from './src/screens/login/Login';
import Signup from './src/screens/signup/Signup';
import SelectLanguage from './src/screens/selectLanguage/SelectLanguage';
import ForgotPassword from './src/screens/forgotPassword/ForgotPassword';
import OtpSent from './src/screens/otpSent/OtpSent';
import CreatePassword from './src/screens/createPassword/CreatePassword';
import Profile from './src/screens/profile/Profile';
import Chat from './src/screens/chat/Chat';

const Stack = createStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      {/* Wrap the app in SafeAreaProvider */}
      <StatusBar
        barStyle="light-content" // Change status bar style to light (optional)
        translucent={true} // Make the status bar transparent
        backgroundColor="transparent" // Set background to transparent
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShadowVisible: false,
          }}>
          <Stack.Screen
            name="Splash"
            component={Splash}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="OtpSent"
            component={OtpSent}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CreatePassword"
            component={CreatePassword}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SelectLanguage"
            component={SelectLanguage}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});

export default App;
