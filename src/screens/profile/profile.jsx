import React, {useCallback, useEffect, useState} from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import {Colors, FontFamily} from '../../../Utils/Themes';
import {LogOutIcon, ProfileEditIcon} from '../../components/Icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../../../axios';
import {DotIndicator} from 'react-native-indicators';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import i18n from '../../localization/i18n';

function UpdateProfile({navigation}) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    profileImage: null,
  });
  const [userDisplay, setUserDisplayData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    profileImage: null,
  });

  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    mobile: '',
  });

  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      if (route.params?.setSelectedTab) {
        route.params.setSelectedTab('Profile');
      }
    }, [route.params]),
  );

  const handleImagePick = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (!response.didCancel && !response.error) {
        console.log('image selected ', response.assets[0].uri);
      }
    });
  };

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        let data = JSON.parse(userDataString);
        setUserData({...data, mobile: data?.mobile?.toString()});
        setUserDisplayData(data);
      } else {
        setLoading(true);
        axios
          .get('/v1/user/profile')
          .then(async res => {
            setUserData({
              ...res.data,
              mobile: res.data?.mobile?.toString(),
            });

            setUserDisplayData(res.data);
            await AsyncStorage.setItem('userData', JSON.stringify(res.data));
          })
          .catch(error => {
            console.log(error?.request);
          })
          .finally(() => setLoading(false));
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };
  const handleUpdateProfile = async () => {
    const errors = {};
    if (userData.fullName.length < 3 || userData.fullName.length > 15) {
      errors.fullName = i18n.t('common.nameMustbe');
    } else {
      errors.fullName = '';
    }

    if (!userData.mobile.trim()) {
      errors.mobile = i18n.t('common.phoneNumberIsRequired');
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      errors.mobile = phoneRegex.test(userData.mobile)
        ? ''
        : i18n.t('common.invalidPhoneNumberFormat');
    }

    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      return;
    }
    setLoading(true);
    axios
      .put('/v1/user/profile', userData)
      .then(async res => {
        setUserDisplayData(userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      })
      .catch(error => {
        console.log(error?.request);
      })
      .finally(() => setLoading(false));
  };
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    navigation.replace('Login');
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ScreenWrapper>
              <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 30 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View>
                  <View style={styles.profileImageContainer}>
                    <View style={{ position: 'relative' }}>
                      <Image
                        source={require('../../assets/Images/profile-user.png')}
                        style={styles.profileImage}
                      />
                      <TouchableOpacity
                        style={styles.profileEditIcon}
                        onPress={handleImagePick}>
                        <ProfileEditIcon />
                      </TouchableOpacity>
                    </View>
                    <View>
                      <Text style={styles.nameText}>{userDisplay?.fullName}</Text>
                      <Text style={styles.emailText}>{userDisplay?.email}</Text>
                      <TouchableOpacity
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'row',
                          gap: 12,
                          paddingTop: 7,
                        }}
                        activeOpacity={0.5}
                        onPress={handleLogout}>
                        <View style={styles.logOutIcon}>
                          <LogOutIcon />
                        </View>
                  <Text style={styles.logOutText}>
                    {i18n.t('profilePage.logout')}
                  </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
  
                  {/* Name */}
            <View style={{paddingTop: 20}}>
              <Text style={styles.lableText}> {i18n.t('common.name')}</Text>
                    <TextInput
                      style={styles.inputStyle}
                placeholder={i18n.t('common.enterName')}
                      placeholderTextColor={Colors.darkGray}
                      autoCapitalize="none"
                      value={userData?.fullName}
                      onChangeText={text =>
                        setUserData({ ...userData, fullName: text })
                      }
                    />
                  </View>
                  {validationErrors?.fullName && (
                    <Text style={styles.errorText}>
                      {validationErrors?.fullName}
                    </Text>
                  )}
  
                  {/* Email */}
            <View style={{paddingTop: 10}}>
              <Text style={styles.lableText}>{i18n.t('common.email')}</Text>
                    <TextInput
                      style={styles.inputStyle}
                placeholder={i18n.t('common.enterEmail')}
                      placeholderTextColor={Colors.darkGray}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={userData?.email}
                      editable={false}
                    />
                  </View>
  
                  {/* Phone number */}
            <View style={{paddingTop: 10}}>
              <Text style={styles.lableText}>
                {i18n.t('common.phoneNumber')}
              </Text>
                    <TextInput
                      style={styles.inputStyle}
                placeholder={i18n.t('common.enterPhoneNumber')}
                      placeholderTextColor={Colors.darkGray}
                      autoCapitalize="none"
                      keyboardType="numeric"
                      value={userData.mobile}
                      onChangeText={text =>
                        setUserData({ ...userData, mobile: text })
                      }
                    />
                  </View>
                  {validationErrors?.mobile && (
                    <Text style={styles.errorText}>
                      {validationErrors?.mobile}
                    </Text>
                  )}
  
                  {/* Update Button */}
                  <View style={{ paddingTop: 20 }}>
                    <TouchableOpacity
                      style={styles.buttonNext}
                      onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>
                  {i18n.t('profilePage.updateProfile')}
                </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </ScreenWrapper>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
  
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
  profileEditIcon: {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    padding: 4,
    backgroundColor: Colors.deepViolet,
    position: 'absolute',
    right: 0,
    bottom: 10,
  },
  logOutIcon: {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: '#4A05ADCC',
  },
  profileImageContainer: {
    paddingTop: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 15,
  },
  logOutText: {
    fontWeight: '400',
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.darkGray,
    fontSize: 12,
  },
  emailText: {
    fontWeight: '400',
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.darkGray,
    fontSize: 12,
    paddingTop: 4,
  },
  nameText: {
    fontWeight: '600',
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.deepViolet,
    fontSize: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderWidth: 4,
    borderColor: Colors.white,
    borderRadius: 60,
  },
  inputStyle: {
    fontSize: 14,
    color: Colors.darkGray,
    fontFamily: FontFamily.SpaceGrotesk,
    width: '100%',
    fontWeight: '400',
    borderWidth: 1,
    borderColor: Colors.darkGray,
    borderRadius: 12,
    backgroundColor: '#FFFFFF59',
    paddingHorizontal: 14,
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
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FontFamily.SpaceGrotesk,
  },
  buttonNext: {
    backgroundColor: Colors.deepViolet,
    borderRadius: 22,
    width: '100%',
    marginTop: 100,
    marginBottom: 30,
    padding: 12,
  },
  errorText: {
    color: Colors.darkRed,
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 15,
  },
});
export default UpdateProfile;
