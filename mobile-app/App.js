/**
 * E-Voting & Polling Mobile Application
 * Main App Component
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import ElectionsListScreen from './src/screens/Elections/ElectionsListScreen';
import ElectionDetailsScreen from './src/screens/Elections/ElectionDetailsScreen';
import CandidatesListScreen from './src/screens/Elections/CandidatesListScreen';
import VoteConfirmationScreen from './src/screens/Elections/VoteConfirmationScreen';
import PollsListScreen from './src/screens/Polls/PollsListScreen';
import PollDetailsScreen from './src/screens/Polls/PollDetailsScreen';
import PollVoteConfirmationScreen from './src/screens/Polls/PollVoteConfirmationScreen';
import ElectionResultsScreen from './src/screens/Results/ElectionResultsScreen';
import PollResultsScreen from './src/screens/Results/PollResultsScreen';

// Import services
import { onAuthStateChanged, getCurrentUserData } from './src/services/authService';

// Import styles
import COLORS from './src/styles/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Elections') {
            iconName = 'how-to-vote';
          } else if (route.name === 'Polls') {
            iconName = 'poll';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Elections" 
        component={ElectionsListScreen}
        options={{ title: 'Elections' }}
      />
      <Tab.Screen 
        name="Polls" 
        component={PollsListScreen}
        options={{ title: 'Polls' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack for non-authenticated users
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'Login', headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Register' }}
      />
    </Stack.Navigator>
  );
};

// Main App Stack
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ElectionDetails" 
        component={ElectionDetailsScreen}
        options={{ title: 'Election Details' }}
      />
      <Stack.Screen 
        name="CandidatesList" 
        component={CandidatesListScreen}
        options={{ title: 'Candidates' }}
      />
      <Stack.Screen 
        name="VoteConfirmation" 
        component={VoteConfirmationScreen}
        options={{ title: 'Confirm Vote' }}
      />
      <Stack.Screen 
        name="PollDetails" 
        component={PollDetailsScreen}
        options={{ title: 'Poll Details' }}
      />
      <Stack.Screen 
        name="PollVoteConfirmation" 
        component={PollVoteConfirmationScreen}
        options={{ title: 'Confirm Vote' }}
      />
      <Stack.Screen 
        name="ElectionResults" 
        component={ElectionResultsScreen}
        options={{ title: 'Results' }}
      />
      <Stack.Screen 
        name="PollResults" 
        component={PollResultsScreen}
        options={{ title: 'Poll Results' }}
      />
    </Stack.Navigator>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        const result = await getCurrentUserData();
        if (result.success) {
          setUserData(result.userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        // User is signed out
        setIsAuthenticated(false);
        setUserData(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <NavigationContainer>
        {isAuthenticated ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </>
  );
};

export default App;

