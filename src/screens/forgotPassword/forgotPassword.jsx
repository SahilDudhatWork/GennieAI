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

function ForgetPassword({navigation}) {
  const Height = Dimensions.get('window').height;
  const [email, setEmail] = useState('');
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
  });
  const sendOtp = async () => {
    const errors = {};
    setApiErrorMsg('');

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      errors.email = emailRegex.test(email) ? '' : 'Invalid email format.';
    }
    setValidationErrors(errors);

    if (Object.values(errors).some(error => error !== '')) {
      return;
    }
    axios
      .post('/v1/common/otp/sent/user', {email: email})
      .then(async res => {
        console.log('res', res);
        await AsyncStorage.setItem('otpEmail', JSON.stringify(email));
        navigation.navigate('OtpSent');
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
      });
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, {height: Height - 40}]}>
        <View>
          <BackButton />
        </View>
        <View style={styles.inputSeaction}>
          <Text style={styles.forgotPasswordText}>Forgot Password</Text>
        </View>

        <View style={styles.inputSeaction}>
          <Text style={styles.lableText}>Email</Text>
          <TextInput
            style={styles.inputStyle}
            placeholder="Enter your email"
            placeholderTextColor={Colors.darkGray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        {validationErrors?.email && (
          <Text style={styles.errorText}>{validationErrors?.email}</Text>
        )}
        {apiErrorMsg != '' && (
          <Text style={styles.errorText}>{apiErrorMsg}</Text>
        )}

        <View>
          <TouchableOpacity style={styles.buttonNext} onPress={sendOtp}>
            <Text style={styles.buttonText}>Next</Text>
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
  forgotPasswordText: {
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
export default ForgetPassword;
