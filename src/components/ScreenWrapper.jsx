import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';

const ScreenWrapper = ({children}) => {
  return (
    <ImageBackground
      source={require('../assets/Images/background.webp')}
      style={styles.background}>
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
  },
});

export default ScreenWrapper;
