import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  Platform,
  StatusBar,
} from 'react-native';

const ScreenWrapper = ({children, isSpecialBg, style}) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={
          isSpecialBg
            ? require('../assets/Images/new_splash_screen.png')
            : require('../assets/Images/splash_screen.png')
        }
        style={[
          styles.background,
          style,
          {
            paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight : '',
          },
        ]}>
        <View style={styles.overlay}>{children}</View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    padding: 15,
  },
  overlay: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
  },
});

export default ScreenWrapper;
