import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, getDoc, updateDoc} from "firebase/firestore"
import { db, auth } from '../firebaseConfig';


const Welcome = () => {
  const [uid, setUID] = useState(''); // user id

  const navigation = useNavigation();

  // get current userID
  onAuthStateChanged(auth, (user) => {
    if (user) { setUID(user.uid); } else { console.error("No user logged in"); }
    //console.log(uid)
  })

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
        console.log("mentor profile exists, skip creations.");
        //navigation.navigate("MENTORSCREEN2", {uid, mentorID, type});
        navigation.navigate("Home", {uid, pid, type});
        return; // ensures code after this does not execute once screen is left
      } else {
        // a mentor profile has not been made yet, continue onto profile creation
        console.log("onto mentor profile creation");
      }
    } else if (type == "Mentee") {
      const pid = profileCheckSnap.data()["menteeID"];
      //console.log(menteeID);
      if (pid) {
        // a mentee profile already exists, skip ahead
        console.log("mentee profile exists, skip creation");
        //navigation.navigate("MENTORSCREEN2", {uid, menteeID, type});
        console.log(typeof(pid));
        navigation.navigate("Home", {uid, pid, type});
        return;
      } else {
        // a mentee profile has not been made yet, continue onto profile creation
        console.log("onto mentee profile creation");
      }
    }

    

    console.log("hello?");
    const idCountSnap = await getDoc(doc(db, "Profiles", "profileCount"));

    if (idCountSnap.exists()) {
      // incremental ID
      const newID = idCountSnap.data()["count"] + 1;

      console.log(newID);

      // save ID count
      await setDoc(doc(db, "Profiles", "profileCount"), { count: newID });
      
      // create a new profile
      console.log("1")
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
      console.log("2")

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
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.welcome}>
        <Pressable
          style={styles.header1}
          onPress={() => navigation.navigate("StartScreen")}
        >
          <Image
            style={styles.icon}
            contentFit="cover"
            source={require("../assets/header-1.png")}
          />
        </Pressable>
        <View style={styles.info}>
          <Text style={[styles.welcome1, styles.welcome1FlexBox]}>WELCOME!</Text>
          <Text style={styles.welcome1FlexBox}>
            <Text
              style={styles.throughTheWomens}
            >{`Through The Women’s Business School, you can receive education from a team of high-level experts and leaders and get mentoring, advice and access to successful Women in Business from across a range of industries. \n\n`}</Text>
            <Text style={[styles.letsGetStarted, styles.menteeTypo]}>
              Let's get started!
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
          style={[styles.buttonPrimary1, styles.buttonFlexBox]}
          //onPress={() => navigation.navigate("About1")}
          onPress={() => createProfile("Mentor")}
        >
          <Text style={styles.viewDetails}>
            <Text style={styles.imA}>{`I’m a `}</Text>
            <Text style={styles.menteeTypo}>Mentor</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 30,
    paddingVertical: 30,
    alignItems: "center",
    paddingTop: "30%",
    paddingBottom: "20%",
  },
  welcome1FlexBox: {
    textAlign: "left",
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
  },
  header1: {
    width: "100%",
    height: 270,
  },
  welcome1: {
    fontSize: 32,
    color: "#000",
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  throughTheWomens: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: "Raleway-Regular",
    color: "#000",
  },
  letsGetStarted: {
    fontSize: 16,
    color: "#fa0066",
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
});

export default Welcome;
