import React, {useEffect, useRef, useState} from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import BackButton from '../../components/BackButton';
import {Colors, FontFamily} from '../../../Utils/Themes';
import axios from '../../../axios';
import {WatchIcon} from '../../components/Icons';
import RenderHtml from 'react-native-render-html';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

function TermsConditions({navigation}) {
  const [termsData, setTermsData] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      id: '1',
      title: 'Security is our priority',
      description:
        'The App is a safe and convenient way to manage your account.',
      image: require('../../assets/Images/slider1.webp'),
    },
    {
      id: '2',
      title: 'Privacy is everything',
      description: 'Your privacy is Important to us.',
      image: require('../../assets/Images/slider2.webp'),
    },
    {
      id: '3',
      title: 'Agree on safety',
      description: 'Keeping your a account safe is a top priority',
      image: require('../../assets/Images/slider3.webp'),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const handleBackNext = () => {
    navigation.goBack();
  };
  const fetchData = async () => {
    setTermsData(
      `<p>Welcome to Your App Name. By using our mobile application, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree with these terms, please do not use the App.</p><p><strong>Acceptance of Terms</strong></p><p>By downloading, installing, and using the App, you agree to these Terms and our Privacy Policy. We reserve the right to update or modify these Terms at any time.</p><p><strong>1. Use of the App</strong></p><ul><li>You must be at least age years old to use the App.</li><li>You agree to use the App for lawful purposes only.</li><li>You are responsible for maintaining the confidentiality of your account credentials.</li></ul><p><strong>2. User Content</strong></p><ul><li>You retain ownership of any content you upload but grant us a license to use, modify, and distribute it as necessary for App functionality.</li><li>You must not upload illegal, harmful, or copyrighted content without permission.</li></ul><p><strong>3. Prohibited Activities</strong></p><ul><li>Engage in fraud, hacking, or other malicious activities.App.</li></ul>`,
    );
    setUpdatedAt('2025-04-15T09:27:37.983Z');
    // try {
    //   axios
    //     .get('/v1/user/cms/term-and-conditions')
    //     .then(async res => {
    //       setTermsData(res.data.description);
    //       setUpdatedAt(res.data.updatedAt);
    //     })
    //     .catch(error => {
    //       console.log(error?.request, 'error?.request');
    //     });
    // } catch (error) {
    //   console.error('Error retrieving user data:', error);
    // }
  };

  const formatDate = dateString => {
    const options = {day: 'numeric', month: 'long', year: 'numeric'};
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleIAgree = async () => {
    const isTermsConditions = await AsyncStorage.getItem('isTermsConditions');
    if (!isTermsConditions) {
      await AsyncStorage.setItem('isTermsConditions', 'true');
    }
    navigation.replace('Login');
  };

  const handleScroll = e => {
    const index = Math.round(e.nativeEvent.contentOffset.x / 320);
    setCurrentIndex(index);
  };

  return (
    <ScreenWrapper isSpecialBg={true}>
      <View style={[styles.container]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity>
          <BackButton handleBackNext={handleBackNext} />
        </TouchableOpacity>
        <View style={styles.termsConditionsContainer}>
          <Text style={styles.termsConditionsText}>Terms & Conditions</Text>
          <View style={styles.timeContainer}>
            <WatchIcon />
            <Text style={styles.lastUpdateText}>
              Last Updated: {updatedAt ? formatDate(updatedAt) : 'Loading...'}
            </Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <ScrollView
            style={styles.newTextStyle}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}>
            {termsData ? (
              <RenderHtml
                contentWidth={Dimensions.get('window').width}
                source={{html: termsData}}
              />
            ) : (
              <Text>Loading terms...</Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.bottomWrapper}>
          <TouchableOpacity style={styles.buttonIAgree} onPress={handleIAgree}>
            <Text style={styles.buttonText}>I agree...</Text>
          </TouchableOpacity>

          <View style={[styles.sliderContainer]}>
            <FlatList
              data={slides}
              ref={flatListRef}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) => (
                <View style={[styles.slide]}>
                  <View style={styles.imageTextContainer}>
                    <View style={{position: 'relative'}}>
                      <Image source={item.image} style={styles.image} />
                      <LinearGradient
                        colors={['#007AFF', '#004999']}
                        start={{x: 1, y: 0}}
                        end={{x: 0, y: 0}}
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: 7.5,
                          position: 'absolute',
                          right: 40,
                          bottom: 4,
                        }}
                      />
                      <LinearGradient
                        colors={['#5EABFF', '#396799']}
                        start={{x: 1, y: 0}}
                        end={{x: 0, y: 0}}
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: 7.5,
                          position: 'absolute',
                          right: 25,
                          top: 25,
                        }}
                      />
                    </View>
                    <View style={styles.textWrapper}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.description}>{item.description}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
            <View style={styles.dotsWrapper}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  termsConditionsContainer: {
    paddingTop: 25,
    display: 'flex',
    alignItems: 'center',
  },
  newTextStyle: {
    // maxHeight: Dimensions.get('window').height * 0.3,
    maxHeight: Dimensions.get('window').height - 430,
    width: '100%',
  },
  textContainer: {
    paddingTop: 25,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.white,
    padding: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 5,
    paddingTop: 4,
  },
  lastUpdateText: {
    fontFamily: FontFamily.TimeRoman,
    color: Colors.darkGray,
    fontSize: 13,
    fontWeight: '400',
  },
  termsConditionsText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.deepViolet,
    fontSize: 22,
    fontWeight: '700',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FontFamily.SpaceGrotesk,
  },
  buttonIAgree: {
    backgroundColor: Colors.deepViolet,
    borderRadius: 22,
    width: '100%',
    marginTop: 25,
    padding: 12,
  },

  sliderContainer: {
    marginTop: 30,
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 320,
    marginRight: 10,
  },
  imageTextContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingRight: 16,
    alignItems: 'center',
    shadowColor: '#00000040',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  image: {
    width: 123,
    height: 135,
    resizeMode: 'cover',
    marginRight: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    borderBottomLeftRadius: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    color: Colors.deepViolet,
    fontSize: 18,
    fontFamily: FontFamily.SpaceGrotesk,
    fontWeight: '400',
  },
  description: {
    fontSize: 11,
    color: '#020202',
    fontFamily: FontFamily.SpaceGrotesk,
    marginTop: 4,
    fontWeight: '400',
  },
  dotsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C892FF80',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#C892FF',
    width: 10,
    height: 10,
    borderRadius: 100,
  },
  bottomWrapper: {
    position: 'absolute',
    bottom: 0,
  },
});
export default TermsConditions;
