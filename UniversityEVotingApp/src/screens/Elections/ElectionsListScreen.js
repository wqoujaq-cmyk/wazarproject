import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getActiveElectionsForUser, hasVotedInElection } from '../../services/electionService';
import { getCurrentUserData } from '../../services/authService';
import { formatDateShort, getStatusLabel } from '../../utils/helpers';
import COLORS from '../../styles/colors';

const ElectionsListScreen = ({ navigation }) => {
  const [elections, setElections] = useState([]);
  const [votedElections, setVotedElections] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userFaculty, setUserFaculty] = useState('');

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      // Get user data
      const userResult = await getCurrentUserData();
      if (!userResult.success) {
        console.error('Failed to get user data');
        return;
      }
      
      const faculty = userResult.userData.faculty;
      setUserFaculty(faculty);

      // Get elections
      const result = await getActiveElectionsForUser(faculty);
      if (result.success) {
        setElections(result.elections);
        
        // Check vote status for each election
        const voteStatus = {};
        for (const election of result.elections) {
          const voteResult = await hasVotedInElection(election.id);
          if (voteResult.success) {
            voteStatus[election.id] = voteResult.hasVoted;
          }
        }
        setVotedElections(voteStatus);
      }
    } catch (error) {
      console.error('Load elections error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadElections();
  };

  const renderElectionCard = ({ item }) => {
    const hasVoted = votedElections[item.id] || false;
    const isActive = item.computed_status === 'active';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ElectionDetails', { election: item, hasVoted })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={[
            styles.badge,
            hasVoted ? styles.badgeVoted : isActive ? styles.badgeActive : styles.badgePending
          ]}>
            <Text style={styles.badgeText}>
              {hasVoted ? 'Voted' : getStatusLabel(item.computed_status)}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Starts:</Text>
          <Text style={styles.infoValue}>{formatDateShort(item.start_date)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ends:</Text>
          <Text style={styles.infoValue}>{formatDateShort(item.end_date)}</Text>
        </View>

        {!hasVoted && isActive && (
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => navigation.navigate('CandidatesList', { election: item })}
          >
            <Text style={styles.voteButtonText}>Vote Now</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading elections...</Text>
      </View>
    );
  }

  if (elections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Elections Available</Text>
        <Text style={styles.emptyText}>
          There are no active elections for your faculty at the moment.
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={elections}
        renderItem={renderElectionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  voteButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  voteButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ElectionsListScreen;

