import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { getDoc, doc } from "firebase/firestore";
import { db, auth } from '../firebaseConfig';
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons'; // Import Material Icons
import AboutMe from "../components/AboutMe";
import Skills from "../components/Skills";
import Navbar from "../components/Navbar";
import { signOut } from "firebase/auth"; // Import signOut

const possibleSkills = [
  "Business", "Content Writing", "Development", "Hospitality", "Management",
  "Entrepreneur", "Videography", "Law", "Health"
];

const possibleInterests = [
  "Leadership", "Management", "Development", "Communication", "Creativity", 
  "Business", "Content Writing", "Hospitality", "Videography", "Law"
];

const PROFILESCREEN1 = ({ route }) => {
  const [userData, setUserData] = useState({});
  const navigation = useNavigation();
  const userID = auth.currentUser?.uid;
  const { uid, pid, type } = route.params; // 'type' represents whether the profile is "Mentee" or "Mentor"

  useEffect(() => {
    const fetchData = async () => {
      if (userID) {
        console.log(typeof pid);
        const profileSnap = await getDoc(doc(db, "Profiles", pid.toString()));

        if (profileSnap.exists()) {
          setUserData(profileSnap.data());
        } else {
          console.log("No such profile!");
        }

        /* const userSnap = await getDoc(doc(db, "Users", userID));
        if (userSnap.exists()) {
          const profileSnap = null;
          if (type == "Mentor") {
            profileSnap = await getDoc(doc(db, "Profiles", userSnap.data()["mentorID"].toString()));
          } else if (type == "Mentee") {
            profileSnap = await getDoc(doc(db, "Profiles", userSnap.data()["menteeID"].toString()));
          } 

          //const profileSnap = await getDoc(doc(db, "Profiles", userSnap.data()["menteeID"].toString()));
          if (profileSnap.exists()) {
            setUserData(profileSnap.data());
          } else {
            console.log("No such profile!");
          }
        } else {
          console.log("No such user!");
        } */
      }
    };
    fetchData();
  }, [userID]);

  // Handle switch user profile
  const handleSwitchUser = async () => {
    const userSnap = await getDoc(doc(db, "Users", uid));
    let newType;
    let newPID;

    if (type === "Mentee") {
      newPID = userSnap.data()["mentorID"];
      newType = "Mentor";
    } else {
      newPID = userSnap.data()["menteeID"];
      newType = "Mentee";
    }

    if (newPID) {
      // Switch to the other profile type
      navigation.navigate("Home", { uid, pid: newPID, type: newType });
    } else {
      console.log("No profile exists for this type.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate("StartScreen"); // Navigate back to login
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  return (
    <View style={styles.container}>
      {/* Aligned logout, home, and switch buttons */}
      <View style={styles.headerContainer}>
        {/* Logout button with an icon */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#fff" />
        </Pressable>

        {/* Switch button with an icon */}
        <Pressable style={styles.switchButton} onPress={handleSwitchUser}>
          <MaterialIcons name="swap-horiz" size={20} color="#fff" style={styles.switchIcon} />
          <Text style={styles.switchButtonText}>
            {type === "Mentee" ? "Mentor" : "Mentee"}
          </Text>
        </Pressable>
      </View>

      {/* Heading for Profile Type */}
      <Text style={styles.heading}>
        {type === "Mentee" ? "Mentee Profile" : "Mentor Profile"}
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          style={styles.profileImage}
          contentFit="cover"
          source={require("../assets/image-431.png")}
        />
        <View style={styles.profileDetails}>
          {/* Pronouns are now displayed above the name */}
          <Text style={styles.pronounsText}>
            {userData.pronouns || "Pronouns Unavailable"}
          </Text>
          <Text style={styles.nameText}>
            {`${userData.firstName || "First Name Unavailable"} ${userData.lastName || "Last Name Unavailable"}`}
          </Text>
          <Text style={styles.bioText}>
            {userData.bio || "Bio Unavailable"}
          </Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoText}>{userData.currentRole || "Role Unavailable"}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Industry:</Text>
            <Text style={styles.infoText}>{userData.currentIndustry || "Industry Unavailable"}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Preferred Language:</Text>
            <Text style={styles.infoText}>{userData.preferredLanguage || "Language Unavailable"}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Country:</Text>
            <Text style={styles.infoText}>{userData.country || "Country Unavailable"}</Text>
          </View>
        </View>

        <Skills
          interests={userData.interests?.map(i => possibleInterests[i] || "Unknown Interest") || []}
          title="Interests"
          propHeight="unset"
        />

        <Skills
          interests={userData.skills?.map(i => possibleSkills[i] || "Unknown Skill") || []}
          title="Skills"
          propHeight="unset"
        />
      </ScrollView>
      <Navbar style={styles.navbar} />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    marginTop: 80,
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    alignItems: "center",
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  switchButton: {
    backgroundColor: "#ed469a",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  switchIcon: {
    marginRight: 5,
  },
  switchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#ed469a",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
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
  nameText: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
  },
  pronounsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
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
};

export default PROFILESCREEN1;
