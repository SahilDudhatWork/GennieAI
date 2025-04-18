import React, {useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import {CircleIcon, RightArrowIcon} from '../../components/Icons';
import BackButton from '../../components/BackButton';
import {Colors, FontFamily} from '../../../Utils/Themes';
import Tts from 'react-native-tts';
import {useNavigation} from '@react-navigation/native';
import i18n from '../../localization/i18n';

const {width, height} = Dimensions.get('window');

const Dot = ({size, color, style, animation, delay = 0}) => (
  <Animatable.View
    animation={animation}
    duration={500}
    delay={delay}
    useNativeDriver
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        position: 'absolute',
        zIndex: 9,
      },
      style,
    ]}
  />
);
const Step1 = ({handleDownArrowStep1, handleSkipStep1, handleBackNext}) => {
  const navigation = useNavigation();

  const text =
    'Gennie is a smart AI tutor designed to help students learn efficiently with personalized guidance and instant support';
  useEffect(() => {
    // Tts.setDefaultLanguage('en-US');
    // Tts.setDefaultRate(0.5);
    // Tts.setDefaultPitch(1.0);
    //
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultVoice('en-us-x-sfg#male_1-local');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.1);
    Tts.speak(text, {
      androidParams: {
        KEY_PARAM_PAN: 0,
        KEY_PARAM_VOLUME: 1.0,
        KEY_PARAM_STREAM: 'STREAM_MUSIC',
      },
    });
    return () => {
      Tts.stop();
    };
  }, []);

  return (
    <LinearGradient colors={['#FFFFFF', '#F0F0F8']} style={styles.container}>
      <Animatable.Image
        animation="fadeInDown"
        delay={500}
        duration={500}
        source={require('../../assets/Images/Layer.png')}
        style={styles.layerImage}
      />

      <View style={styles.topRow}>
        <BackButton handleBackNext={handleBackNext} />
        <TouchableOpacity onPress={handleSkipStep1}>
          <Animatable.Text
            animation="fadeInRight"
            duration={500}
            style={styles.skipText}>
            {i18n.t('common.skip')}
          </Animatable.Text>
        </TouchableOpacity>
      </View>

      <Dot
        size={width * 0.12}
        color="#A472F7"
        style={{left: -25, top: 45}}
        animation="fadeInLeft"
      />
      <Dot
        size={13}
        color="#A472F7"
        style={{left: 25, top: 95}}
        animation="fadeInLeft"
        delay={200}
      />
      <Dot
        size={width * 0.12}
        color="#F17575"
        style={{right: -25, top: '50%'}}
        animation="fadeInRight"
      />
      <Dot
        size={9}
        color="#F17575"
        style={{top: 110, right: 50}}
        animation="fadeInRight"
        delay={200}
      />
      <Dot
        size={9}
        color="#F17575"
        style={{right: 43, top: '50%'}}
        animation="fadeInRight"
        delay={300}
      />
      <Dot
        size={9}
        color="#A099FF"
        style={{left: 35, top: '50%'}}
        animation="fadeInLeft"
        delay={300}
      />
      <Dot
        size={10}
        color="#4A05AD"
        style={{top: '38%', left: 73}}
        animation="zoomIn"
        delay={400}
      />

      <Animatable.View
        animation="fadeInUp"
        duration={500}
        style={styles.centerWrapper}>
        <View style={styles.circleBg}>
          <CircleIcon
            style={styles.svgCircle}
            outerColor="#C6B0F91A"
            middleColor="#EEE2FF"
            innerColor="#6F11FF38"
          />
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/Images/study.png')}
              style={styles.circleImage}
            />
          </View>
        </View>
      </Animatable.View>

      <Animatable.Text
        animation="fadeInLeft"
        duration={500}
        style={styles.title}>
        {i18n.t('onBordingPage.gennieTitleStep1')}
      </Animatable.Text>

      <Animatable.Text
        animation="fadeInRight"
        delay={300}
        duration={500}
        style={styles.subtitle}>
        {i18n.t('onBordingPage.gennieDescriptionStep1')}
      </Animatable.Text>

      <Animatable.View
        animation="fadeInUp"
        delay={600}
        duration={500}
        style={styles.downArrowIcon}>
        <TouchableOpacity onPress={handleDownArrowStep1}>
          <RightArrowIcon />
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.Image
        animation="fadeInUp"
        delay={500}
        duration={500}
        source={require('../../assets/Images/Layer2.png')}
        style={styles.layerImage2}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 50 : '',
  },
  layerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    resizeMode: 'contain',
    width: 196,
    height: 100,
  },
  layerImage2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    resizeMode: 'contain',
    width: 275,
    height: 213,
  },
  downArrowIcon: {
    backgroundColor: Colors.deepViolet,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22.5,
    position: 'absolute',
    bottom: 33,
    right: 20,
    zIndex: 999,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    zIndex: 99,
  },
  skipText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FontFamily.TimeRoman,
  },
  centerWrapper: {
    alignItems: 'center',
    marginTop: height * 0.07,
  },
  circleBg: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#F5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svgCircle: {
    position: 'absolute',
  },
  imageWrapper: {
    width: width * 0.37,
    height: width * 0.37,
    borderRadius: (width * 0.37) / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    backgroundColor: '#fff',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 35,
    color: Colors.deepViolet,
    fontWeight: '400',
    fontFamily: FontFamily.TimeRoman,
    textAlign: 'center',
    marginTop: height * 0.07,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#0A0A0A',
    textAlign: 'center',
    fontWeight: '400',
    paddingHorizontal: 30,
    lineHeight: 20,
    fontFamily: FontFamily.TimeRoman,
  },
});

export default Step1;
