import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { castPollVote } from '../../services/pollService';
import { getCurrentUserData } from '../../services/authService';
import COLORS from '../../styles/colors';

const PollVoteConfirmationScreen = ({ route, navigation }) => {
  const { poll, option } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmVote = async () => {
    Alert.alert(
      'Confirm Your Vote',
      'Are you sure you want to submit this answer? This action cannot be undone.',
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

              const result = await castPollVote(
                poll.id,
                option.id,
                userResult.userData.faculty
              );

              if (result.success) {
                Alert.alert(
                  'Vote Submitted!',
                  'Your response has been successfully recorded. Thank you for participating!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        navigation.popToTop();
                        navigation.navigate('Polls');
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

      {/* Poll Info */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Poll Question</Text>
        <Text style={styles.pollTitle}>{poll.title}</Text>
        {poll.description && (
          <Text style={styles.pollDescription}>{poll.description}</Text>
        )}
      </View>

      {/* Selected Option */}
      <View style={styles.optionCard}>
        <Text style={styles.optionLabel}>Your Answer:</Text>
        <View style={styles.optionBox}>
          <Text style={styles.optionText}>{option.text}</Text>
        </View>
      </View>

      {/* Warning Notice */}
      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Important Notice</Text>
          <Text style={styles.warningText}>
            • Your vote is final and cannot be changed{'\n'}
            • You can only vote once in this poll{'\n'}
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
    marginBottom: 8,
  },
  pollTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  pollDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginTop: 12,
  },
  optionLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  optionBox: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
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

export default PollVoteConfirmationScreen;

