// -----------------------------------------------------------------------------
// Purpose: Display a user's profile (mentor/mentee), with ability to edit,
//          switch role profile, and sign out.
// Notes:
// - Pulls profile data & tag dictionaries (Interests/Skills) from Firestore.
// - Refreshes whenever the screen becomes focused.
// - Switch button navigates between the user's Mentor/Mentee profile if both exist.
// -----------------------------------------------------------------------------
import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, Pressable, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import { getDoc, doc, getDocs, collection } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import Navbar from "../../components/Navbar";

// Helper function to build a tag map.
const fetchAllTags = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const tagMap = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      tagMap[data.tagID] = data.tagName;
    });
    return tagMap;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return {};
  }
};

const UserProfile = ({ route }) => {
  const [userData, setUserData] = useState({});
  const [interestTags, setInterestTags] = useState({});
  const [skillTags, setSkillTags] = useState({});
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const userID = auth.currentUser?.uid;
  const { uid, pid, type } = route.params;

  // Fetch fresh profile data every time screen is focused
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all tags once
        const [interestMap, skillMap] = await Promise.all([
          fetchAllTags("InterestTags"),
          fetchAllTags("SkillTags"),
        ]);

        setInterestTags(interestMap);
        setSkillTags(skillMap);

        // Fetch profile
        const profileSnap = await getDoc(doc(db, "Profiles", pid.toString()));
        if (profileSnap.exists()) {
          setUserData(profileSnap.data());
        } else {
          console.log("No such profile!");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
        // Start fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    if (isFocused) {
      // Reset animation
      fadeAnim.setValue(0);
      fetchData();
    }
  }, [userID, pid, isFocused]);

  // Handle switching between mentor & mentee profiles
  const handleSwitchUser = async () => {
    const userSnap = await getDoc(doc(db, "Users", uid));
    let newType, newPID;

    if (type === "Mentee") {
      newPID = userSnap.data()["mentorID"];
      newType = "Mentor";
    } else {
      newPID = userSnap.data()["menteeID"];
      newType = "Mentee";
    }

    if (newPID) {
      navigation.navigate("Home", { uid, pid: newPID, type: newType });
    } else {
      console.log("No profile exists for this type.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.navigate("Login"))
      .catch((error) => console.error("Error logging out: ", error));
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", { uid, pid, type });
  };

  // Render
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.profileContent, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <Image
          style={styles.profileImage}
          contentFit="cover"
          source={
            userData.profileImageUrl 
              ? { uri: userData.profileImageUrl }
              : require("../../assets/default_profile.jpg")
          }
        />

        {/* Name & Details */}
        <Text style={styles.nameText}>
          {`${userData.firstName || "First"} ${userData.lastName || "Name"}`}
        </Text>
        <Text style={styles.pronounsText}>
          {userData.pronouns || ""}
        </Text>
        <Text style={styles.subText}>
          {userData.currentRole || "Role Unavailable"} • {userData.currentIndustry || "Industry Unavailable"}
        </Text>
        <Text style={styles.locationText}>
          {userData.country || "Country Unavailable"}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.editButton} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={18} color="#fff" />
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>

          <Pressable style={styles.switchButton} onPress={handleSwitchUser}>
            <MaterialIcons name="swap-horiz" size={18} color="#fff" />
            <Text style={styles.buttonText}>
              {type === "Mentee" ? "Mentor" : "Mentee"}
            </Text>
          </Pressable>

          <Pressable style={styles.signOutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={18} color="#fff" />
            <Text style={styles.buttonText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* About Me */}
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.aboutText}>
          {userData.bio || "No bio provided"}
        </Text>

        {/* Interests */}
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.chipsContainer}>
          {userData.interests?.length > 0 ? (
            userData.interests.map((id, idx) => (
              <View style={styles.chip} key={idx}>
                <Text style={styles.chipText}>{interestTags[id] || "Unknown"}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No interests added</Text>
          )}
        </View>

        {/* Skills */}
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.chipsContainer}>
          {userData.skills?.length > 0 ? (
            userData.skills.map((id, idx) => (
              <View style={styles.chip} key={idx}>
                <Text style={styles.chipText}>{skillTags[id] || "Unknown"}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No skills added</Text>
          )}
        </View>
      </ScrollView>
      </Animated.View>
      <Navbar style={styles.navbar} />
    </View>
  );
};

 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profileContent: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Raleway-Regular",
  },
  scrollContainer: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 100, 
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100%"
  },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginVertical: 15 },
  nameText: { fontSize: 24, fontWeight: "bold", color: "#000" },
  pronounsText: { fontSize: 14, color: "#555", marginTop: 2, fontStyle: "italic" },
  subText: { fontSize: 16, color: "#555", marginTop: 2 },
  locationText: { fontSize: 14, color: "#999", marginBottom: 15 },
  buttonRow: { flexDirection: "row", justifyContent: "center", marginVertical: 15 },
  editButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#ed469a", padding: 10, borderRadius: 6, marginHorizontal: 5 },
  switchButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#6C63FF", padding: 10, borderRadius: 6, marginHorizontal: 5 },
  signOutButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#FF5A5F", padding: 10, borderRadius: 6, marginHorizontal: 5 },
  buttonText: { color: "#fff", marginLeft: 5, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#000", marginTop: 8, marginBottom: 8 },
  aboutText: { fontSize: 15, color: "#333", textAlign: "center", lineHeight: 22 },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 10 },
  chip: {
    backgroundColor: "#ed469a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 5,
  },
  chipText: {
    color: "#fff",
    fontWeight: "bold",
  },

  noDataText: { fontSize: 14, color: "#aaa", fontStyle: "italic" },
  navbar: { height: 60, width: "100%" },
});

export default UserProfile;
