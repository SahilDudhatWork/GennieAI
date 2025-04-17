import React, {useRef, useEffect, useState} from 'react';
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

function OtpSent({navigation}) {
  const Height = Dimensions.get('window').height;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [apiErrorMsg, setApiErrorMsg] = useState('');

  const inputRefs = Array(6)
    .fill(null)
    .map(() => useRef());

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleBackspace = (key, index) => {
    if (key === 'Backspace' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const resendOtp = async () => {
    let otpEmailStr = await AsyncStorage.getItem('otpEmail');
    setApiErrorMsg('');

    if (!otpEmailStr) {
      return;
    }
    let otpEmail = JSON.parse(otpEmailStr);
    axios
      .post('/v1/common/otp/sent/user', {email: otpEmail})
      .then(async res => {
        setOtp(['', '', '', '', '', '']);
        setTimer(300);
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
  const verifyOtp = async () => {
    setApiErrorMsg('');

    let otpEmailStr = await AsyncStorage.getItem('otpEmail');
    if (!otpEmailStr) {
      return;
    }
    let otpEmail = JSON.parse(otpEmailStr);
    let otpStr = parseInt(otp.join(''), 10);

    axios
      .post('/v1/common/otp/verify', {email: otpEmail, otp: otpStr})
      .then(async res => {
        await AsyncStorage.setItem(
          'otpToken',
          JSON.stringify(res?.data?.token),
        );
        navigation.navigate('CreatePassword');
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
  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
          <Text style={styles.otpText}>{i18n.t('otpSentPage.otp')}</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={styles.otpInput}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={({nativeEvent}) =>
                handleBackspace(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>
        <View>
          {apiErrorMsg != '' && (
            <Text style={styles.errorText}>{apiErrorMsg}</Text>
          )}
        </View>

        <View>
          <TouchableOpacity
            style={[
              styles.buttonNext,
              {
                backgroundColor: otp.every(num => num !== '')
                  ? Colors.deepViolet
                  : Colors.liteViolet,
              },
            ]}
            disabled={!otp.every(num => num !== '')}
            onPress={verifyOtp}>
            <Text style={styles.buttonText}>
              {i18n.t('otpSentPage.verifyOtp')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={resendOtp}
          disabled={timer > 0}
          style={styles.resendContainer}>
          <Text style={styles.resendText}>
            {timer > 0 ? `Resend OTP in ${formatTime()}` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
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
  otpText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.deepViolet,
    fontSize: 22,
    fontWeight: '600',
  },
  resendText: {
    color: Colors.darkGray,
    fontSize: 14,
  },
  resendContainer: {
    paddingTop: 15,
    paddingRight: 10,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  otpInput: {
    width: 40,
    height: 40,
    marginHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 18,
    color: Colors.darkGray,
    borderColor: Colors.darkGray,
    backgroundColor: '#FFFFFF59',
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
    padding: 12,
  },
  errorText: {
    color: Colors.darkRed,
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 15,
  },
});
export default OtpSent;
