import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context'; // Import SafeAreaProvider
import Splash from './src/screens/splash/splash';
import Login from './src/screens/login/login';
import Signup from './src/screens/signup/signup';
import SelectLanguage from './src/screens/selectLanguage/selectLanguage';
import ForgotPassword from './src/screens/forgotPassword/forgotPassword';
import OtpSent from './src/screens/otpSent/otpSent';
import CreatePassword from './src/screens/createPassword/createPassword';
import Onboarding from './src/screens/onboarding/onboarding';
import BottomTabs from './src/navigation/BottomTabs';

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
            name="Onboarding"
            component={Onboarding}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SelectLanguage"
            component={SelectLanguage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Main"
            component={BottomTabs}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});

export default App;
