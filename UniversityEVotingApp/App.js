/**
 * E-Voting & Polling Mobile Application
 * Full-featured version with all screens
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Auth Screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';

// Election Screens
import ElectionsListScreen from './src/screens/Elections/ElectionsListScreen';
import ElectionDetailsScreen from './src/screens/Elections/ElectionDetailsScreen';
import CandidatesListScreen from './src/screens/Elections/CandidatesListScreen';
import VoteConfirmationScreen from './src/screens/Elections/VoteConfirmationScreen';

// Poll Screens
import PollsListScreen from './src/screens/Polls/PollsListScreen';
import PollDetailsScreen from './src/screens/Polls/PollDetailsScreen';
import PollVoteConfirmationScreen from './src/screens/Polls/PollVoteConfirmationScreen';

// Profile Screen
import ProfileScreen from './src/screens/Profile/ProfileScreen';

// Results Screens
import ElectionResultsScreen from './src/screens/Results/ElectionResultsScreen';
import PollResultsScreen from './src/screens/Results/PollResultsScreen';

import COLORS from './src/styles/colors';

const Stack = createNativeStackNavigator();


// Home Screen
const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try { await auth().signOut(); } catch (e) { console.error(e); }
  };

  return (
    <SafeAreaView style={styles.homeContainer}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeTitle}>🗳️ University E-Voting</Text>
        <Text style={styles.homeSubtitle}>Student Council Elections</Text>
      </View>
      
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Elections')}>
          <Text style={styles.menuIcon}>🗳️</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Elections</Text>
            <Text style={styles.menuDescription}>View and vote in elections</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Polls')}>
          <Text style={styles.menuIcon}>📊</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Polls</Text>
            <Text style={styles.menuDescription}>Participate in polls</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.menuIcon}>👤</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>My Profile</Text>
            <Text style={styles.menuDescription}>View your profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, styles.logoutText]}>Logout</Text>
            <Text style={styles.menuDescription}>Sign out of your account</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: 'Register', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: 'Forgot Password', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }} />
  </Stack.Navigator>
);

// App Stack with full navigation
const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'E-Voting App' }} />
    
    {/* Elections Flow */}
    <Stack.Screen name="Elections" component={ElectionsListScreen} options={{ title: 'Elections' }} />
    <Stack.Screen name="ElectionDetails" component={ElectionDetailsScreen} options={{ title: 'Election Details' }} />
    <Stack.Screen name="CandidatesList" component={CandidatesListScreen} options={{ title: 'Candidates' }} />
    <Stack.Screen name="VoteConfirmation" component={VoteConfirmationScreen} options={{ title: 'Confirm Vote' }} />
    <Stack.Screen name="ElectionResults" component={ElectionResultsScreen} options={{ title: 'Results' }} />
    
    {/* Polls Flow */}
    <Stack.Screen name="Polls" component={PollsListScreen} options={{ title: 'Polls' }} />
    <Stack.Screen name="PollDetails" component={PollDetailsScreen} options={{ title: 'Poll Details' }} />
    <Stack.Screen name="PollVoteConfirmation" component={PollVoteConfirmationScreen} options={{ title: 'Confirm Vote' }} />
    <Stack.Screen name="PollResults" component={PollResultsScreen} options={{ title: 'Poll Results' }} />
    
    {/* Profile */}
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
  </Stack.Navigator>
);

// Main App
const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  if (initializing) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <NavigationContainer>
        {user ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  homeContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  homeHeader: { backgroundColor: COLORS.primary, padding: 30, alignItems: 'center' },
  homeTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  homeSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9 },
  menuContainer: { padding: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 12, elevation: 2 },
  logoutItem: { marginTop: 10, borderWidth: 1, borderColor: COLORS.error },
  menuIcon: { fontSize: 36, marginRight: 15 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  logoutText: { color: COLORS.error },
  menuDescription: { fontSize: 13, color: '#666' },
});

export default App;
