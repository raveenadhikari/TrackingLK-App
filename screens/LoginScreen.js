import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { AUTH_URL } from '../config/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const res = await axios.post(`${AUTH_URL}/login`, { email, password });
      Alert.alert('Success', res.data.message);
      navigation.replace('MainTabs', { token: res.data.token });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>TrackingLK</Text>
      <Text style={styles.welcome}>Wellcome!</Text>
      <Text style={styles.signin}>Sign in</Text>
      <Text style={styles.info}>Please fill your informations</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>Go to Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoText: {
    fontSize: 28,
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  welcome: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  signin: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 14,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#28a745', // ✅ green button
    paddingVertical: 12,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: 6,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: 6,
  },
  registerText: {
    color: '#333',
    fontWeight: '600',
  },
});
