/**
 * E-Voting & Polling Mobile Application
 * Working version with placeholder screens
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Only import screens that work
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';

import COLORS from './src/styles/colors';

const Stack = createNativeStackNavigator();

// Elections List Screen (inline)
const ElectionsScreen = ({ navigation }) => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadElections = async () => {
      try {
        const snapshot = await firestore().collection('Elections').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setElections(data);
      } catch (error) {
        console.error('Error loading elections:', error);
      } finally {
        setLoading(false);
      }
    };
    loadElections();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      {elections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗳️</Text>
          <Text style={styles.emptyTitle}>No Elections Available</Text>
          <Text style={styles.emptyText}>Check back later for upcoming elections.</Text>
        </View>
      ) : (
        elections.map(election => (
          <View key={election.id} style={styles.card}>
            <Text style={styles.cardTitle}>{election.title}</Text>
            <Text style={styles.cardDescription}>{election.description}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

// Polls List Screen (inline)
const PollsScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolls = async () => {
      try {
        const snapshot = await firestore().collection('Polls').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPolls(data);
      } catch (error) {
        console.error('Error loading polls:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPolls();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      {polls.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Polls Available</Text>
          <Text style={styles.emptyText}>Check back later for upcoming polls.</Text>
        </View>
      ) : (
        polls.map(poll => (
          <View key={poll.id} style={styles.card}>
            <Text style={styles.cardTitle}>{poll.title}</Text>
            <Text style={styles.cardDescription}>{poll.description}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

// Profile Screen (inline)
const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth().currentUser;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user) {
          const doc = await firestore().collection('Users').doc(user.uid).get();
          if (doc.exists) {
            setUserData(doc.data());
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.profileName}>{userData?.name || 'Unknown'}</Text>
        <Text style={styles.profileId}>{userData?.university_id || user?.email}</Text>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Faculty:</Text>
          <Text style={styles.infoValue}>{userData?.faculty || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Major:</Text>
          <Text style={styles.infoValue}>{userData?.major || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role:</Text>
          <Text style={styles.infoValue}>{userData?.role || 'voter'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

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

// App Stack
const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'E-Voting App' }} />
    <Stack.Screen name="Elections" component={ElectionsScreen} />
    <Stack.Screen name="Polls" component={PollsScreen} />
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
  screenContainer: { flex: 1, backgroundColor: '#f5f5f5' },
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center' },
  card: { backgroundColor: '#fff', margin: 16, marginBottom: 8, padding: 16, borderRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#666' },
  profileHeader: { backgroundColor: COLORS.primary, padding: 30, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  profileId: { fontSize: 14, color: '#fff', opacity: 0.9 },
  profileInfo: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12, elevation: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 15, color: '#666' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333' },
});

export default App;
