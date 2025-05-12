import * as React from "react";
import { Image } from "expo-image";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { deleteMatches } from "../mentor_matching/matchingAlgorithm";
import Navbar from "../components/Navbar";

const ResetMatches = ({route}) => {
  const navigation = useNavigation();
  const {uid, pid, type} = route.params;


  const revisitDeclinedMatches = async () => {
    // only delete matches rejected by this mentee
    await deleteMatches([pid], ["Rejected"]);

    // navigate back to mentor matching
    navigation.replace("MATCHINGSCREEN1", {uid, pid, type});
  }


  return (
    <View style={styles.screenContainer}>
      <View style={styles.contentContainer}>
        <Image
          style={styles.headerImage}
          contentFit="cover"
          source={require("../assets/header-1.png")}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.titleText}>End of Available Mentors</Text>
          <Text style={styles.descriptionText}>
          You've seen all of our available mentors, but more join all the time! 
          Check in again later, or revisit skipped mentors in the meantime.
          </Text>
          <Text style={styles.readyText}>Ready to reset?</Text>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          //onPress={() => navigation.navigate("MATCHINGSCREEN1", {uid, pid, type})}
          onPress={revisitDeclinedMatches}
        >
          <Text style={styles.buttonText}>Restart Matching</Text>
        </TouchableOpacity>
      </View>
      <Navbar style={styles.navbar} />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fafafa",
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  headerImage: {
    width: 330,
    height: 270,
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Raleway-Bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: "Raleway-Regular",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  readyText: {
    fontSize: 16,
    color: "#fa0066",
    textAlign: "center",
  },
  primaryButton: {
    borderRadius: 5,
    backgroundColor: "#ed469a",
    paddingHorizontal: 25,
    paddingVertical: 12,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Raleway-Bold",
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default ResetMatches;
