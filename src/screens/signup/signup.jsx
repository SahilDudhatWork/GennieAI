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
import {appleAuth} from '@invertase/react-native-apple-authentication';
import i18n from '../../localization/i18n';

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
        setProfileImage(response.assets[0].uri);
      }
    });
  };
  const handleSignUp = () => {
    const errors = {};
    setEmailTaken('');
    if (userData.fullName.length < 3 || userData.fullName.length > 15) {
      errors.fullName = i18n.t('common.nameMustbe');
    } else {
      errors.fullName = '';
    }

    if (!userData.email.trim()) {
      errors.email = errors.email = i18n.t('common.emailIsRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.email = emailRegex.test(userData.email)
        ? ''
        : i18n.t('common.invalidEmailFormat');
    }
    if (!userData.mobile.trim()) {
      errors.mobile = i18n.t('common.phoneNumberIsRequired');
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      errors.mobile = phoneRegex.test(userData.mobile)
        ? ''
        : i18n.t('common.invalidPhoneNumberFormat');
    }

    if (userData.password.length < 6) {
      errors.password = i18n.t('common.passwordMustBe');
    } else {
      errors.password = '';
    }

    setValidationErrors(errors);
    console.log('errors', errors);
    if (Object.values(errors).some(error => error !== '')) {
      return;
    }
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
          const isTermsConditions = await AsyncStorage.getItem(
            'isTermsConditions',
          );
          const isOnbording = await AsyncStorage.getItem('isOnbording');
          const isLanguage = await AsyncStorage.getItem('isLanguage');
          if (!isLanguage) {
            navigation.navigate('SelectLanguage');
          } else if (!isTermsConditions) {
            navigation.navigate('TermsConditions');
          } else if (!isOnbording) {
            navigation.navigate('isOnbording');
          } else {
            navigation.navigate('Main', {screen: 'Chat'});
          }
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
          if (res?.data?.accessToken) {
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem(
              'token',
              JSON.stringify(res?.data?.accessToken),
            );
            const isTermsConditions = await AsyncStorage.getItem(
              'isTermsConditions',
            );
            const isOnbording = await AsyncStorage.getItem('isOnbording');
            const isLanguage = await AsyncStorage.getItem('isLanguage');
            if (!isLanguage) {
              navigation.navigate('SelectLanguage');
            } else if (!isTermsConditions) {
              navigation.navigate('TermsConditions');
            } else if (!isOnbording) {
              navigation.navigate('isOnbording');
            } else {
              navigation.navigate('Main', {screen: 'Chat'});
            }
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
        Alert.alert(
          i18n.t('common.error'),
          i18n.t('common.googlePlayServicesNotAvailable'),
        );
      } else {
        Alert.alert(
          i18n.t('common.error'),
          i18n.t('common.somethingWentWrongGoogle'),
        );
      }
    }
  };

  // Apple Sign-In implementation
  const handleAppleLogin = async () => {
    // Check if Apple Authentication is available (iOS 13+)
    if (!appleAuth.isSupported) {
      Alert.alert(
        i18n.t('common.error'),
        i18n.t('common.appleSignOnlyAvailable'),
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
        appleAuthRequestResponse.user,
      );

      if (credentialState === appleAuth.State.AUTHORIZED) {
        const {user, email, fullName} = appleAuthRequestResponse;
        if (fullName) {
          const displayName = `${fullName.givenName} ${fullName.familyName}`;
          const emailData = `${fullName.givenName}${fullName.familyName}@gmail.com`;
          const userData = {
            fullName: displayName,
            email: emailData,
            loginType: 'Apple',
            password: 'null',
            appleId: user,
          };

          setLoading(true);
          axios
            .post('/v1/user/auth/signUp', userData)
            .then(async res => {
              if (res?.data?.accessToken) {
                await AsyncStorage.setItem(
                  'userData',
                  JSON.stringify(userData),
                );
                await AsyncStorage.setItem(
                  'token',
                  JSON.stringify(res?.data?.accessToken),
                );
                await AsyncStorage.setItem('appleUserId', JSON.stringify(user));
                const isTermsConditions = await AsyncStorage.getItem(
                  'isTermsConditions',
                );
                const isOnbording = await AsyncStorage.getItem('isOnbording');
                const isLanguage = await AsyncStorage.getItem('isLanguage');
                if (!isLanguage) {
                  navigation.navigate('SelectLanguage');
                } else if (!isTermsConditions) {
                  navigation.navigate('TermsConditions');
                } else if (!isOnbording) {
                  navigation.navigate('isOnbording');
                } else {
                  navigation.navigate('Main', {screen: 'Chat'});
                }
              }
            })
            .catch(error => {
              console.log(error?.request, 'error?.request');
            })
            .finally(() => setLoading(false));
        }
      } else {
        Alert.alert(i18n.t('common.error'), i18n.t('common.appleSignFailed'));
      }
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.log('User cancelled Apple Sign-In');
      } else {
        console.error('Apple Sign-In Error:', error);
      }
      console.log('Error during Apple sign in:', error);
      Alert.alert(
        i18n.t('common.error'),
        i18n.t('common.somethingWentWrongApple'),
      );
    }
  };

  const handleBackNext = () => {
    navigation.goBack();
  };

  return (
    <>
      <ScreenWrapper isSpecialBg={true}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex: 1}}>
              <ScrollView
                style={styles.container}
                contentContainerStyle={{paddingBottom: 40}}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View>
                  <BackButton handleBackNext={handleBackNext} />
                </View>
                <View style={{paddingTop: 30}}>
                  <Text style={styles.signUpText}>
                    {i18n.t('signUpPage.signUp')}
                  </Text>
                </View>

                {/* Name */}
                <View style={{paddingTop: 20}}>
                  <Text style={styles.lableText}>{i18n.t('common.name')}</Text>
                  <View style={styles.inputWrapper}>
                    <EmailIcon style={styles.iconStyle} />
                    <TextInput
                      style={styles.inputStyle}
                      placeholder={i18n.t('common.enterName')}
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
                  <Text style={styles.lableText}>{i18n.t('common.email')}</Text>
                  <View style={styles.inputWrapper}>
                    <EmailIcon style={styles.iconStyle} />
                    <TextInput
                      style={styles.inputStyle}
                      placeholder={i18n.t('common.enterEmail')}
                      placeholderTextColor="#575757"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={text =>
                        setUserData({...userData, email: text})
                      }
                    />
                    {validationErrors?.email && (
                      <Text style={styles.errorText}>
                        {validationErrors?.email}
                      </Text>
                    )}
                    {emailTaken != '' && (
                      <Text style={styles.errorText}>{emailTaken}</Text>
                    )}
                  </View>
                </View>

                {/* Phone number */}
                <View style={{paddingTop: 10}}>
                  <Text style={styles.lableText}>
                    {i18n.t('common.phoneNumber')}
                  </Text>
                  <View style={styles.inputWrapper}>
                    <LockIcon style={styles.iconStyle} />
                    <TextInput
                      style={styles.inputStyle}
                      placeholder={i18n.t('common.enterPhoneNumber')}
                      placeholderTextColor="#575757"
                      autoCapitalize="none"
                      keyboardType="numeric"
                      onChangeText={text =>
                        setUserData({...userData, mobile: text})
                      }
                    />

                    {validationErrors?.mobile && (
                      <Text style={styles.errorText}>
                        {validationErrors?.mobile}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Password */}
                <View style={{paddingTop: 10}}>
                  <Text style={styles.lableText}>
                    {i18n.t('common.password')}
                  </Text>
                  <View style={styles.inputWrapper}>
                    <LockIcon style={styles.iconStyle} />
                    <TextInput
                      style={styles.inputStyle}
                      placeholder={i18n.t('common.enterPassword')}
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
                    <Text style={styles.buttonSigUpText}>
                      {i18n.t('signUpPage.signUp')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 20,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: Colors.darkGray,
                    }}
                  />
                  <Text style={styles.orSignUpText}>
                    {i18n.t('signUpPage.orSignUpWith')}
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: Colors.darkGray,
                    }}
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
                    {i18n.t('signUpPage.iHaveAnAccount')}?{' '}
                    <Text
                      style={{
                        textDecorationLine: 'underline',
                        color: Colors.deepViolet,
                      }}
                      onPress={() => {
                        navigation.navigate('Login');
                      }}>
                      {i18n.t('common.login')}
                    </Text>
                  </Text>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScreenWrapper>

      {loading && (
        <View style={styles.loadingOverlay}>
          <DotIndicator color="#4A05ADCC" size={15} />
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
