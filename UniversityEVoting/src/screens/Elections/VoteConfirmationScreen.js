import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { castElectionVote } from '../../services/electionService';
import { getCurrentUserData } from '../../services/authService';
import { getInitials } from '../../utils/helpers';
import COLORS from '../../styles/colors';

const VoteConfirmationScreen = ({ route, navigation }) => {
  const { election, candidate } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmVote = async () => {
    Alert.alert(
      'Confirm Your Vote',
      'Are you sure you want to vote for this candidate? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm Vote',
          style: 'default',
          onPress: async () => {
            setSubmitting(true);
            try {
              const userResult = await getCurrentUserData();
              if (!userResult.success) {
                Alert.alert('Error', 'Failed to get user data');
                setSubmitting(false);
                return;
              }

              const result = await castElectionVote(
                election.id,
                candidate.id,
                userResult.userData.faculty
              );

              if (result.success) {
                Alert.alert(
                  'Vote Submitted!',
                  'Your vote has been successfully recorded. Thank you for participating!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Navigate back to elections list
                        navigation.popToTop();
                        navigation.navigate('Elections');
                      },
                    },
                  ],
                  { cancelable: false }
                );
              } else {
                Alert.alert('Vote Failed', result.error);
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirm Your Vote</Text>
        <Text style={styles.headerSubtitle}>
          Please review your selection before submitting
        </Text>
      </View>

      {/* Election Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Election</Text>
        <Text style={styles.electionTitle}>{election.title}</Text>
      </View>

      {/* Candidate Card */}
      <View style={styles.candidateCard}>
        <View style={styles.photoContainer}>
          {candidate.photo_url ? (
            <Image source={{ uri: candidate.photo_url }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.initials}>{getInitials(candidate.name)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.candidateName}>{candidate.name}</Text>
        <Text style={styles.candidateFaculty}>{candidate.faculty}</Text>

        {candidate.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioLabel}>About the Candidate:</Text>
            <Text style={styles.bioText}>{candidate.bio}</Text>
          </View>
        )}
      </View>

      {/* Warning Notice */}
      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Important Notice</Text>
          <Text style={styles.warningText}>
            • Your vote is final and cannot be changed{'\n'}
            • You can only vote once in this election{'\n'}
            • Your vote is confidential and secure
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, submitting && styles.buttonDisabled]}
          onPress={handleConfirmVote}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm & Submit Vote</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.primaryLight,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  electionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  candidateCard: {
    backgroundColor: COLORS.white,
    padding: 24,
    marginTop: 12,
    alignItems: 'center',
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  candidateName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  candidateFaculty: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  bioContainer: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#FFF9E6',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    flexDirection: 'row',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#CC8800',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#996600',
    lineHeight: 22,
  },
  actionsContainer: {
    padding: 20,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VoteConfirmationScreen;

