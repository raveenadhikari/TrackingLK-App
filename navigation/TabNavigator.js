import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CommunityScreen from '../screens/CommunityScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
//import { tokens } from 'react-native-paper/lib/typescript/styles/themes/v3/tokens';

const Tab = createBottomTabNavigator();

const TabNavigator = ({route}) => {

    const token = route?.params?.token;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          else if (route.name === 'Community') iconName = 'people-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={ExploreScreen} initialParams={{token}}/>
      <Tab.Screen name="Community" component={CommunityScreen} initialParams={{token}}/>
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{token}}/>
    </Tab.Navigator>
  );
};

export default TabNavigator;
