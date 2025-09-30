// -----------------------------------------------------------------------------
// Purpose: Interactive mentor matching for mentees.
// Features:
// - Pulls potential mentors via matchingAlgorithm utils.
// - Allows user to approve or decline suggested mentors.
// - Updates mentee's likedTags on approval.
// - Displays mentor details, skills, and interests.
// - Provides navigation to ResetMatches if no mentors remain.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { Image } from "expo-image";
import { StyleSheet, Pressable, View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AboutMe from "../../components/AboutMe";
import Skills from "../../components/Skills";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../../firebaseConfig';
import { setUpMatching, findMatchFromList, menteeRespondToMatch, updateLikedTags, checkMentorCount, ensureMatchesCollection, euclideanDistance } from "../../mentor_matching/matchingAlgorithm";
import Navbar from "../../components/Navbar";

// Define possible skills and interests
const possibleSkills = [
  "Business", "Content Writing", "Development", "Hospitality", "Management",
  "Entrepreneur", "Videography", "Law", "Health"
];

const possibleInterests = [
  "Leadership", "Management", "Development", "Communication", "Creativity",
  "Business", "Content Writing", "Hospitality", "Videography", "Law"
];

const InteractiveMatching = ({ route }) => {
  // Matching state
  const [userID, setUID] = useState('');
  const [firstRun, setFirstRun] = useState(true);
  const [profileID, setPID] = useState('');
  const [mentorsList, setMentorsList] = useState('');
  const [currentMentor, setCurrentMentor] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [likedTags, setLikedTags] = useState('');

  // Mentor profile details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [language, setLanguage] = useState('');
  const [interests, setInterests] = useState([]);
  const [skills, setSkills] = useState([]);

  const navigation = useNavigation();
  const {uid, pid, type} = route.params;

  // Add a manual trigger for testing
  const triggerMatching = () => {
    console.log("Manual trigger called");
    console.log("Current state:");
    console.log("mentorsList:", mentorsList);
    console.log("likedTags:", likedTags);
    console.log("profileID:", profileID);
    console.log("pid:", pid);
    
    if (mentorsList && mentorsList.length > 0 && likedTags) {
      findAndDisplayMatch();
    } else {
      console.log("Cannot trigger matching - missing data");
    }
  };

  useEffect(() => {
    setUID(uid);
  }, []);

  const approveMatch = async () => {
    console.log();
    console.log(" --- approving match ---");
    console.log();

    try {
      // Debug logging
      console.log("profileID:", profileID);
      console.log("currentMentor:", currentMentor);
      console.log("pid from route:", pid);
      
      // Use pid from route params if profileID state is not set yet
      const menteeID = profileID || pid;
      
      // Validate that we have the required data
      if (!menteeID || !currentMentor || !currentMentor["profileID"]) {
        console.error("Missing required data for approving match");
        console.error("menteeID:", menteeID);
        console.error("currentMentor:", currentMentor);
        return;
      }

      // approve the match
      const success = await menteeRespondToMatch("Approve", menteeID, currentMentor["profileID"]);
      
      if (success) {
        // update the mentee liked tags array
        if (currentMentor["profileTags"]) {
          const updatedLikedTags = await updateLikedTags(menteeID, currentMentor["profileTags"]);
          if (updatedLikedTags) {
            setLikedTags(updatedLikedTags);
          }
        } else {
          console.warn("No profile tags available for mentor, skipping tag update");
        }
      } else {
        console.error("Failed to approve match");
      }
    } catch (error) {
      console.error("Error in approveMatch:", error);
    }
  };

  const declineMatch = async () => {
    console.log();
    console.log(" --- declining match ---");
    console.log();

    try {
      // Debug logging
      console.log("profileID:", profileID);
      console.log("currentMentor:", currentMentor);
      console.log("pid from route:", pid);
      
      // Use pid from route params if profileID state is not set yet
      const menteeID = profileID || pid;
      
      // Validate that we have the required data
      if (!menteeID || !currentMentor || !currentMentor["profileID"]) {
        console.error("Missing required data for declining match");
        console.error("menteeID:", menteeID);
        console.error("currentMentor:", currentMentor);
        return;
      }

      // decline the match
      const success = await menteeRespondToMatch("Decline", menteeID, currentMentor["profileID"]);
      
      if (success) {
        // move onto next match
        findAndDisplayMatch();
      } else {
        console.error("Failed to decline match");
      }
    } catch (error) {
      console.error("Error in declineMatch:", error);
    }
  };

  // Simple function to find best match without touching database
  const findBestMatchFromList = async (likedTags, mentors) => {
    console.log("findBestMatchFromList called with:", mentors.length, "mentors");
    
    if (!mentors || mentors.length === 0) {
      console.log("No mentors provided");
      return null;
    }
    
    let bestMatch = null;
    let bestDistance = Infinity;
    
    for (let i = 0; i < mentors.length; i++) {
      const distance = await euclideanDistance(likedTags, mentors[i]["profileTags"]);
      console.log(`Mentor ${mentors[i]["profileID"]} distance:`, distance);
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = mentors[i];
      }
    }
    
    console.log("Best match found:", bestMatch ? bestMatch["profileID"] : "none", "with distance:", bestDistance);
    return bestMatch;
  };

  const findAndDisplayMatch = async () => {
    console.log("=== findAndDisplayMatch called ===");
    console.log("mentorsList length:", mentorsList ? mentorsList.length : "undefined");
    console.log("mentorsList:", mentorsList);
    console.log("likedTags:", likedTags);
    console.log("profileID:", profileID);
    console.log("pid:", pid);
    console.log("currentMentor before:", currentMentor);

    // check if this batch of mentors is empty
    if (!mentorsList || !mentorsList.length) {
      console.log("No mentors in list, getting more mentors");
      //navigation.navigate("ResetMatches", {uid, pid, type});
      
      // empty array, get more mentors
      setUpMentorMatching(false);

    } else {
      // determine best match
      
      console.log();
      console.log(" --- finding a mentor --- ");
      console.log();

      // Use our simple function instead of the algorithm's findMatchFromList
      const suggestedMentor = await findBestMatchFromList(likedTags, mentorsList);
      
      console.log("findBestMatchFromList returned:", suggestedMentor);

      // Validate suggestedMentor before setting it
      if (!suggestedMentor || !suggestedMentor["profileID"]) {
        console.error("Invalid suggestedMentor:", suggestedMentor);
        console.log("This means findMatchFromList returned null for suggestedMentor");
        return;
      }

      console.log("Setting currentMentor to:", suggestedMentor);
      setCurrentMentor(suggestedMentor);
      
      console.log("State updated - currentMentor should now be set");
      console.log("Mentor profileID:", suggestedMentor["profileID"]);
      console.log("Mentor name:", suggestedMentor["profileData"]["firstName"], suggestedMentor["profileData"]["lastName"]);
      
      // Test if state was actually set
      setTimeout(() => {
        console.log("=== STATE CHECK AFTER TIMEOUT ===");
        console.log("currentMentor after setState:", currentMentor);
        console.log("firstName after setState:", firstName);
        console.log("lastName after setState:", lastName);
      }, 100);

      // set values to display
      setFirstName(suggestedMentor["profileData"]["firstName"]);
      setLastName(suggestedMentor["profileData"]["lastName"]);
      setBio(suggestedMentor["profileData"]["bio"]);
      setPronouns(suggestedMentor["profileData"]["pronouns"]);
      setCountry(suggestedMentor["profileData"]["country"]);
      setIndustry(suggestedMentor["profileData"]["currentIndustry"]);
      setRole(suggestedMentor["profileData"]["currentRole"]);
      setInterests(suggestedMentor["profileData"]["interests"] || []);
      setSkills(suggestedMentor["profileData"]["skills"] || []);
      setLanguage(suggestedMentor["profileData"]["preferredLanguage"]);
    }
  };

  const setUpMentorMatching = async (firstBatch = true) => {
    console.log("setUpMentorMatching called with firstBatch:", firstBatch);
    console.log("userID:", userID);
    console.log("lastDoc:", lastDoc);
        
    // set up the mentor matching
    const [newPID, newLikedTags, newMentorList, newLastDoc] = await setUpMatching(userID, firstBatch, lastDoc);

    console.log("setUpMatching returned:");
    console.log("newPID:", newPID);
    console.log("newLikedTags:", newLikedTags);
    console.log("newMentorList:", newMentorList);
    console.log("newLastDoc:", newLastDoc);

    // check if it returned mentors to run through
    if (newMentorList == null) {
      console.log("No mentors returned, navigating to ResetMatches");
      console.log(newLastDoc); // in this case, newLastDoc actually is a string, we dont use it tho lol
      navigation.navigate("ResetMatches", {uid, pid, type});

    } else { 
      console.log("Setting up mentor matching with", newMentorList.length, "mentors");
      setPID(newPID);
      setMentorsList(newMentorList);
      setLastDoc(newLastDoc);
      setLikedTags(newLikedTags);
      
      // Immediately try to find and display a match
      console.log("Calling findAndDisplayMatch directly after setup");
      setTimeout(() => {
        findAndDisplayMatch();
      }, 100);
    }
  };

  useEffect(() => {
    if (userID && firstRun) {
      setFirstRun(false);
      // Check mentor count and Matches collection first for debugging
      Promise.all([
        checkMentorCount(),
        ensureMatchesCollection()
      ]).then(([count, matchesExists]) => {
        console.log("Mentor count check completed:", count);
        console.log("Matches collection check completed:", matchesExists);
        setUpMentorMatching();
      });
    }
  }, [userID]);

  useEffect(() => {
    if (likedTags && mentorsList && mentorsList.length > 0) {
      console.log("useEffect triggered - likedTags and mentorsList are ready");
      findAndDisplayMatch();
    }
  }, [likedTags, mentorsList]);

  // Map numeric indexes to actual interest and skill strings
  const displayInterests = interests.map(i => possibleInterests[i] || "Unknown Interest");
  const displaySkills = skills.map(i => possibleSkills[i] || "Unknown Skill");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[styles.matchingScreen, styles.image43ParentFlexBox]}>
          <View style={[styles.header, styles.headerFlexBox]}>
            <Pressable style={styles.crossButton} onPress={declineMatch}>
              <Image
                style={styles.icon}
                contentFit="cover"
                source={require("../../assets/cross-icon.png")}
              />
            </Pressable>
            <Pressable onPress={triggerMatching} style={{backgroundColor: 'blue', padding: 10, borderRadius: 5}}>
              <Text style={{color: 'white', fontSize: 12}}>Trigger Match</Text>
            </Pressable>
            <Image
              style={styles.headerChild}
              contentFit="cover"
              source={require("../../assets/header-2-1.png")}
            />
            <Pressable style={styles.tickButton} onPress={approveMatch}>
              <Image
                style={styles.icon}
                contentFit="cover"
                source={require("../../assets/tick-icon.png")}
              />
            </Pressable>
          </View>
          
          {/* Mentor's Profile Image and Details */}
          <Image
            style={styles.profileImage}
            contentFit="cover"
            source={require("../../assets/image-43.png")}
          />
          
          <View style={styles.profileDetails}>
            <Text style={styles.pronounsText}>{pronouns || "Pronouns Unavailable"}</Text>
            <Text style={styles.nameText}>{`${firstName} ${lastName}`}</Text>
            <Text style={styles.bioText}>{bio || "Bio Unavailable"}</Text>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoText}>{role || "Role Unavailable"}</Text>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Industry:</Text>
              <Text style={styles.infoText}>{industry || "Industry Unavailable"}</Text>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Preferred Language:</Text>
              <Text style={styles.infoText}>{language || "Language Unavailable"}</Text>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Country:</Text>
              <Text style={styles.infoText}>{country || "Country Unavailable"}</Text>
            </View>
          </View>

          {/* Displaying mentor's interests and skills */}
          <Skills interests={displayInterests} title="Interests" />
          <Skills interests={displaySkills} title="Skills" propHeight="unset" />
        </View>
      </ScrollView>
      <Navbar style={styles.navbar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    justifyContent: "space-between",
  },
  scrollViewContent: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: "40%",
    alignItems: "center",
  },
  image43ParentFlexBox: {
    gap: 20,
    alignItems: "center",
  },
  headerFlexBox: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
  },
  iconLayout: {
    height: "100%",
    width: "100%",
  },
  headerChild: {
    width: "35%",
    height: 50,
  },
  icon: {
    width: 30,
    height: 30,
  },
  crossButton: {
    padding: 10,
  },
  tickButton: {
    padding: 10,
  },
  profileImage: {
    borderRadius: 50,
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  profileDetails: {
    alignItems: "flex-start",
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ea9bbf",
    borderRadius: 10,
    width: "90%",
  },
  pronounsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  nameText: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
  },
  bioText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
    color: "#fff",
  },
  navbar: {
    height: 60,
    width: "100%",
  },
});

export default InteractiveMatching;
