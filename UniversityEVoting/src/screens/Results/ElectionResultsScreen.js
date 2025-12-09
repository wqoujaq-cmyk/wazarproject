import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { getElectionResults } from '../../services/electionService';
import { getInitials, calculatePercentage } from '../../utils/helpers';
import COLORS from '../../styles/colors';

const ElectionResultsScreen = ({ route }) => {
  const { electionId } = route.params;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const result = await getElectionResults(electionId);
      if (result.success) {
        setResults(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Load results error:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Results Not Available</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const winner = results.results[0];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{results.election.title}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{results.totalVotes}</Text>
            <Text style={styles.statLabel}>Total Votes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{results.results.length}</Text>
            <Text style={styles.statLabel}>Candidates</Text>
          </View>
        </View>
      </View>

      {/* Winner Card */}
      {winner && winner.votes > 0 && (
        <View style={styles.winnerCard}>
          <Text style={styles.winnerBadge}>🏆 Winner</Text>
          <View style={styles.photoContainer}>
            {winner.photo_url ? (
              <Image source={{ uri: winner.photo_url }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.initials}>{getInitials(winner.name)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.winnerName}>{winner.name}</Text>
          <Text style={styles.winnerFaculty}>{winner.faculty}</Text>
          <View style={styles.winnerStats}>
            <Text style={styles.winnerVotes}>{winner.votes} votes</Text>
            <Text style={styles.winnerPercentage}>({winner.percentage}%)</Text>
          </View>
        </View>
      )}

      {/* All Results */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>All Results</Text>
        {results.results.map((candidate, index) => (
          <View key={candidate.id} style={styles.resultCard}>
            <View style={styles.rankContainer}>
              <Text style={styles.rank}>#{index + 1}</Text>
            </View>
            <View style={styles.candidateInfo}>
              <Text style={styles.candidateName}>{candidate.name}</Text>
              <Text style={styles.candidateFaculty}>{candidate.faculty}</Text>
            </View>
            <View style={styles.voteInfo}>
              <Text style={styles.voteCount}>{candidate.votes}</Text>
              <Text style={styles.votePercentage}>{candidate.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Vote Distribution Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Vote Distribution</Text>
        {results.results.map((candidate) => (
          <View key={candidate.id} style={styles.barContainer}>
            <Text style={styles.barLabel} numberOfLines={1}>
              {candidate.name}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${candidate.percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.barValue}>{candidate.votes}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

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
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.primaryLight,
  },
  winnerCard: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    padding: 24,
    alignItems: 'center',
  },
  winnerBadge: {
    fontSize: 24,
    marginBottom: 16,
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
  winnerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  winnerFaculty: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  winnerStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  winnerVotes: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
    marginRight: 8,
  },
  winnerPercentage: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  resultsSection: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankContainer: {
    width: 40,
    marginRight: 12,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  candidateFaculty: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  voteInfo: {
    alignItems: 'flex-end',
  },
  voteCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  votePercentage: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  chartSection: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    padding: 20,
    marginBottom: 20,
  },
  barContainer: {
    marginBottom: 16,
  },
  barLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  barTrack: {
    height: 30,
    backgroundColor: COLORS.gray200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  barValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
});

export default ElectionResultsScreen;

