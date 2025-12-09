import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  getCurrentUserData,
  updateProfilePicture,
  removeProfilePicture,
  logoutUser,
} from '../../services/authService';
import { getInitials } from '../../utils/helpers';
import COLORS from '../../styles/colors';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    const result = await getCurrentUserData();
    if (result.success) {
      setUserData(result.userData);
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  const handleChangePhoto = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to pick image');
      } else {
        setUploadingPhoto(true);
        const uri = response.assets[0].uri;
        const result = await updateProfilePicture(uri);
        
        if (result.success) {
          // Reload user data
          await loadUserData();
          Alert.alert('Success', 'Profile picture updated');
        } else {
          Alert.alert('Error', result.error);
        }
        setUploadingPhoto(false);
      }
    });
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setUploadingPhoto(true);
            const result = await removeProfilePicture();
            if (result.success) {
              await loadUserData();
              Alert.alert('Success', 'Profile picture removed');
            } else {
              Alert.alert('Error', result.error);
            }
            setUploadingPhoto(false);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          // Navigation is handled automatically by App.js
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          {userData.photo_url ? (
            <Image source={{ uri: userData.photo_url }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.initials}>{getInitials(userData.name)}</Text>
            </View>
          )}
          {uploadingPhoto && (
            <View style={styles.photoOverlay}>
              <ActivityIndicator color={COLORS.white} />
            </View>
          )}
        </View>
        
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.universityId}>{userData.university_id}</Text>

        {/* Photo Actions */}
        <View style={styles.photoActions}>
          <TouchableOpacity
            style={styles.photoActionButton}
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
          >
            <Text style={styles.photoActionText}>
              {userData.photo_url ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
          {userData.photo_url && (
            <TouchableOpacity
              style={[styles.photoActionButton, styles.photoActionButtonDanger]}
              onPress={handleRemovePhoto}
              disabled={uploadingPhoto}
            >
              <Text style={[styles.photoActionText, styles.photoActionTextDanger]}>
                Remove Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.infoCard}>
          <InfoRow label="University ID" value={userData.university_id} />
          <InfoRow label="Faculty" value={userData.faculty} />
          <InfoRow label="Major" value={userData.major} />
          <InfoRow label="Role" value={userData.role === 'voter' ? 'Student Voter' : 'Administrator'} />
          <InfoRow label="Status" value={userData.is_active ? 'Active' : 'Inactive'} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>University E-Voting System v1.0</Text>
        <Text style={styles.footerText}>© 2025 Student Council</Text>
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  universityId: {
    fontSize: 16,
    color: COLORS.primaryLight,
  },
  photoActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  photoActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  photoActionButtonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  photoActionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  photoActionTextDanger: {
    color: COLORS.white,
  },
  infoContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});

export default ProfileScreen;

