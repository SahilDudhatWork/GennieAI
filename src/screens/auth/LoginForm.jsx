import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {EmailIcon, LockIcon} from '../../components/Icons';

const LoginForm = () => {
  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#FFF"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#FFF"
            secureTextEntry
            style={styles.input}
          />
        </View>
      </View>
      <Text style={styles.forgotPassword}>Forgot Password?</Text>

      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 48,
    gap: 10,
  },
  inputGroup: {
    gap: 8,
    marginTop: 10,
  },
  label: {
    fontSize: 15,
    color: '#FFF',
    fontFamily: 'Times New Roman',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#FFFFFF59',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'Times New Roman',
  },
  loginButton: {
    backgroundColor: '#FFF',
    height: 40,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#4A05AD',
    fontFamily: 'Times New Roman',
  },
  forgotPassword: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: 'Times New Roman',
    textDecorationLine: 'underline',
    textAlign: 'right',
  },
});

export default LoginForm;
