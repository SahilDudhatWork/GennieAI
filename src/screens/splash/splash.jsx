import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import {Colors, FontFamily} from '../../../Utils/Themes';
import ScreenWrapper from '../../components/ScreenWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../localization/i18n';

function Splash({navigation}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const [isContentShow, setIsContentShow] = useState(false);

  const getStarted = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.navigate('Onboarding');
    } else {
      // navigation.navigate('SelectLanguage');
      const isLanguage = await AsyncStorage.getItem('isLanguage');
      const isTermsConditions = await AsyncStorage.getItem('isTermsConditions');
      if (!isLanguage) {
        navigation.navigate('SelectLanguage');
      } else if (!isTermsConditions) {
        navigation.navigate('TermsConditions');
      } else {
        navigation.navigate('Main', {screen: 'Chat'});
      }
    }
  };
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // navigation.navigate('SelectLanguage');
        // navigation.navigate('Main', {screen: 'Chat'});
        const isTermsConditions = await AsyncStorage.getItem(
          'isTermsConditions',
        );
        const isLanguage = await AsyncStorage.getItem('isLanguage');
        if (!isLanguage) {
          navigation.navigate('SelectLanguage');
        } else if (!isTermsConditions) {
          navigation.navigate('TermsConditions');
        } else {
          navigation.navigate('Main', {screen: 'Chat'});
        }
        return;
      }

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(() => {
            Animated.spring(translateYAnim, {
              toValue: -60,
              useNativeDriver: true,
            }).start(() => {
              setIsContentShow(true);
            });
          }, 1500);
        });
      }, 1500);
    };

    checkToken();
  }, []);

  return (
    <ScreenWrapper>
      <View style={{justifyContent: 'space-between', flex: 1}}>
        <View style={styles.gennieContainer}>
          <Animated.Text
            style={[
              styles.gennieText,
              {
                opacity: fadeAnim,
                transform: [{scale: scaleAnim}, {translateY: translateYAnim}],
              },
            ]}>
            {i18n.t('splashPage.gennie')}
          </Animated.Text>
        </View>

        {isContentShow && (
          <View
            style={{
              justifyContent: 'flex-end',
              paddingBottom: 40,
            }}>
            <TouchableOpacity
              style={styles.buttonGetStarted}
              onPress={getStarted}>
              <Text style={styles.buttonGetStartedText}>
                {i18n.t('splashPage.getStarted')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSignIn}
              onPress={() => {
                navigation.navigate('Login');
              }}>
              <Text style={styles.buttonSignInText}>
                {i18n.t('splashPage.signIn')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  gennieContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    transform: [
      {translateX: 0},
      {translateY: Dimensions.get('window').height * 0.45},
    ],
  },
  gennieText: {
    fontSize: 32,
    fontFamily: FontFamily.SpaceGroteskBold,
    color: Colors.deepViolet,
    textAlign: 'center',
  },
  buttonGetStarted: {
    backgroundColor: Colors.deepViolet,
    borderRadius: 22,
    width: '100%',
    marginTop: 20,
    padding: 12,
  },
  buttonGetStartedText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FontFamily.SpaceGrotesk,
  },
  buttonSignIn: {
    borderRadius: 22,
    width: '100%',
    marginTop: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.deepViolet,
  },
  buttonSignInText: {
    color: Colors.deepViolet,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FontFamily.SpaceGrotesk,
  },
});

export default Splash;
