import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { getCandidatesForElection } from '../../services/electionService';
import { getCurrentUserData } from '../../services/authService';
import { getInitials } from '../../utils/helpers';
import COLORS from '../../styles/colors';

const CandidatesListScreen = ({ route, navigation }) => {
  const { election } = route.params;
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const userResult = await getCurrentUserData();
      if (!userResult.success) {
        console.error('Failed to get user data');
        return;
      }

      const result = await getCandidatesForElection(election.id, userResult.userData.faculty);
      if (result.success) {
        setCandidates(result.candidates);
      }
    } catch (error) {
      console.error('Load candidates error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (candidate) => {
    navigation.navigate('VoteConfirmation', {
      election,
      candidate,
    });
  };

  const renderCandidateCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectCandidate(item)}
    >
      <View style={styles.photoContainer}>
        {item.photo_url ? (
          <Image source={{ uri: item.photo_url }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.initials}>{getInitials(item.name)}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.faculty}>{item.faculty}</Text>
        {item.bio && (
          <Text style={styles.bio} numberOfLines={3}>
            {item.bio}
          </Text>
        )}
      </View>

      <View style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Select</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading candidates...</Text>
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🗳️</Text>
        <Text style={styles.emptyTitle}>No Candidates</Text>
        <Text style={styles.emptyText}>
          There are no candidates registered for this election yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select a Candidate</Text>
        <Text style={styles.headerSubtitle}>
          Choose one candidate to vote for in this election
        </Text>
      </View>

      <FlatList
        data={candidates}
        renderItem={renderCandidateCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.primaryLight,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  faculty: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CandidatesListScreen;

