// -----------------------------------------------------------------------------
// Purpose: Dual-purpose matching service for both mentees and mentors
// Features:
// - Mentees match with mentors (people who can help them)
// - Mentors match with mentees (people they can help/clients)
// - Simple tag-based matching algorithm
// - Integration with existing connection system
// - Clean, maintainable code structure
// - Real-time suggestions for both user types
// -----------------------------------------------------------------------------

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  startAfter
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Get all available matches for a user (mentors for mentees, mentees for mentors)
 * @param {string} userId - The user's ID
 * @param {string} userType - "Mentee" or "Mentor"
 * @param {number} limit - Number of matches to fetch (default: 10)
 * @param {string} lastMatchId - For pagination
 * @param {Array} excludeIds - Array of user IDs to exclude
 * @returns {Promise<Array>} Array of matching profiles
 */
export const getAvailableMatches = async (userId, userType, limitCount = 10, lastMatchId = null, excludeIds = []) => {
  try {
    // Determine target profile type based on user type
    const targetProfileType = userType === "Mentee" ? "Mentor" : "Mentee";
    
    // Get user's existing connections to exclude them
    const connectionsQuery = query(
      collection(db, "Connections"), 
      where("userIds", "array-contains", userId)
    );
    const connectionsSnap = await getDocs(connectionsQuery);
    
    const connectedUserIds = [];
    connectionsSnap.forEach((doc) => {
      const { userIds } = doc.data();
      connectedUserIds.push(...userIds.filter((id) => id !== userId));
    });

    // Get user's sent connection requests to exclude them
    const sentRequestsQuery = query(
      collection(db, "ConnectionRequests"), 
      where("from", "==", userId)
    );
    const sentRequestsSnap = await getDocs(sentRequestsQuery);
    const sentRequestIds = sentRequestsSnap.docs.map((doc) => doc.data().to);

    // Get user's incoming connection requests to exclude them
    const incomingRequestsQuery = query(
      collection(db, "ConnectionRequests"), 
      where("to", "==", userId)
    );
    const incomingRequestsSnap = await getDocs(incomingRequestsQuery);
    const incomingRequestIds = incomingRequestsSnap.docs.map((doc) => doc.data().from);

    // Combine all excluded user IDs (connections, requests, already shown matches, and self)
    const excludedUserIds = [...connectedUserIds, ...sentRequestIds, ...incomingRequestIds, ...excludeIds, userId];

    // Get target profiles, excluding already connected/requested users
    // Simplified query to avoid index requirements
    let matchesQuery = query(
      collection(db, "Profiles"),
      where("profileType", "==", targetProfileType),
      limit(limitCount)
    );

    const matchesSnap = await getDocs(matchesQuery);
    const matches = [];

    matchesSnap.forEach((doc) => {
      const matchData = doc.data();
      // Only include matches not already connected/requested
      if (!excludedUserIds.includes(matchData.userID)) {
        matches.push({
          id: doc.id,
          ...matchData
        });
      }
    });

    // Sort matches alphabetically by first name (client-side)
    matches.sort((a, b) => {
      const nameA = (a.firstName || '').toLowerCase();
      const nameB = (b.firstName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return matches;
  } catch (error) {
    console.error("Error getting available matches:", error);
    return [];
  }
};

/**
 * Calculate compatibility score between two profiles based on interests/skills
 * @param {Object} userProfile - Current user's profile data
 * @param {Object} matchProfile - Potential match's profile data
 * @param {string} userType - "Mentee" or "Mentor"
 * @returns {number} Compatibility score (0-100)
 */
export const calculateCompatibility = (userProfile, matchProfile, userType) => {
  try {
    let score = 0;
    let totalFactors = 0;

    // Interest matching (40% weight)
    if (userProfile.interests && matchProfile.interests) {
      const userInterests = Array.isArray(userProfile.interests) ? userProfile.interests : [];
      const matchInterests = Array.isArray(matchProfile.interests) ? matchProfile.interests : [];
      
      const commonInterests = userInterests.filter(interest => 
        matchInterests.includes(interest)
      ).length;
      
      const interestScore = userInterests.length > 0 ? 
        (commonInterests / userInterests.length) * 40 : 0;
      score += interestScore;
      totalFactors += 40;
    }

    // Skill matching (30% weight)
    if (userProfile.skills && matchProfile.skills) {
      const userSkills = Array.isArray(userProfile.skills) ? userProfile.skills : [];
      const matchSkills = Array.isArray(matchProfile.skills) ? matchProfile.skills : [];
      
      const commonSkills = userSkills.filter(skill => 
        matchSkills.includes(skill)
      ).length;
      
      const skillScore = userSkills.length > 0 ? 
        (commonSkills / userSkills.length) * 30 : 0;
      score += skillScore;
      totalFactors += 30;
    }

    // Industry matching (20% weight) - different logic for mentees vs mentors
    if (userType === "Mentee") {
      // Mentees want mentors in their desired industry
      if (userProfile.desiredIndustry && matchProfile.currentIndustry) {
        if (userProfile.desiredIndustry === matchProfile.currentIndustry) {
          score += 20;
        }
        totalFactors += 20;
      }
    } else {
      // Mentors want mentees interested in their industry
      if (userProfile.currentIndustry && matchProfile.desiredIndustry) {
        if (userProfile.currentIndustry === matchProfile.desiredIndustry) {
          score += 20;
        }
        totalFactors += 20;
      }
    }

    // Role matching (10% weight) - different logic for mentees vs mentors
    if (userType === "Mentee") {
      // Mentees want mentors in their desired role
      if (userProfile.desiredRole && matchProfile.currentRole) {
        if (userProfile.desiredRole === matchProfile.currentRole) {
          score += 10;
        }
        totalFactors += 10;
      }
    } else {
      // Mentors want mentees interested in their role
      if (userProfile.currentRole && matchProfile.desiredRole) {
        if (userProfile.currentRole === matchProfile.desiredRole) {
          score += 10;
        }
        totalFactors += 10;
      }
    }

    // Normalize score to 0-100 range
    return totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 0;
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    return 0;
  }
};

/**
 * Get user profile data by profile ID
 * @param {string} profileId - Profile ID
 * @returns {Promise<Object|null>} Profile data
 */
export const getUserProfile = async (profileId) => {
  try {
    // Ensure profileId is a string
    const profileIdStr = String(profileId);
    console.log(`[DEBUG] Getting user profile for ID: ${profileIdStr} (type: ${typeof profileId})`);
    
    const profileDoc = await getDoc(doc(db, "Profiles", profileIdStr));
    
    if (profileDoc.exists()) {
      const profileData = {
        id: profileDoc.id,
        ...profileDoc.data()
      };
      console.log(`[SUCCESS] Found profile: ${profileData.firstName} ${profileData.lastName} (${profileData.profileType})`);
      return profileData;
    }
    console.log(`[WARN] Profile not found for ID: ${profileIdStr}`);
    return null;
  } catch (error) {
    console.error("[ERROR] Error getting user profile:", error);
    console.error("[ERROR] Profile ID that caused error:", profileId, "Type:", typeof profileId);
    return null;
  }
};

/**
 * Get user profile data by user ID and profile type
 * @param {string} userId - User ID
 * @param {string} profileType - "Mentee" or "Mentor"
 * @returns {Promise<Object|null>} Profile data
 */
export const getUserProfileByType = async (userId, profileType) => {
  try {
    const profileQuery = query(
      collection(db, "Profiles"),
      where("userID", "==", userId),
      where("profileType", "==", profileType)
    );
    const profileSnap = await getDocs(profileQuery);
    
    if (!profileSnap.empty) {
      const profileData = profileSnap.docs[0].data();
      return {
        id: profileSnap.docs[0].id,
        ...profileData
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile by type:", error);
    return null;
  }
};

/**
 * Create a connection request when user accepts a match
 * @param {string} fromUserId - User who initiated the connection
 * @param {string} toUserId - User who will receive the connection request
 * @returns {Promise<boolean>} Success status
 */
export const createConnectionFromMatch = async (fromUserId, toUserId) => {
  try {
    // Check if connection already exists
    const existingConnectionQuery = query(
      collection(db, "Connections"),
      where("userIds", "array-contains", fromUserId)
    );
    const existingConnectionsSnap = await getDocs(existingConnectionQuery);
    
    const connectionExists = existingConnectionsSnap.docs.some(doc => {
      const { userIds } = doc.data();
      return userIds.includes(toUserId);
    });

    if (connectionExists) {
      console.log("Connection already exists");
      return true;
    }

    // Check if request already exists
    const existingRequestQuery = query(
      collection(db, "ConnectionRequests"),
      where("from", "==", fromUserId),
      where("to", "==", toUserId)
    );
    const existingRequestSnap = await getDocs(existingRequestQuery);

    if (!existingRequestSnap.empty) {
      console.log("Connection request already exists");
      return true;
    }

    // Create connection request
    await addDoc(collection(db, "ConnectionRequests"), {
      from: fromUserId,
      to: toUserId,
      createdAt: new Date(),
      status: "pending",
      source: "matching" // Track that this came from matching system
    });

    console.log("Connection request created successfully");
    return true;
  } catch (error) {
    console.error("Error creating connection from match:", error);
    return false;
  }
};

/**
 * Get suggested matches for a user with compatibility scores
 * @param {string} userId - User's ID
 * @param {string} userType - "Mentee" or "Mentor"
 * @param {string} profileId - User's profile ID
 * @param {number} limit - Number of suggestions (default: 5)
 * @param {Array} excludeIds - Array of user IDs to exclude (already shown)
 * @returns {Promise<Array>} Array of suggested matches with compatibility scores
 */
export const getSuggestedMatches = async (userId, userType, profileId, limitCount = 5, excludeIds = []) => {
  try {
    console.log(`[DEBUG] Getting suggested matches for ${userType} ${userId} with profile ${profileId}`);
    
    // Try using getUserProfileByType instead of getUserProfile to avoid doc reference issues
    const userProfile = await getUserProfileByType(userId, userType);
    if (!userProfile) {
      console.error("[ERROR] Could not find user profile using getUserProfileByType");
      return [];
    }

    console.log(`[DATA] User profile: ${userProfile.firstName} ${userProfile.lastName} (${userProfile.profileType})`);

    // Get available matches, excluding already shown ones
    const matches = await getAvailableMatches(userId, userType, limitCount * 2, null, excludeIds);
    console.log(`[DATA] Found ${matches.length} potential matches`);

    // Calculate compatibility scores and sort
    const matchesWithScores = matches.map(match => ({
      ...match,
      compatibilityScore: calculateCompatibility(userProfile, match, userType)
    }));

    // Sort by compatibility score (highest first) and return top results
    const sortedMatches = matchesWithScores
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limitCount);
    
    console.log(`[SUCCESS] Returning ${sortedMatches.length} suggested matches`);
    return sortedMatches;
  } catch (error) {
    console.error("[ERROR] Error getting suggested matches:", error);
    return [];
  }
};

/**
 * Decline a match (simply skip to next)
 * @param {string} userId - User's ID
 * @param {string} matchUserId - Match's user ID
 * @returns {Promise<boolean>} Success status
 */
export const declineMatch = async (userId, matchUserId) => {
  // For now, declining just means skipping - no database action needed
  // In the future, we could track declined matches to avoid showing them again
  console.log(`[DATA] User ${userId} declined match ${matchUserId}`);
  return true;
};
