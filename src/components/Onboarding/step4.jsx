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
import {useNavigation} from '@react-navigation/native';

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

const Step4 = ({handleDownArrowStep4, handleSkipStep4}) => {
  const navigation = useNavigation();

  const text =
    'Gennie is a patient AI listener for elders, providing companionship, meaningful conversations, and thoughtful support';
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

    return () => {
      Tts.stop();
    };
  }, []);

  const handleBackNext = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require('../../assets/Images/splash_screen.png')}
      style={styles.background}>
      <View style={styles.topRow}>
        <BackButton handleBackNext={handleBackNext} />
        <TouchableOpacity onPress={handleSkipStep4}>
          <Animatable.Text
            style={styles.skipText}
            animation="fadeInRight"
            duration={500}>
            Skip
          </Animatable.Text>
        </TouchableOpacity>
      </View>

      {/* top--left */}
      <Dot
        size={width * 0.12}
        color="#0E2196"
        style={{left: -25, top: 45}}
        animation="fadeInLeft"
      />
      <Dot
        size={13}
        color="#0E2196"
        style={{left: 25, top: 95}}
        animation="fadeInLeft"
        delay={200}
      />

      {/* center--right */}
      <Dot
        size={width * 0.12}
        color="#88BEE5"
        style={{right: -25, top: '50%'}}
        animation="fadeInRight"
      />
      <Dot
        size={9}
        color="#88BEE5"
        style={{right: 43, top: '50%'}}
        animation="fadeInRight"
        delay={200}
      />

      {/* top--right */}
      <Dot
        size={9}
        color="#836338"
        style={{top: 110, right: 50}}
        animation="fadeInRight"
        delay={300}
      />

      {/* center--left */}
      <Dot
        size={9}
        color="#836338"
        style={{left: 35, top: '50%'}}
        animation="fadeInLeft"
        delay={300}
      />
      <Dot
        size={10}
        color="#AD05A2"
        style={{top: width * 0.97, left: '50%'}}
        animation="zoomIn"
        delay={400}
      />

      <Animatable.View
        style={styles.centerWrapper}
        animation="fadeInUp"
        duration={500}>
        <View style={styles.circleBg}>
          <CircleIcon
            style={styles.svgCircle}
            outerColor="#7CEBFF26"
            middleColor="#7CEBFF4F"
            innerColor="#7CEBFF7D"
          />
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/Images/elders.png')}
              style={styles.circleImage}
            />
          </View>
        </View>
      </Animatable.View>

      <Animatable.Text
        style={styles.title}
        animation="fadeInLeft"
        duration={500}>
        Gennie is Patient {'\n'} Listener for Elders
      </Animatable.Text>

      <Animatable.Text
        style={styles.subtitle}
        animation="fadeInRight"
        delay={300}
        duration={500}>
        Gennie is a patient AI listener for elders, providing companionship,
        meaningful conversations, and thoughtful support
      </Animatable.Text>

      <Animatable.View
        animation="fadeInUp"
        delay={600}
        duration={500}
        style={styles.downArrowIcon}>
        <TouchableOpacity onPress={handleDownArrowStep4}>
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
  centerWrapper: {
    alignItems: 'center',
    marginTop: height * 0.05,
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
    letterSpacing: -2,
    fontFamily: FontFamily.SpaceGrotesk,
    textAlign: 'center',
    marginTop: height * 0.1,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.darkBlack,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: FontFamily.SpaceGrotesk,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
});

export default Step4;
