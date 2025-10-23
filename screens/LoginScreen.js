import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { AUTH_URL } from '../config/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${AUTH_URL}/login`, { email, password });
      Alert.alert('Success', res.data.message);
      navigation.replace('MainTabs', { token: res.data.token });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.mountainIcon}>
            <Text style={styles.mountainEmoji}>🏔️</Text>
          </View>
          <Text style={styles.logoText}>TrekkingLK</Text>
          <Text style={styles.tagline}>Your Mountain Adventure Companion</Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>📧 Email</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#95a5a6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>🔒 Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#95a5a6"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing in...' : '🚀 Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>
              Create New Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Start your trekking adventure today 🌲
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  mountainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  mountainEmoji: {
    fontSize: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5e3d',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  loginCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5e3d',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: '#d5e8dd',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2c3e50',
  },
  loginButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#95a5a6',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d5e8dd',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#95a5a6',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#f0f9f4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#a8d5ba',
  },
  registerButtonText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});