import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import {Colors, FontFamily} from '../../../Utils/Themes';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import axios from '../../../axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {DotIndicator} from 'react-native-indicators';
import Config from '../../../config';
import {EmailIcon, LockIcon} from '../../components/Icons';
import { appleAuth } from "@invertase/react-native-apple-authentication";

function Login({navigation}) {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    loginType: 'Web',
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });
  const [apiErrorMsg, setApiErrorMsg] = useState('');

  const Height = Dimensions.get('window').height;
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);
  const handleLogin = () => {
    const errors = {};
    setApiErrorMsg('');

    if (!userData?.email?.trim()) {
      errors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.email = emailRegex.test(userData.email)
        ? ''
        : 'Invalid email format.';
    }

    if (!userData?.password?.trim()) {
      errors.password = 'Password is required.';
    } else {
      errors.password = '';
    }

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      return;
    }
    setLoading(true);
    axios
      .post('/v1/user/auth/login', userData)
      .then(async res => {
        console.log('res', res.data);
        if (res?.data?.accessToken) {
          await AsyncStorage.setItem(
            'token',
            JSON.stringify(res?.data?.accessToken),
          );
          navigation.navigate('Main', {screen: 'Chat'});
        }
      })
      .catch(error => {
        console.log(error?.request);
        if (error?.request?._response) {
          let errData = error?.request?._response;
          let apiError = JSON.parse(errData)?.msg;
          if (apiError) {
            setApiErrorMsg(apiError);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const userData = {
        fullName: userInfo.data.user.name,
        email: userInfo.data.user.email,
        loginType: 'Google',
      };
      setLoading(true);
      axios
        .post('/v1/user/auth/login', userData)
        .then(async res => {
          console.log('res', res.data);
          if (res?.data?.accessToken) {
            await AsyncStorage.setItem(
              'token',
              JSON.stringify(res?.data?.accessToken),
            );
            navigation.navigate('Main', {screen: 'Chat'});
          }
        })
        .catch(error => {
          console.log(error?.request, 'error?.request');
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.log('Error during Google sign in:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
        Alert.alert('Error', 'Google Play Services are not available');
      } else {
        Alert.alert('Error', 'Something went wrong with Google Sign-In');
      }
    }
  };
   // Apple Sign-In implementation
    const handleAppleLogin = async () => {
      // Check if Apple Authentication is available (iOS 13+)
      if (!appleAuth.isSupported) {
        Alert.alert(
          "Error",
          "Apple Sign In is only available on iOS 13 and above"
        );
        return;
      }
      try {
        // Perform the apple sign-in request
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
  
        // Get the credential state
        const credentialState = await appleAuth.getCredentialStateForUser(
          appleAuthRequestResponse.user
        );
  
        if (credentialState === appleAuth.State.AUTHORIZED) {
        
          const { user, email, fullName } = appleAuthRequestResponse;
          if (fullName) {
            const displayName = `${fullName.givenName} ${fullName.familyName}`;
            const emailData = `${fullName.givenName}${fullName.familyName}@gmail.com`;
            const userData = {
              fullName: displayName,
              email: emailData,
              loginType: 'Apple',
            };

            setLoading(true);
            axios
              .post('/v1/user/auth/login', userData)
              .then(async res => {
                console.log('res', res.data);
                if (res?.data?.accessToken) {
                  await AsyncStorage.setItem(
                    'token',
                    JSON.stringify(res?.data?.accessToken),
                  );
                  await AsyncStorage.setItem(
                    'appleUserId',
                    JSON.stringify(user),
                  );
                  navigation.navigate('Main', {screen: 'Chat'});
                }
              })
              .catch(error => {
                console.log(error?.request, 'error?.request');
              })
              .finally(() => setLoading(false));
          }
        } else {
          Alert.alert("Error", "Apple Sign In failed");
        }
      } catch (error) {
        if (error.code === appleAuth.Error.CANCELED) {
          console.log('User cancelled Apple Sign-In');
        } else {
          console.error('Apple Sign-In Error:', error);
        }
        console.log("Error during Apple sign in:", error);
        Alert.alert("Error", "Something went wrong with Apple Sign-In");
      }
    };

  return (
    <>
      <ScreenWrapper>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              height: Height - 40,
            }}>
            <View>
              <BackButton />
            </View>
            <View style={styles.inputSeaction}>
              <Text style={styles.loginTitleText}>Login</Text>
              <Text style={styles.welcomeBackText}>
                Welcome back to the app
              </Text>
            </View>
            <View>
              <View style={styles.inputSeaction}>
                <Text style={styles.lableText}>Email</Text>
                <View style={styles.inputWrapper}>
                  <EmailIcon style={styles.iconStyle} />
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.darkGray}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={text =>
                      setUserData({...userData, email: text})
                    }
                  />
                </View>
              </View>
              {validationErrors?.email && (
                <Text style={styles.errorText}>{validationErrors?.email}</Text>
              )}
              {apiErrorMsg != '' && (
                <Text style={styles.errorText}>{apiErrorMsg}</Text>
              )}
              {/* Password */}
              <View style={{paddingTop: 10}}>
                <Text style={styles.lableText}>Password</Text>
                <View style={styles.inputWrapper}>
                  <LockIcon style={styles.iconStyle} />
                  <TextInput
                    style={styles.inputStyle}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.darkGray}
                    secureTextEntry
                    autoCapitalize="none"
                    onChangeText={text =>
                      setUserData({...userData, password: text})
                    }
                  />
                </View>
              </View>
              {validationErrors?.password && (
                <Text style={styles.errorText}>
                  {validationErrors?.password}
                </Text>
              )}
              <View>
                <Text
                  onPress={() => {
                    navigation.navigate('ForgotPassword');
                  }}
                  style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </View>

              
                <TouchableOpacity
                  style={styles.buttonLogin}
                  onPress={handleLogin}>
                  <Text style={styles.buttonLoginText}>Login</Text>
                </TouchableOpacity>
              

              <View style={styles.orSignContainer}>
                <View
                  style={{flex: 1, height: 1, backgroundColor: Colors.darkGray}}
                />
                <Text style={styles.orSignText}>Or sign in with</Text>
                <View
                  style={{flex: 1, height: 1, backgroundColor: Colors.darkGray}}
                />
              </View>
              <View style={styles.signupOr}>
                <TouchableOpacity onPress={handleGoogleLogin}>
                  <Image
                    source={require('../../assets/Images/auth/google.png')}
                    style={{width: 40, height: 40}}
                  />
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity onPress={handleAppleLogin}>
                    <Image
                      source={require('../../assets/Images/auth/apple.png')}
                      style={{width: 40, height: 40}}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={{position: 'absolute', bottom: 50, width: '100%'}}>
              <Text style={styles.accountText}>
                Don’t have an account?{' '}
                <Text
                  style={{
                    textDecorationLine: 'underline',
                    color: Colors.deepViolet,
                  }}
                  onPress={() => {
                    navigation.navigate('Signup');
                  }}>
                  Create an account
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </ScreenWrapper>
      {loading && (
        <View style={styles.loadingOverlay}>
          <DotIndicator color="#4A05AD" size={15} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  buttonLoginText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FontFamily.SpaceGrotesk,
  },
  buttonLogin: {
    backgroundColor: Colors.deepViolet,
    borderRadius: 22,
    width: '100%',
    marginTop: 30,
    padding: 12,
  },
  loginTitleText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.deepViolet,
    fontSize: 22,
    fontWeight: '700',
  },
  welcomeBackText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.darkGray,
    fontSize: 13,
    paddingTop: 5,
    fontWeight: '400',
  },
  accountText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.darkGray,
    fontFamily: FontFamily.SpaceGrotesk,
    textAlign: 'center',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '400',
    paddingTop: 10,
    color: Colors.darkGray,
    textAlign: 'right',
    paddingHorizontal: 5,
    fontFamily: FontFamily.SpaceGrotesk,
    textDecorationLine: 'underline',
  },
  orSignText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.darkGray,
    fontFamily: FontFamily.SpaceGrotesk,
    paddingHorizontal: 30,
  },
  orSignContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.darkGray,
    borderRadius: 12,
    backgroundColor: '#FFFFFF59',
    paddingHorizontal: 10,
  },

  iconStyle: {
    marginRight: 10,
  },
  inputStyle: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkGray,
    fontFamily: FontFamily.SpaceGrotesk,
    width: '100%',
    fontWeight: '400',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  lableText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.darkGray,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: '400',
  },
  signupOr: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    paddingVertical: 15,
  },
  inputSeaction: {
    paddingTop: 40,
  },
  errorText: {
    color: Colors.darkRed,
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 15,
  },
});
export default Login;

