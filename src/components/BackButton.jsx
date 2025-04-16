import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {BackIcon} from './Icons';
import {Colors} from '../../Utils/Themes';

const BackButton = ({handleBackNext}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={handleBackNext}>
      <View style={styles.iconContainer}>
        <BackIcon />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 30,
    height: 30,
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.deepViolet,
    borderRadius: 15,
  },
});

export default BackButton;
