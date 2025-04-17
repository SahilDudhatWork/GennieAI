import React, {useState} from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import BackButton from '../../components/BackButton';
import {Colors, FontFamily} from '../../../Utils/Themes';
import axios from '../../../axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../localization/i18n';

function CreatePassword({navigation}) {
  const Height = Dimensions.get('window').height;
  const [userData, setUserData] = useState({
    newPassword: '',
    reEnterPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState({
    newPassword: '',
    reEnterPassword: '',
  });

  const changePassword = async () => {
    const errors = {};

    if (!userData.newPassword) {
      errors.newPassword = 'Password is required';
    } else if (userData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!userData.reEnterPassword) {
      errors.reEnterPassword = 'Please confirm your password';
    } else if (userData.reEnterPassword !== userData.newPassword) {
      errors.reEnterPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    let otpEmailStr = await AsyncStorage.getItem('otpEmail');
    const otpTokenStr = await AsyncStorage.getItem('otpToken');
    if (!otpEmailStr && !otpTokenStr) {
      return;
    }
    let otpEmail = JSON.parse(otpEmailStr);
    let otpToken = JSON.parse(otpTokenStr);

    axios
      .post('/v1/common/resetPassword/user', {
        otpToken: otpToken,
        email: otpEmail,
        newPassword: userData.newPassword,
      })
      .then(async res => {
        navigation.navigate('Login');
      })
      .catch(error => {
        console.log(error, 'error');
      });
  };

  const handleBackNext = () => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, {height: Height - 40}]}>
        <View>
          <BackButton handleBackNext={handleBackNext} />
        </View>
        <View style={styles.inputSeaction}>
          <Text style={styles.newPasswordText}>
            {i18n.t('createPasswordPage.newPassword')}
          </Text>
        </View>

        {/* Password */}
        <View style={{paddingTop: 20}}>
          <Text style={styles.lableText}>
            {i18n.t('createPasswordPage.newPassword')}
          </Text>
          <TextInput
            style={styles.inputStyle}
            placeholder={i18n.t('createPasswordPage.enterNewPassword')}
            placeholderTextColor={Colors.darkGray}
            secureTextEntry
            autoCapitalize="none"
            value={userData.newPassword}
            onChangeText={text => setUserData({...userData, newPassword: text})}
          />
        </View>
        {validationErrors?.newPassword && (
          <Text style={styles.errorText}>{validationErrors?.newPassword}</Text>
        )}

        {/*Re-enter Password */}
        <View style={{paddingTop: 10}}>
          <Text style={styles.lableText}>
            {i18n.t('createPasswordPage.reEnterPassword')}
          </Text>
          <TextInput
            style={styles.inputStyle}
            placeholder={i18n.t('createPasswordPage.enterReEnterPassword')}
            placeholderTextColor={Colors.darkGray}
            secureTextEntry
            autoCapitalize="none"
            value={userData.reEnterPassword}
            onChangeText={text =>
              setUserData({...userData, reEnterPassword: text})
            }
          />
        </View>
        {validationErrors?.reEnterPassword && (
          <Text style={styles.errorText}>
            {validationErrors?.reEnterPassword}
          </Text>
        )}

        <View>
          <TouchableOpacity style={styles.buttonNext} onPress={changePassword}>
            <Text style={styles.buttonText}> {i18n.t('common.next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputSeaction: {
    paddingTop: 40,
  },
  newPasswordText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.deepViolet,
    fontSize: 22,
    fontWeight: '600',
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
    marginTop: 30,
    padding: 12,
  },
  errorText: {
    color: Colors.darkRed,
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 15,
  },
});
export default CreatePassword;
