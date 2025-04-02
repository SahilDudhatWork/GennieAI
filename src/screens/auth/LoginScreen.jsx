import React from 'react';
import {View, Text, Image, StyleSheet, SafeAreaView} from 'react-native';
import BackButton from '../../components/BackButton';
import LoginForm from './LoginForm';
import SocialLogin from './SocialLogin';
import {FontFamily} from '../../../Utils/Themes';

const LoginScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri: 'https://cdn.builder.io/api/v1/image/assets/TEMP/3548550984a0f30a8b23ad29206410d1ff83ab12',
        }}
        style={styles.backgroundImage}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BackButton />
            <Text style={styles.headerTitle}>Login</Text>
          </View>
        </View>

        <Text style={styles.welcomeText}>Welcome back to the app</Text>

        <LoginForm />

        <SocialLogin />

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text
              onPress={() => {
                navigation.navigate('Signup');
              }}
              style={[styles.footerText, styles.underline]}>
              Create an account
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 44,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    // flexDirection: 'row',
    // alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: FontFamily.TimeRoman,
  },
  welcomeText: {
    fontSize: 13,
    color: '#FFF',
    fontFamily: FontFamily.TimeRoman,
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 24,
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: FontFamily.TimeRoman,
  },
  underline: {
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
