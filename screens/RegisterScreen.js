import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { AUTH_URL } from '../config/api';

export default function RegisterScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!userName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const res = await axios.post(`${AUTH_URL}/register`, {
        userName,
        email,
        password,
        phoneNumber,
      });

      Alert.alert('Success', res.data.message);
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logoText}>TrackingLK</Text>
      <Text style={styles.welcome}>Join us!</Text>
      <Text style={styles.signin}>Create Account</Text>
      <Text style={styles.info}>Please fill your informations</Text>

      <TextInput
        placeholder="Full Name"
        value={userName}
        onChangeText={setUserName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginText}>Go to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  registerButton: {
    backgroundColor: '#28a745', // ✅ green button
    paddingVertical: 12,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: 6,
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginVertical: 6,
  },
  loginText: {
    color: '#333',
    fontWeight: '600',
  },
});
