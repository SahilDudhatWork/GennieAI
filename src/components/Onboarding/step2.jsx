import React, {useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ImageBackground,
  Platform,
} from 'react-native';
import {CircleIcon, DownArrowIcon} from '../../components/Icons';
import BackButton from '../../components/BackButton';
import {Colors, FontFamily} from '../../../Utils/Themes';
import * as Animatable from 'react-native-animatable';
import Tts from 'react-native-tts';

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

const Step2 = ({handleDownArrowStep2, handleSkipStep2}) => {
  const text =
    'Gennie is an AI mentor that empowers professionals with expert guidance, career insights, and skill development support.';
  useEffect(() => {
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
    // Speak the subtitle text when the component mounts
    Tts.speak(text, {
      androidParams: {
        KEY_PARAM_PAN: 0,
        KEY_PARAM_VOLUME: 1.0,
        KEY_PARAM_STREAM: 'STREAM_MUSIC',
      },
    });
  }, []);
  return (
    <ImageBackground
      source={require('../../assets/Images/new_splash_screen.png')}
      style={styles.background}>
      <View style={styles.topRow}>
        <BackButton style={{zIndex: 10}} />
        <TouchableOpacity onPress={handleSkipStep2}>
          <Animatable.Text
            style={styles.skipText}
            animation="fadeInRight"
            duration={500}>
            Skip
          </Animatable.Text>
        </TouchableOpacity>
      </View>

      <Dot
        size={width * 0.12}
        color="#14BEE4"
        style={{left: -25, top: 45}}
        animation="fadeInLeft"
      />
      <Dot
        size={13}
        color="#14BEE4"
        style={{left: 25, top: 95}}
        animation="fadeInLeft"
      />
      <Dot
        size={width * 0.12}
        color="#FFEB99"
        style={{right: -25, top: '50%'}}
        animation="fadeInRight"
      />
      <Dot
        size={9}
        color="#FF3FD5"
        style={{top: 110, right: 50}}
        animation="fadeInRight"
        delay={200}
      />
      <Dot
        size={9}
        color="#FFEB99"
        style={{right: 43, top: '50%'}}
        animation="fadeInRight"
        delay={300}
      />
      <Dot
        size={9}
        color="#FF3FD5"
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
            outerColor="#E4FFCA82"
            middleColor="#DDFFBDD1"
            innerColor="#8BC45466"
          />
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/Images/Professionals.png')}
              style={styles.circleImage}
            />
          </View>
        </View>
      </Animatable.View>

      <Animatable.Text
        style={styles.title}
        animation="fadeInLeft"
        duration={500}>
        Gennie is Mentor {'\n'}for Professionals
      </Animatable.Text>

      <Animatable.Text
        style={styles.subtitle}
        animation="fadeInRight"
        delay={300}
        duration={500}>
        Gennie is an AI mentor that empowers professionals with expert guidance,
        career insights, and skill development support.
      </Animatable.Text>

      <Animatable.View
        animation="fadeInUp"
        delay={600}
        duration={500}
        style={styles.downArrowIcon}>
        <TouchableOpacity onPress={handleDownArrowStep2}>
          <DownArrowIcon />
        </TouchableOpacity>
      </Animatable.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 15,
    resizeMode: 'cover',
    paddingTop: Platform.OS === 'ios' ? 50 : '',
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
    zIndex: 999,
    left: width / 2 - 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    zIndex: 99,
  },
  skipText: {
    color: Colors.deepViolet,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FontFamily.SpaceGrotesk,
  },
  centerWrapper: {
    alignItems: 'center',
    marginTop: height * 0.1,
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
    fontFamily: FontFamily.SpaceGrotesk,
    letterSpacing: -2,
    textAlign: 'center',
    marginTop: height * 0.07,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.darkBlack,
    textAlign: 'center',
    fontWeight: '400',
    paddingHorizontal: 10,
    lineHeight: 20,
    fontFamily: FontFamily.SpaceGrotesk,
  },
});

export default Step2;
