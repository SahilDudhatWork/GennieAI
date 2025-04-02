import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  ScrollView,
} from 'react-native';
import {FontFamily, Colors} from '../../../Utils/Themes';
import ScreenWrapper from '../../components/ScreenWrapper';
// import DocumentPicker from 'react-native-document-picker';

import {launchImageLibrary} from 'react-native-image-picker';
import BackButton from '../../components/BackButton';
import axios from '../../../axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

function signup({navigation}) {
  const [profileImage, setProfileImage] = useState(null);
  const [emailTaken, setEmailTaken] = useState('');
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    profileImage: null,
  });

  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
  });

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
          navigation.navigate('Chat');
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
      });
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View>
          <BackButton />
        </View>
        <View style={{paddingTop: 30}}>
          <Text
            style={{
              fontFamily: FontFamily.TimeRoman,
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: '600',
            }}>
            Sign up
          </Text>
        </View>
        {/* Name */}
        <View style={{paddingTop: 20}}>
          <Text
            style={{
              fontFamily: FontFamily.TimeRoman,
              color: '#FFFFFF',
              fontSize: 15,
              paddingHorizontal: 10,
              paddingVertical: 5,
              fontWeight: '400',
            }}>
            Name
          </Text>
          <View
            style={{
              flexDirection: 'row',
              height: 44,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FFFFFF',
              borderRadius: 12,
              paddingLeft: 20,
              backgroundColor: '#FFFFFF59',
            }}>
            <TextInput
              style={{
                fontSize: 14,
                color: '#FFFFFF',
                fontFamily: FontFamily.TimeRoman,
                fontWeight: '400',
                width: '100%',
              }}
              placeholder="Enter your name"
              placeholderTextColor="#FFFFFF"
              autoCapitalize="none"
              onChangeText={text => setUserData({...userData, fullName: text})}
            />
          </View>
          {validationErrors?.fullName && (
            <Text style={styles.errorText}>{validationErrors?.fullName}</Text>
          )}
        </View>
        {/* Email */}
        <View style={{paddingTop: 10}}>
          <Text
            style={{
              fontFamily: FontFamily.TimeRoman,
              color: '#FFFFFF',
              fontSize: 15,
              paddingHorizontal: 10,
              paddingVertical: 5,
              fontWeight: '400',
            }}>
            Email
          </Text>
          <View
            style={{
              flexDirection: 'row',
              height: 44,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FFFFFF',
              borderRadius: 12,
              paddingLeft: 20,
              backgroundColor: '#FFFFFF59',
            }}>
            {/* <emailIcon /> */}
            <TextInput
              style={{
                fontSize: 14,
                color: '#FFFFFF',
                fontFamily: FontFamily.TimeRoman,
                fontWeight: '400',
                width: '100%',
              }}
              placeholder="Enter your email"
              placeholderTextColor="#FFFFFF"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={text => setUserData({...userData, email: text})}
            />
          </View>
          {validationErrors?.email && (
            <Text style={styles.errorText}>{validationErrors?.email}</Text>
          )}
          {emailTaken != '' && (
            <Text style={styles.errorText}>{emailTaken}</Text>
          )}
        </View>
        {/* Phone number */}
        <View style={{paddingTop: 10}}>
          <Text
            style={{
              fontFamily: FontFamily.TimeRoman,
              color: '#FFFFFF',
              fontSize: 15,
              paddingHorizontal: 10,
              paddingVertical: 5,
              fontWeight: '400',
            }}>
            Phone Number
          </Text>
          <View
            style={{
              flexDirection: 'row',
              height: 44,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FFFFFF',
              borderRadius: 12,
              paddingLeft: 20,
              backgroundColor: '#FFFFFF59',
            }}>
            <TextInput
              style={{
                fontSize: 14,
                color: '#FFFFFF',
                fontFamily: FontFamily.TimeRoman,
                fontWeight: '400',
                width: '100%',
              }}
              placeholder="Enter your number"
              placeholderTextColor="#FFFFFF"
              autoCapitalize="none"
              keyboardType="numeric"
              onChangeText={text => setUserData({...userData, mobile: text})}
            />
          </View>
          {validationErrors?.mobile && (
            <Text style={styles.errorText}>{validationErrors?.mobile}</Text>
          )}
        </View>

        {/* Password */}
        <View style={{paddingTop: 10}}>
          <Text
            style={{
              fontFamily: FontFamily.TimeRoman,
              color: '#FFFFFF',
              fontSize: 15,
              paddingHorizontal: 10,
              paddingVertical: 5,
              fontWeight: '400',
            }}>
            Password
          </Text>
          <View
            style={{
              flexDirection: 'row',
              height: 44,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FFFFFF',
              borderRadius: 12,
              paddingLeft: 20,
              backgroundColor: '#FFFFFF59',
            }}>
            <TextInput
              style={{
                fontSize: 14,
                color: '#FFFFFF',
                fontFamily: FontFamily.TimeRoman,
                fontWeight: '400',
                width: '100%',
              }}
              placeholder="Enter your password"
              placeholderTextColor="#FFFFFF"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={text => setUserData({...userData, password: text})}
            />
          </View>
          {validationErrors?.password && (
            <Text style={styles.errorText}>{validationErrors?.password}</Text>
          )}
        </View>

        {/* Profile Picture */}

        {/* <View style={{paddingTop: 10}}>
          <Text
            style={{
              fontFamily: FontFamily.TimeRoman,
              color: '#FFFFFF',
              fontSize: 15,
              paddingHorizontal: 10,
              paddingVertical: 5,
              fontWeight: '400',
            }}>
            Profile Picture
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              height: 90,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 20,
              backgroundColor: '#FFFFFF59',
              justifyContent: 'center',
            }}
            onPress={handleImagePick}>
            {profileImage ? (
              <Image
                source={{uri: profileImage}}
                style={{width: 80, height: 80, borderRadius: 40}}
              />
            ) : (
              <View style={{alignItems: 'center'}}>
                <Text
                  style={{
                    fontFamily: FontFamily.TimeRoman,
                    color: '#FFFFFF',
                    fontSize: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    fontWeight: '400',
                    textAlign: 'center',
                  }}>
                  Upload your profile picture here
                </Text>
                <Text
                  style={{
                    fontFamily: FontFamily.TimeRoman,
                    color: '#FFFFFF',
                    fontSize: 9,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    fontWeight: '400',
                    textAlign: 'center',
                  }}>
                  Supports: JPG, JPEG, PNG
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View> */}

        <View>
          <TouchableOpacity style={styles.buttonSignUp} onPress={handleSignUp}>
            <Text style={styles.buttonSigUpText}>Sign up</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 20,
          }}>
          <View style={{flex: 1, height: 1, backgroundColor: '#FFFFFF'}} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '400',
              color: '#FFFFFF',
              fontFamily: FontFamily.TimeRoman,
              paddingHorizontal: 30,
            }}>
            Or sign up with
          </Text>
          <View style={{flex: 1, height: 1, backgroundColor: '#FFFFFF'}} />
        </View>
        <View style={styles.signupOr}>
          <TouchableOpacity>
            <Image
              source={require('../../assets/Images/auth/google.png')}
              style={{width: 40, height: 40}}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require('../../assets/Images/auth/apple.png')}
              style={{width: 40, height: 40}}
            />
          </TouchableOpacity>
        </View>
        <View style={{paddingTop: 25, paddingBottom: 30}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '400',
              color: '#FFFFFF',
              fontFamily: FontFamily.TimeRoman,
              textAlign: 'center',
            }}>
            I have an account?{' '}
            <Text
              style={{textDecorationLine: 'underline'}}
              onPress={() => {
                navigation.navigate('Login');
              }}>
              Login
            </Text>
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF59',
    borderRadius: 20,
    backdropFilter: 'blur(4px)',
  },
  container: {
    flex: 1,
  },
  buttonSigUpText: {
    color: '#4A05AD',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FontFamily.TimeRoman,
  },
  buttonSignUp: {
    backgroundColor: '#FFFFFF',
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
export default signup;
