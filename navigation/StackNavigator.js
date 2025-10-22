import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './TabNavigator';
import PlaceDetailsScreen from '../screens/PlaceDetailsScreen'; // ✅ import new screen

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 🔐 Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* 🧭 Main Tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* 📍 Place Details (opened from Explore) */}
      <Stack.Screen 
        name="PlaceDetails" 
        component={PlaceDetailsScreen}
        options={{ headerShown: true, title: 'Place Details' }} // show header for details
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
