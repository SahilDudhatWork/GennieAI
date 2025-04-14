import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {CircleIcon, DownArrowIcon} from '../../components/Icons';
import BackButton from '../../components/BackButton';
import {Colors, FontFamily} from '../../../Utils/Themes';
import * as Animatable from 'react-native-animatable';

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

const Step3 = ({handleDownArrowStep3, handleSkipStep3}) => {
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
        <BackButton />
        <TouchableOpacity onPress={handleSkipStep3}>
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
        color="#57CFC6"
        style={{left: -25, top: 45}}
        animation="fadeInLeft"
      />
      <Dot
        size={13}
        color="#57CFC6"
        style={{left: 25, top: 95}}
        animation="fadeInLeft"
        delay={200}
      />

      {/* center--right */}
      <Dot
        size={width * 0.12}
        color="#4A84A5"
        style={{right: -25, top: '50%'}}
        animation="fadeInRight"
      />
      <Dot
        size={9}
        color="#4A84A5"
        style={{right: 43, top: '50%'}}
        animation="fadeInRight"
        delay={200}
      />

      {/* top--right */}
      <Dot
        size={9}
        color="#4967CB"
        style={{top: 110, right: 50}}
        animation="fadeInRight"
        delay={200}
      />

      {/* center--left */}
      <Dot
        size={9}
        color="#4967CB"
        style={{left: 35, top: '50%'}}
        animation="fadeInLeft"
        delay={300}
      />
      <Dot
        size={10}
        color="#4A05AD"
        style={{top: width * 0.94, left: '50%'}}
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
            outerColor="#E56E6F1A"
            middleColor="#E56E6F4F"
            innerColor="#E56E6FAB"
          />
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/Images/family.png')}
              style={styles.circleImage}
            />
          </View>
        </View>
      </Animatable.View>

      <Animatable.Text
        animation="fadeInLeft"
        duration={500}
        style={styles.title}>
        Gennie is Supportive {'\n'} Companion for {'\n'}Housewives
      </Animatable.Text>

      <Animatable.Text
        style={styles.subtitle}
        animation="fadeInRight"
        delay={300}
        duration={500}>
        Gennie is a supportive AI companion for housewives, offering assistance,
        guidance, and smart solutions for daily tasks and personal growth
      </Animatable.Text>

      <Animatable.View
        animation="fadeInUp"
        delay={600}
        duration={500}
        style={styles.downArrowIcon}>
        <TouchableOpacity onPress={handleDownArrowStep3}>
          <DownArrowIcon />
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
  },
  layerImage2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    resizeMode: 'contain',
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
  },
  skipText: {
    color: Colors.white,
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
    fontSize: 31,
    color: Colors.deepViolet,
    fontWeight: '400',
    fontFamily: FontFamily.SpaceGrotesk,
    letterSpacing: -2,
    textAlign: 'center',
    marginTop: height * 0.07,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.darkBlack,
    textAlign: 'center',
    fontWeight: '400',
    paddingHorizontal: 15,
    fontFamily: FontFamily.SpaceGrotesk,
  },
});

export default Step3;
