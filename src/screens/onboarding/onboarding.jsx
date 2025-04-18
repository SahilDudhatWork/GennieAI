import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, ScrollView, StyleSheet, View} from 'react-native';
import Step1 from '../../components/Onboarding/step1';
import Step2 from '../../components/Onboarding/step2';
import Step3 from '../../components/Onboarding/step3';
import Step4 from '../../components/Onboarding/step4';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

const Onboarding = ({navigation}) => {
  const scrollRef = useRef();
  const [onBoarding, setOnBoarding] = useState({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
  });

  const goToPage = index => {
    scrollRef.current.scrollTo({x: index * width, animated: true});
  };

  const handleBackNext = () => {
    if (onBoarding.step1) {
      navigation.goBack();
    } else if (onBoarding.step2) {
      setOnBoarding({step1: true, step2: false, step3: false, step4: false});
      goToPage(0);
    } else if (onBoarding.step3) {
      setOnBoarding({step1: false, step2: true, step3: false, step4: false});
      goToPage(1);
    } else if (onBoarding.step4) {
      setOnBoarding({step1: false, step2: false, step3: true, step4: false});
      goToPage(2);
    }
  };

  const handleDownArrowStep1 = () => {
    setOnBoarding({
      step1: false,
      step2: true,
      step3: false,
      step4: false,
    });
    goToPage(1);
  };

  const handleDownArrowStep2 = () => {
    setOnBoarding({
      step1: false,
      step2: false,
      step3: true,
      step4: false,
    });
    goToPage(2);
  };

  const handleDownArrowStep3 = () => {
    setOnBoarding({
      step1: false,
      step2: false,
      step3: false,
      step4: true,
    });
    goToPage(3);
  };

  const handleDownArrowStep4 = async () => {
    setOnBoarding({
      step1: false,
      step2: false,
      step3: false,
      step4: false,
    });
    const isOnbording = await AsyncStorage.getItem('isOnbording');
    if (!isOnbording) {
      await AsyncStorage.setItem('isOnbording', 'true');
    }
    navigation.navigate('Main', {screen: 'Chat'});
  };

  const handleScrollEnd = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentPage = Math.round(offsetX / width);

    switch (currentPage) {
      case 0:
        setOnBoarding({step1: true, step2: false, step3: false, step4: false});
        break;
      case 1:
        setOnBoarding({step1: false, step2: true, step3: false, step4: false});
        break;
      case 2:
        setOnBoarding({step1: false, step2: false, step3: true, step4: false});
        break;
      case 3:
        setOnBoarding({step1: false, step2: false, step3: false, step4: true});
        break;
      default:
        break;
    }
  };

  const handleSkip = async () => {
    const isOnbording = await AsyncStorage.getItem('isOnbording');
    if (!isOnbording) {
      await AsyncStorage.setItem('isOnbording', 'true');
    }
    navigation.navigate('Main', {screen: 'Chat'});
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      scrollEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      onMomentumScrollEnd={handleScrollEnd}>
      <View style={styles.page}>
        {onBoarding.step1 && (
          <Step1
            handleDownArrowStep1={handleDownArrowStep1}
            handleSkipStep1={handleSkip}
            handleBackNext={handleBackNext}
          />
        )}
      </View>
      <View style={styles.page}>
        {onBoarding.step2 && (
          <Step2
            handleDownArrowStep2={handleDownArrowStep2}
            handleSkipStep2={handleSkip}
            handleBackNext={handleBackNext}
          />
        )}
      </View>
      <View style={styles.page}>
        {onBoarding.step3 && (
          <Step3
            handleDownArrowStep3={handleDownArrowStep3}
            handleSkipStep3={handleSkip}
            handleBackNext={handleBackNext}
          />
        )}
      </View>
      <View style={styles.page}>
        {onBoarding.step4 && (
          <Step4
            handleDownArrowStep4={handleDownArrowStep4}
            handleSkipStep4={handleSkip}
            handleBackNext={handleBackNext}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    alignItems: 'center',
  },
  page: {
    width: width,
    flex: 1,
  },
});

export default Onboarding;
