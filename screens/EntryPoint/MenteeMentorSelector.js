import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, getDoc, updateDoc} from "firebase/firestore"
import { db, auth } from '../../firebaseConfig';


const MenteeMentorSelector = () => {
  const [uid, setUID] = useState(''); // user id

  const navigation = useNavigation();

  // get current userID
  onAuthStateChanged(auth, (user) => {
    if (user) { setUID(user.uid); } else {} // hide errors

    //console.log(uid)
  })

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("AppEntry");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const createProfile = async (type) => {
    // check if a profile of that type has been made yet
    const profileCheckSnap = await getDoc(doc(db, "Users", uid));

    // TODO: Add checks for if profile creation was incomplete for both
    if (type == "Mentor") {
      const pid = profileCheckSnap.data()["mentorID"];
      //console.log(mentorID);
      if (pid) {
        // a mentor profile already exists, skip ahead
        // TODO: go specifically to the mentor side of mentor matching
        //navigation.navigate("MENTORSCREEN2", {uid, mentorID, type});
        navigation.navigate("Home", {uid, pid, type});
        return; // ensures code after this does not execute once screen is left
      } else {
      }
    } else if (type == "Mentee") {
      const pid = profileCheckSnap.data()["menteeID"];
      //console.log(menteeID);
      if (pid) {
        // a mentee profile already exists, skip ahead
        //navigation.navigate("MENTORSCREEN2", {uid, menteeID, type});
        navigation.navigate("Home", {uid, pid, type});
        return;
      } else {
      }
    }

    const idCountSnap = await getDoc(doc(db, "Profiles", "profileCount"));

    if (idCountSnap.exists()) {
      // incremental ID
      const newID = idCountSnap.data()["count"] + 1;
      // save ID count
      await setDoc(doc(db, "Profiles", "profileCount"), { count: newID });
      await setDoc(doc(db, "Profiles", newID.toString()), {
        /* aboutMe: null,
        currentIndustry: null,
        currentRole: null,
        firstName: null,
        lastName: null,
        languages: null,
        location: null,
        pronouns: null, */
        userID: uid,
        profileType: type,
        profileID: newID
      })

      // attach the profile to their user
      if (type == "Mentor") {
        await updateDoc(doc(db, "Users", uid), {
          mentorID: newID
        });
      } else if (type == "Mentee") {
        await updateDoc(doc(db, "Users", uid), {
          menteeID: newID
        });
      } else {
        console.error("error with type");
      }

      // navigate to next page
      const pid = newID;
      navigation.navigate("About1", {uid, pid, type});

    } else {
      // something has gone wrong with the database
      console.error("No profileCount");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcome}>
        <Pressable
          style={styles.header1}
        >
          <Image
            style={styles.icon}
            contentFit="contain"
            source={require("../../assets/header-1.png")}
          />
        </Pressable>
        <View style={styles.info}>
          <Text style={[styles.welcome1, styles.welcome1FlexBox]}>WELCOME!</Text>
          <Text style={styles.welcome1FlexBox}>
            <Text
              style={styles.throughTheWomens}
            >{`Through The Women’s Business School, you can receive education from a team of high-level experts and leaders and get mentoring, advice and access to successful Women in Business from across a range of industries. \n\n`}</Text>
            <Text style={[styles.letsGetStarted, styles.menteeTypo]}>
              Which account would you like to login to?
            </Text>
          </Text>
        </View>
        <Pressable
          style={[styles.buttonPrimary, styles.buttonFlexBox]}
          //onPress={() => navigation.navigate("About1")}
          onPress={() => createProfile("Mentee")}
        >
          <Text style={styles.viewDetails}>
            <Text style={styles.imA}>{`I’m a `}</Text>
            <Text style={styles.menteeTypo}>Mentee</Text>
          </Text>
        </Pressable>
        <Pressable
          style={[styles.buttonPrimary, styles.buttonFlexBox]}
          //onPress={() => navigation.navigate("About1")}
          onPress={() => createProfile("Mentor")}
        >
          <Text style={styles.viewDetails}>
            <Text style={styles.imA}>{`I’m a `}</Text>
            <Text style={styles.menteeTypo}>Mentor</Text>
          </Text>
        </Pressable>
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 30,
    alignItems: "center",
    paddingTop: "25%",
    paddingBottom: "20%",
    justifyContent: "center",
  },
  welcome1FlexBox: {
    textAlign: "center",
    alignSelf: "stretch",
  },
  menteeTypo: {
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  buttonFlexBox: {
    paddingVertical: 20,
    paddingHorizontal: 0,
    flexDirection: "row",
    borderRadius: 5,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  header1: {
    width: "100%",
    height: 200,
  },
  welcome1: {
    fontSize: 24,
    color: "#000",
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  throughTheWomens: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: "Raleway-Regular",
    color: "#000",
    textAlign: "center",
  },
  letsGetStarted: {
    fontSize: 14,
    color: "#fa0066",
    textAlign: "center",
  },
  info: {
    overflow: "hidden",
    gap: 20,
    alignSelf: "stretch",
  },
  imA: {
    fontFamily: "Raleway-Regular",
  },
  viewDetails: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  buttonPrimary: {
    backgroundColor: "#ed469a",
  },
  buttonPrimary1: {
    backgroundColor: "#ea9bbf",
  },
  welcome: {
    gap: 30,
    justifyContent: "center",
    width: "100%",
  },
  logoutButton: {
    alignItems: "center",
    marginTop: 5,
  },
  logoutText: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Raleway-Regular",
  },
});

export default MenteeMentorSelector;
