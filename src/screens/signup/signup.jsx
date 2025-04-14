import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {FontFamily, Colors} from '../../../Utils/Themes';
import ScreenWrapper from '../../components/ScreenWrapper';
// import DocumentPicker from 'react-native-document-picker';

import {launchImageLibrary} from 'react-native-image-picker';
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

function Signup({navigation}) {
  const [profileImage, setProfileImage] = useState(null);
  const [emailTaken, setEmailTaken] = useState('');
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    profileImage: null,
    loginType: 'Web',
  });
  const [loading, setLoading] = useState(false);

  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
  });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  const handleImagePick = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && !response.error) {
        console.log(response, 'response');
        setProfileImage(response.assets[0].uri);
      }
    });
  };
  const handleSignUp = () => {
    const errors = {};
    setEmailTaken('');
    console.log('userData.name', userData);
    if (userData.fullName.length < 3 || userData.fullName.length > 15) {
      errors.fullName = 'name must be between 3 and 15 characters.';
    } else {
      errors.fullName = '';
    }

    if (!userData.email.trim()) {
      errors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.email = emailRegex.test(userData.email)
        ? ''
        : 'Invalid email format.';
    }
    if (!userData.mobile.trim()) {
      errors.mobile = 'Phone number is required.';
    } else {
      const phoneRegex = /^[0-9]{10}$/; // Adjust as per your requirements
      errors.mobile = phoneRegex.test(userData.mobile)
        ? ''
        : 'Invalid phone number format.';
    }

    if (userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    } else {
      errors.password = '';
    }

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      return;
    }
    setLoading(true);
    axios
      .post('/v1/user/auth/signUp', userData)
      .then(async res => {
        console.log('res', res.data);
        if (res?.data?.accessToken) {
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
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
          let errEmail = JSON.parse(errData)?.msg;
          if (errEmail) {
            setEmailTaken(errEmail);
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
        password: 'null',
      };
      setLoading(true);
      axios
        .post('/v1/user/auth/signUp', userData)
        .then(async res => {
          console.log('res', res.data);
          if (res?.data?.accessToken) {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
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
              password: 'null',
            };

            setLoading(true);
            axios
              .post('/v1/user/auth/signUp', userData)
              .then(async res => {
                if (res?.data?.accessToken) {
                  await AsyncStorage.setItem('userData', JSON.stringify(userData));
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
      <ScreenWrapper isSpecialBg={true}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <View>
            <BackButton />
          </View>
          <View style={{paddingTop: 30}}>
            <Text style={styles.signUpText}>Sign up</Text>
          </View>

          {/* Name */}
          <View style={{paddingTop: 20}}>
            <Text style={styles.lableText}>Name</Text>
            <View style={styles.inputWrapper}>
              <EmailIcon style={styles.iconStyle} />
              <TextInput
                style={styles.inputStyle}
                placeholder="Enter your name"
                placeholderTextColor="#575757"
                autoCapitalize="none"
                onChangeText={text =>
                  setUserData({...userData, fullName: text})
                }
              />
              {validationErrors?.fullName && (
                <Text style={styles.errorText}>
                  {validationErrors?.fullName}
                </Text>
              )}
            </View>
          </View>

          {/* Email */}
          <View style={{paddingTop: 10}}>
            <Text style={styles.lableText}>Email</Text>
            <View style={styles.inputWrapper}>
              <EmailIcon style={styles.iconStyle} />
              <TextInput
                style={styles.inputStyle}
                placeholder="Enter your email"
                placeholderTextColor="#575757"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={text => setUserData({...userData, email: text})}
              />
              {validationErrors?.email && (
                <Text style={styles.errorText}>{validationErrors?.email}</Text>
              )}
              {emailTaken != '' && (
                <Text style={styles.errorText}>{emailTaken}</Text>
              )}
            </View>
          </View>

          {/* Phone number */}
          <View style={{paddingTop: 10}}>
            <Text style={styles.lableText}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <LockIcon style={styles.iconStyle} />
              <TextInput
                style={styles.inputStyle}
                placeholder="Enter your number"
                placeholderTextColor="#575757"
                autoCapitalize="none"
                keyboardType="numeric"
                onChangeText={text => setUserData({...userData, mobile: text})}
              />

              {validationErrors?.mobile && (
                <Text style={styles.errorText}>{validationErrors?.mobile}</Text>
              )}
            </View>
          </View>

          {/* Password */}
          <View style={{paddingTop: 10}}>
            <Text style={styles.lableText}>Password</Text>
            <View style={styles.inputWrapper}>
              <LockIcon style={styles.iconStyle} />
              <TextInput
                style={styles.inputStyle}
                placeholder="Enter your password"
                placeholderTextColor="#575757"
                secureTextEntry
                autoCapitalize="none"
                onChangeText={text =>
                  setUserData({...userData, password: text})
                }
              />
              {validationErrors?.password && (
                <Text style={styles.errorText}>
                  {validationErrors?.password}
                </Text>
              )}
            </View>
          </View>

          <View>
            <TouchableOpacity
              style={styles.buttonSignUp}
              onPress={handleSignUp}>
              <Text style={styles.buttonSigUpText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 20,
            }}>
            <View
              style={{flex: 1, height: 1, backgroundColor: Colors.darkGray}}
            />
            <Text style={styles.orSignUpText}>Or sign up with</Text>
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
          <View style={{paddingTop: 25, paddingBottom: 30}}>
            <Text style={styles.accountText}>
              I have an account?{' '}
              <Text
                style={{
                  textDecorationLine: 'underline',
                  color: Colors.deepViolet,
                }}
                onPress={() => {
                  navigation.navigate('Login');
                }}>
                Login
              </Text>
            </Text>
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
  buttonSigUpText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FontFamily.SpaceGrotesk,
  },
  accountText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.darkGray,
    fontFamily: FontFamily.SpaceGrotesk,
    textAlign: 'center',
  },
  orSignUpText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.darkGray,
    fontFamily: FontFamily.SpaceGrotesk,
    paddingHorizontal: 30,
  },
  signUpText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.deepViolet,
    fontSize: 22,
    fontWeight: '600',
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
    fontSize: 14,
    color: Colors.darkGray,
    fontFamily: FontFamily.SpaceGrotesk,
    width: '100%',
    fontWeight: '400',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  lableText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.darkGray,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: '400',
  },
  buttonSignUp: {
    backgroundColor: Colors.deepViolet,
    borderRadius: 22,
    width: '100%',
    marginTop: 30,
    padding: 12,
  },
  signupOr: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    paddingVertical: 15,
  },
  errorText: {
    color: Colors.darkRed,
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 15,
  },
});
export default Signup;
