import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getPollResults } from '../../services/pollService';
import COLORS from '../../styles/colors';

const PollResultsScreen = ({ route }) => {
  const { pollId } = route.params;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const result = await getPollResults(pollId);
      if (result.success) {
        setResults(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Load poll results error:', err);
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

  const topOption = results.results[0];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{results.poll.title}</Text>
        {results.poll.description && (
          <Text style={styles.description}>{results.poll.description}</Text>
        )}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{results.totalVotes}</Text>
            <Text style={styles.statLabel}>Total Responses</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{results.results.length}</Text>
            <Text style={styles.statLabel}>Options</Text>
          </View>
        </View>
      </View>

      {/* Top Option */}
      {topOption && topOption.votes > 0 && (
        <View style={styles.topOptionCard}>
          <Text style={styles.topBadge}>🥇 Most Popular</Text>
          <Text style={styles.topOptionText}>{topOption.text}</Text>
          <View style={styles.topOptionStats}>
            <Text style={styles.topVotes}>{topOption.votes} votes</Text>
            <Text style={styles.topPercentage}>({topOption.percentage}%)</Text>
          </View>
        </View>
      )}

      {/* All Results */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>All Responses</Text>
        {results.results.map((option, index) => (
          <View key={option.id} style={styles.resultCard}>
            <View style={styles.rankContainer}>
              <Text style={styles.rank}>#{index + 1}</Text>
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionText}>{option.text}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${option.percentage}%` },
                  ]}
                />
              </View>
            </View>
            <View style={styles.voteInfo}>
              <Text style={styles.voteCount}>{option.votes}</Text>
              <Text style={styles.votePercentage}>{option.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Visual Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Distribution Chart</Text>
        <View style={styles.chartContainer}>
          {results.results.map((option) => (
            <View key={option.id} style={styles.barContainer}>
              <Text style={styles.barLabel} numberOfLines={1}>
                {option.text}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${option.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>
                {option.votes} ({option.percentage}%)
              </Text>
            </View>
          ))}
        </View>
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.primaryLight,
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
  topOptionCard: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    padding: 24,
    alignItems: 'center',
  },
  topBadge: {
    fontSize: 24,
    marginBottom: 16,
  },
  topOptionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  topOptionStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  topVotes: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
    marginRight: 8,
  },
  topPercentage: {
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
  optionInfo: {
    flex: 1,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
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
  chartContainer: {
    marginTop: 8,
  },
  barContainer: {
    marginBottom: 20,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
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

export default PollResultsScreen;

