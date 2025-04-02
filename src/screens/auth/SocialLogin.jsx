import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

const SocialLogin = () => {
  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Or sign in with</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialButtons}>
        <View style={styles.socialButton}>
          <Image
            source={{
              uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/637fc1b593ca369ee6d8b4ef0cb81da4da9342bb',
            }}
            style={styles.socialIcon}
          />
        </View>
        <View style={styles.socialButton}>
          <Image
            source={{
              uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/f20d122f1986c8e9de4d6004addf3f377647fda4',
            }}
            style={[styles.socialIcon, styles.appleIcon]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
    marginTop: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#FFF',
  },
  dividerText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: 'Times New Roman',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 14,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 22.5,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 35,
    height: 35,
  },
  appleIcon: {
    width: 27,
    height: 27,
  },
});

export default SocialLogin;
