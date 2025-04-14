import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import Step1 from '../../components/Onboarding/step1';
import Step2 from '../../components/Onboarding/step2';
import Step3 from '../../components/Onboarding/step3';
import Step4 from '../../components/Onboarding/step4';

const Onboarding = ({navigation}) => {
  const [onBoarding, setOnBoarding] = useState({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
  });

  useEffect(() => {
    const defaultGoBack = navigation.goBack;

    navigation.goBack = () => {
      setOnBoarding(prev => {
        if (prev.step2) {
          return {step1: true, step2: false, step3: false, step4: false};
        }
        if (prev.step3) {
          return {step1: false, step2: true, step3: false, step4: false};
        }
        if (prev.step4) {
          return {step1: false, step2: false, step3: true, step4: false};
        }
        defaultGoBack();
        return prev;
      });
    };

    return () => {
      navigation.goBack = defaultGoBack;
    };
  }, []);

  const handleDownArrowStep1 = () => {
    setOnBoarding(prev => ({
      ...prev,
      step1: false,
      step2: true,
    }));
  };

  const handleDownArrowStep2 = () => {
    setOnBoarding(prev => ({
      ...prev,
      step2: false,
      step3: true,
    }));
  };

  const handleDownArrowStep3 = () => {
    setOnBoarding(prev => ({
      ...prev,
      step3: false,
      step4: true,
    }));
  };

  const handleDownArrowStep4 = () => {
    setOnBoarding(prev => ({
      ...prev,
      step4: false,
    }));
    navigation.replace('Login');
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  return (
    <>
      {onBoarding.step1 && (
        <Step1
          handleDownArrowStep1={handleDownArrowStep1}
          handleSkipStep1={handleSkip}
        />
      )}
      {onBoarding.step2 && (
        <Step2
          handleDownArrowStep2={handleDownArrowStep2}
          handleSkipStep2={handleSkip}
        />
      )}
      {onBoarding.step3 && (
        <Step3
          handleDownArrowStep3={handleDownArrowStep3}
          handleSkipStep3={handleSkip}
        />
      )}
      {onBoarding.step4 && (
        <Step4
          handleDownArrowStep4={handleDownArrowStep4}
          handleSkipStep4={handleSkip}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({});

export default Onboarding;
