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
import { getActivePollsForUser } from '../../services/pollService';
import { hasUserVotedInPoll } from '../../services/userService';
import { getCurrentUserData } from '../../services/authService';
import { formatDateShort, getStatusLabel } from '../../utils/helpers';
import COLORS from '../../styles/colors';

const PollsListScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [votedPolls, setVotedPolls] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const userResult = await getCurrentUserData();
      if (!userResult.success) {
        console.error('Failed to get user data');
        return;
      }

      const faculty = userResult.userData.faculty;
      const result = await getActivePollsForUser(faculty);
      
      if (result.success) {
        setPolls(result.polls);
        
        // Check vote status for each poll
        const voteStatus = {};
        for (const poll of result.polls) {
          const voteResult = await hasUserVotedInPoll(poll.id);
          if (voteResult.success) {
            voteStatus[poll.id] = voteResult.hasVoted;
          }
        }
        setVotedPolls(voteStatus);
      }
    } catch (error) {
      console.error('Load polls error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPolls();
  };

  const renderPollCard = ({ item }) => {
    const hasVoted = votedPolls[item.id] || false;
    const isActive = item.computed_status === 'active';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PollDetails', { poll: item, hasVoted })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📊</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
          <View style={[
            styles.badge,
            hasVoted ? styles.badgeVoted : isActive ? styles.badgeActive : styles.badgePending
          ]}>
            <Text style={styles.badgeText}>
              {hasVoted ? 'Voted' : getStatusLabel(item.computed_status)}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ends:</Text>
          <Text style={styles.infoValue}>{formatDateShort(item.end_date)}</Text>
        </View>

        {!hasVoted && isActive && (
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => navigation.navigate('PollDetails', { poll: item, hasVoted })}
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
        <Text style={styles.loadingText}>Loading polls...</Text>
      </View>
    );
  }

  if (polls.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Polls Available</Text>
        <Text style={styles.emptyText}>
          There are no active polls for your faculty at the moment.
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
        data={polls}
        renderItem={renderPollCard}
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontSize: 11,
    fontWeight: '600',
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

export default PollsListScreen;

