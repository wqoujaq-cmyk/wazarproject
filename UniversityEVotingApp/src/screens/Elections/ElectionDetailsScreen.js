import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { formatDate, getStatusLabel } from '../../utils/helpers';
import COLORS from '../../styles/colors';

const ElectionDetailsScreen = ({ route, navigation }) => {
  const { election, hasVoted } = route.params;
  const isActive = election.computed_status === 'active';

  const getFacultyScopeText = () => {
    if (election.faculty_scope_type === 'ALL_FACULTIES') {
      return 'All Faculties';
    } else if (election.faculty_scope && election.faculty_scope.length > 0) {
      return election.faculty_scope.join(', ');
    }
    return 'Not specified';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{election.title}</Text>
        <View style={[
          styles.badge,
          hasVoted ? styles.badgeVoted : isActive ? styles.badgeActive : styles.badgePending
        ]}>
          <Text style={styles.badgeText}>
            {hasVoted ? 'You Voted' : getStatusLabel(election.computed_status)}
          </Text>
        </View>
      </View>

      {/* Description */}
      {election.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{election.description}</Text>
        </View>
      )}

      {/* Election Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Election Information</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Start Date" value={formatDate(election.start_date)} />
          <InfoRow label="End Date" value={formatDate(election.end_date)} />
          <InfoRow label="Faculty Scope" value={getFacultyScopeText()} />
          <InfoRow label="Status" value={getStatusLabel(election.computed_status)} />
        </View>
      </View>

      {/* Voting Status */}
      {hasVoted && (
        <View style={styles.votedNotice}>
          <Text style={styles.votedIcon}>✓</Text>
          <Text style={styles.votedText}>
            You have already voted in this election. Thank you for participating!
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!hasVoted && isActive && (
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => navigation.navigate('CandidatesList', { election })}
          >
            <Text style={styles.voteButtonText}>View Candidates & Vote</Text>
          </TouchableOpacity>
        )}

        {!isActive && election.computed_status === 'closed' && (
          <TouchableOpacity
            style={styles.resultsButton}
            onPress={() => navigation.navigate('ElectionResults', { electionId: election.id })}
          >
            <Text style={styles.resultsButtonText}>View Results</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Important Notice */}
      {!hasVoted && isActive && (
        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>ℹ️</Text>
          <Text style={styles.noticeText}>
            Remember: You can only vote once in this election. Your vote cannot be changed after submission.
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
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
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
    marginBottom: 12,
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

export default ElectionDetailsScreen;

