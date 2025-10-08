// -----------------------------------------------------------------------------
// Purpose: Dual-purpose matching screen for both mentees and mentors
// Features:
// - Mentees match with mentors (people who can help them)
// - Mentors match with mentees (people they can help/clients)
// - Clean, intuitive swipe-based interface
// - Real-time compatibility scoring
// - Integration with existing connection system
// - Modern UI with smooth animations
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image as ExpoImage } from "expo-image";
import { 
  getSuggestedMatches, 
  createConnectionFromMatch, 
  declineMatch 
} from "../../services/matchingService";
import Navbar from "../../components/Navbar";
import Skills from "../../components/Skills";

const { width: screenWidth } = Dimensions.get("window");

// Define possible skills and interests (matching the old system)
const possibleSkills = [
  "Business", "Content Writing", "Development", "Hospitality", "Management",
  "Entrepreneur", "Videography", "Law", "Health"
];

const possibleInterests = [
  "Leadership", "Management", "Development", "Communication", "Creativity",
  "Business", "Content Writing", "Hospitality", "Videography", "Law"
];

const MentorMatching = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid, pid, type } = route.params || {};

  // State management
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [noMoreMatches, setNoMoreMatches] = useState(false);
  const [shownMatchIds, setShownMatchIds] = useState([]); // Track shown matches

  // Current match data
  const [currentMatch, setCurrentMatch] = useState(null);

  // Determine user role and target type
  const userType = type || "Mentee"; // Default to Mentee for backward compatibility
  const targetType = userType === "Mentee" ? "Mentor" : "Mentee";
  const userRoleText = userType === "Mentee" ? "mentee" : "mentor";
  const targetRoleText = userType === "Mentee" ? "mentor" : "mentee";

  useEffect(() => {
    if (uid && pid) {
      loadSuggestedMatches();
    }
  }, [uid, pid]);

  useEffect(() => {
    if (suggestedMatches.length > 0 && currentMatchIndex < suggestedMatches.length) {
      setCurrentMatch(suggestedMatches[currentMatchIndex]);
    } else if (suggestedMatches.length === 0 && !loading) {
      setNoMoreMatches(true);
    }
  }, [suggestedMatches, currentMatchIndex]);

  const loadSuggestedMatches = async () => {
    try {
      setLoading(true);
      console.log(`[DEBUG] Loading matches for ${userType} - UID: ${uid}, PID: ${pid}, Type: ${type}`);
      console.log(`[DEBUG] Parameter types - UID: ${typeof uid}, PID: ${typeof pid}, Type: ${typeof type}`);
      
      // Ensure pid is properly formatted
      if (!pid) {
        console.error("[ERROR] No profile ID provided");
        Alert.alert("Error", "Profile ID is missing. Please try again.");
        return;
      }
      
      const matches = await getSuggestedMatches(uid, userType, pid, 5, shownMatchIds);
      console.log(`[DATA] Remaining matches: ${matches.length} ${targetRoleText}s available (excluding ${shownMatchIds.length} shown)`);
      if (matches.length > 0) {
        console.log(`[DATA] Next ${targetRoleText}s: ${matches.slice(0, 3).map(m => `${m.firstName} ${m.lastName} (${m.compatibilityScore}%)`).join(', ')}`);
      }
      setSuggestedMatches(matches);
      setCurrentMatchIndex(0);
      setNoMoreMatches(matches.length === 0);
    } catch (error) {
      console.error("[ERROR] Error loading suggested matches:", error);
      Alert.alert("Error", `Failed to load ${targetRoleText} suggestions. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!currentMatch || processing) return;

    try {
      setProcessing(true);
      const success = await createConnectionFromMatch(uid, currentMatch.userID);
      
      if (success) {
        Alert.alert(
          "Connection Request Sent!",
          `Your connection request has been sent to ${currentMatch.firstName} ${currentMatch.lastName}. They will be notified and can accept your request.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Move to next match
                moveToNextMatch();
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", "Failed to send connection request. Please try again.");
      }
    } catch (error) {
      console.error("Error accepting match:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!currentMatch || processing) return;

    try {
      setProcessing(true);
      await declineMatch(uid, currentMatch.userID);
      console.log(`[DATA] ${userType} ${uid} declined ${targetType} ${currentMatch.userID}`);
      moveToNextMatch();
    } catch (error) {
      console.error("[ERROR] Error declining match:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const moveToNextMatch = () => {
    // Add current match to shown list
    if (currentMatch && currentMatch.userID) {
      setShownMatchIds(prev => [...prev, currentMatch.userID]);
      console.log(`[DATA] Added ${currentMatch.firstName} ${currentMatch.lastName} to shown list`);
    }
    
    const nextIndex = currentMatchIndex + 1;
    console.log(`[DEBUG] Moving to next ${targetRoleText}: ${nextIndex + 1}/${suggestedMatches.length}`);
    if (nextIndex < suggestedMatches.length) {
      setCurrentMatchIndex(nextIndex);
    } else {
      // No more matches, try to load more
      loadMoreMatches();
    }
  };

  const loadMoreMatches = async () => {
    try {
      setLoading(true);
      const moreMatches = await getSuggestedMatches(uid, userType, pid, 5, shownMatchIds);
      console.log(`[DATA] Loading more ${targetRoleText}s: ${moreMatches.length} additional ${targetRoleText}s found`);
      if (moreMatches.length > 0) {
        setSuggestedMatches(prev => [...prev, ...moreMatches]);
        setCurrentMatchIndex(suggestedMatches.length);
        console.log(`[DATA] Total ${targetRoleText}s now: ${suggestedMatches.length + moreMatches.length}`);
      } else {
        console.log(`[WARN] No more ${targetRoleText}s available - showing start over option`);
        setNoMoreMatches(true);
      }
    } catch (error) {
      console.error(`[ERROR] Error loading more ${targetRoleText}s:`, error);
      setNoMoreMatches(true);
    } finally {
      setLoading(false);
    }
  };

  const startOver = async () => {
    if (loading) return; // Prevent multiple clicks
    
    console.log(`[DEBUG] Starting over - resetting ${userRoleText} matching`);
    setLoading(true);
    setCurrentMatchIndex(0);
    setNoMoreMatches(false);
    setShownMatchIds([]); // Clear shown matches list
    
    // Wait a moment for state to update, then load matches
    setTimeout(async () => {
      await loadSuggestedMatches();
    }, 100);
  };

  const getCompatibilityColor = (score) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Yellow
    if (score >= 40) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const getCompatibilityText = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
  };

  if (loading && suggestedMatches.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed469a" />
        <Text style={styles.loadingText}>Finding {targetRoleText}s for you...</Text>
      </View>
    );
  }

  if (noMoreMatches) {
    return (
      <View style={styles.container}>
        <View style={styles.noMentorsContainer}>
          <Text style={styles.noMentorsTitle}>No More {targetRoleText}s Available</Text>
          <Text style={styles.noMentorsText}>
            You've seen all available {targetRoleText}s! Check back later as new {targetRoleText}s join our platform.
          </Text>
          <View style={styles.noMentorsButtons}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadSuggestedMatches}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.startOverButton, loading && { opacity: 0.6 }]}
              onPress={startOver}
              disabled={loading}
            >
              <Text style={styles.startOverButtonText}>
                {loading ? "Starting..." : "Start Over"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Navbar />
      </View>
    );
  }

  if (!currentMatch) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed469a" />
        <Text style={styles.loadingText}>Loading {targetRoleText}...</Text>
      </View>
    );
  }

  // Map numeric indexes to actual interest and skill strings
  const displayInterests = (currentMatch.interests || []).map(i => 
    possibleInterests[i] || "Unknown Interest"
  );
  const displaySkills = (currentMatch.skills || []).map(i => 
    possibleSkills[i] || "Unknown Skill"
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header with role indicator */}
        <View style={styles.header}>
          <Text style={styles.roleIndicator}>
            {userType === "Mentee" ? "Find Your Mentor" : "Find Your Mentee"}
          </Text>
          <Text style={styles.roleDescription}>
            {userType === "Mentee" 
              ? "Connect with mentors who can help you grow professionally" 
              : "Connect with mentees who can benefit from your expertise"
            }
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <ExpoImage
            style={styles.profileImage}
            contentFit="cover"
            source={require("../../assets/image-43.png")}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.pronouns}>{currentMatch.pronouns || "Pronouns not specified"}</Text>
            <Text style={styles.name}>
              {currentMatch.firstName} {currentMatch.lastName}
            </Text>
            <Text style={styles.bio}>{currentMatch.bio || "No bio available"}</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role:</Text>
                <Text style={styles.detailValue}>{currentMatch.currentRole || "Not specified"}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Industry:</Text>
                <Text style={styles.detailValue}>{currentMatch.currentIndustry || "Not specified"}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Language:</Text>
                <Text style={styles.detailValue}>{currentMatch.preferredLanguage || "Not specified"}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Country:</Text>
                <Text style={styles.detailValue}>{currentMatch.country || "Not specified"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Skills and Interests */}
        {displayInterests.length > 0 && (
          <Skills interests={displayInterests} title="Interests" />
        )}
        {displaySkills.length > 0 && (
          <Skills interests={displaySkills} title="Skills" propHeight="unset" />
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineActionButton]}
            onPress={handleDecline}
            disabled={processing}
          >
            <Text style={styles.actionButtonText}>Pass</Text>
          </TouchableOpacity>
          
          {/* Compatibility Rating */}
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityLabel}>Compatibility</Text>
            <View style={[
              styles.compatibilityBadge,
              { backgroundColor: getCompatibilityColor(currentMatch.compatibilityScore) }
            ]}>
              <Text style={styles.compatibilityScore}>
                {currentMatch.compatibilityScore}%
              </Text>
            </View>
            <Text style={styles.compatibilityText}>
              {getCompatibilityText(currentMatch.compatibilityScore)}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptActionButton]}
            onPress={handleAccept}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Connect</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f7fb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  roleIndicator: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  roleDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  compatibilityContainer: {
    alignItems: "center",
  },
  compatibilityLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  compatibilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 4,
  },
  compatibilityScore: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  compatibilityText: {
    fontSize: 10,
    color: "#666",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: "center",
    width: "100%",
  },
  pronouns: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  bio: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  detailsContainer: {
    width: "100%",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  detailValue: {
    fontSize: 16,
    color: "#666",
    flex: 1,
    textAlign: "right",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  actionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  declineActionButton: {
    backgroundColor: "#ef4444",
  },
  acceptActionButton: {
    backgroundColor: "#10b981",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noMentorsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 50,
  },
  noMentorsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  noMentorsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  noMentorsButtons: {
    flexDirection: "row",
    gap: 15,
  },
  refreshButton: {
    backgroundColor: "#ed469a",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  startOverButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 1,
    alignItems: "center",
  },
  startOverButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MentorMatching;
