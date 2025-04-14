import React from 'react';
import {ImageBackground, StyleSheet, View,Platform, StatusBar} from 'react-native';

const ScreenWrapper = ({children, isSpecialBg, style}) => {
  return (
    <ImageBackground
      source={
        isSpecialBg
          ? require('../assets/Images/new_splash_screen.png')
          : require('../assets/Images/splash_screen.png')
      }
      style={[styles.background, style,{paddingTop: Platform.OS === "ios" ? StatusBar.currentHeight : 0}]}>
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 15,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    paddingTop: 10,
    paddingTop:Platform.OS ==='ios' ? 50 : 10,
  },
});

export default ScreenWrapper;
