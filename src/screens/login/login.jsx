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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
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
import {appleAuth} from '@invertase/react-native-apple-authentication';
import i18n from '../../localization/i18n';

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
      errors.email = i18n.t('common.emailIsRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.email = emailRegex.test(userData.email)
        ? ''
        : i18n.t('common.invalidEmailFormat');
    }

    if (!userData?.password?.trim()) {
      errors.password = i18n.t('common.passwordIsRequired');
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
        if (res?.data?.accessToken) {
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
            navigation.navigate('Onbording');
          } else {
            navigation.navigate('Main', {screen: 'Chat'});
          }
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
          if (res?.data?.accessToken) {
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
            appleId: user,
          };

          setLoading(true);
          axios
            .post('/v1/user/auth/login', userData)
            .then(async res => {
              if (res?.data?.accessToken) {
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

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <>
      <ScreenWrapper>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex: 1}}>
              <ScrollView
                style={styles.container}
                contentContainerStyle={{paddingBottom: 30}}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    height: Height - 40,
                  }}>
                  <View style={styles.inputSeaction}>
                    <Text style={styles.loginTitleText}>
                      {i18n.t('common.login')}
                    </Text>
                    <Text style={styles.welcomeBackText}>
                      {i18n.t('loginPage.welcomeBack')}
                    </Text>
                  </View>
                  <View>
                    <View style={styles.inputSeaction}>
                      <Text style={styles.lableText}>
                        {' '}
                        {i18n.t('common.email')}
                      </Text>
                      <View style={styles.inputWrapper}>
                        <EmailIcon style={styles.iconStyle} />
                        <TextInput
                          style={styles.inputStyle}
                          placeholder={i18n.t('common.enterEmail')}
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
                      <Text style={styles.errorText}>
                        {validationErrors?.email}
                      </Text>
                    )}
                    {apiErrorMsg != '' && (
                      <Text style={styles.errorText}>{apiErrorMsg}</Text>
                    )}
                    {/* Password */}
                    <View style={{paddingTop: 10}}>
                      <Text style={styles.lableText}>
                        {' '}
                        {i18n.t('common.password')}
                      </Text>
                      <View style={styles.inputWrapper}>
                        <LockIcon style={styles.iconStyle} />
                        <TextInput
                          style={styles.inputStyle}
                          placeholder={i18n.t('common.enterPassword')}
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
                        {i18n.t('common.forgotPassword')}?
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.buttonLogin}
                      onPress={handleLogin}>
                      <Text style={styles.buttonLoginText}>
                        {' '}
                        {i18n.t('common.login')}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.orSignContainer}>
                      <View
                        style={{
                          flex: 1,
                          height: 1,
                          backgroundColor: Colors.darkGray,
                        }}
                      />
                      <Text style={styles.orSignText}>
                        {' '}
                        {i18n.t('loginPage.orSignInWith')}
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
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: Platform.OS === 'ios' ? 50 : 0,
                      width: '100%',
                    }}>
                    <Text style={styles.accountText}>
                      {i18n.t('loginPage.dontHaveAccount')}?{' '}
                      <Text
                        style={{
                          textDecorationLine: 'underline',
                          color: Colors.deepViolet,
                        }}
                        onPress={() => {
                          navigation.navigate('Signup');
                        }}>
                        {i18n.t('loginPage.createCccount')}
                      </Text>
                    </Text>
                  </View>
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
    paddingVertical: 5,
  },
  inputSeaction: {
    paddingTop: 25,
  },
  errorText: {
    color: Colors.darkRed,
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 15,
  },
});
export default Login;
