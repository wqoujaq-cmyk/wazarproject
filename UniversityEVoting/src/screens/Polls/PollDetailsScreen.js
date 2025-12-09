import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getPollOptions } from '../../services/pollService';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import COLORS from '../../styles/colors';

const PollDetailsScreen = ({ route, navigation }) => {
  const { poll, hasVoted } = route.params;
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);

  const isActive = poll.computed_status === 'active';

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const result = await getPollOptions(poll.id);
      if (result.success) {
        setOptions(result.options);
      }
    } catch (error) {
      console.error('Load poll options error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = () => {
    if (!selectedOption) {
      return;
    }
    navigation.navigate('PollVoteConfirmation', {
      poll,
      option: selectedOption,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{poll.title}</Text>
        <View style={[
          styles.badge,
          hasVoted ? styles.badgeVoted : isActive ? styles.badgeActive : styles.badgePending
        ]}>
          <Text style={styles.badgeText}>
            {hasVoted ? 'You Voted' : getStatusLabel(poll.computed_status)}
          </Text>
        </View>
      </View>

      {/* Description */}
      {poll.description && (
        <View style={styles.section}>
          <Text style={styles.description}>{poll.description}</Text>
        </View>
      )}

      {/* Poll Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Poll Information</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Start Date" value={formatDate(poll.start_date)} />
          <InfoRow label="End Date" value={formatDate(poll.end_date)} />
          <InfoRow label="Status" value={getStatusLabel(poll.computed_status)} />
        </View>
      </View>

      {/* Options */}
      {!hasVoted && isActive && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Answer</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedOption?.id === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <View style={[
                styles.radio,
                selectedOption?.id === option.id && styles.radioSelected,
              ]}>
                {selectedOption?.id === option.id && <View style={styles.radioDot} />}
              </View>
              <Text style={[
                styles.optionText,
                selectedOption?.id === option.id && styles.optionTextSelected,
              ]}>
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Voted Notice */}
      {hasVoted && (
        <View style={styles.votedNotice}>
          <Text style={styles.votedIcon}>✓</Text>
          <Text style={styles.votedText}>
            You have already voted in this poll. Thank you for participating!
          </Text>
        </View>
      )}

      {/* Action Button */}
      {!hasVoted && isActive && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.voteButton, !selectedOption && styles.voteButtonDisabled]}
            onPress={handleVote}
            disabled={!selectedOption}
          >
            <Text style={styles.voteButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View Results Button */}
      {poll.computed_status === 'closed' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.resultsButton}
            onPress={() => navigation.navigate('PollResults', { pollId: poll.id })}
          >
            <Text style={styles.resultsButtonText}>View Results</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Important Notice */}
      {!hasVoted && isActive && (
        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            You can only vote once in this poll. Your vote cannot be changed after submission.
          </Text>
        </View>
      )}
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
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeActive: {
    backgroundColor: COLORS.success,
  },
  badgePending: {
    backgroundColor: COLORS.warning,
  },
  badgeVoted: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  votedNotice: {
    backgroundColor: COLORS.primaryLight,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  votedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  votedText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 20,
  },
  voteButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  voteButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  voteButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resultsButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  resultsButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  notice: {
    backgroundColor: COLORS.gray100,
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 8,
    flexDirection: 'row',
  },
  noticeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default PollDetailsScreen;

