import * as React from "react";
import { Pressable, StyleSheet, View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import AboutMe from "../components/AboutMe";
import Skills from "../components/Skills";

const MENTORPROFILE = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Pressable
        style={styles.header21}
        onPress={() => navigation.navigate("MATCHINGSCREEN1")}
      >
        <Image
          style={styles.icon}
          contentFit="cover"
          source={require("../assets/header-2-1.png")}
        />
      </Pressable>
      <Image
        style={styles.image44Icon}
        contentFit="cover"
        source={require("../assets/image-43.png")}
      />
      <View style={styles.heading1}>
        <View style={styles.frame}>
          <View style={styles.heading11}>
            <Text style={[styles.amandaThompson, styles.sheherFlexBox]}>
              Amanda Thompson
            </Text>
          </View>
          <Text style={[styles.sheher, styles.sheherFlexBox]}>She/Her</Text>
        </View>
        <View style={styles.heading2}>
          <Text style={[styles.businessServices, styles.brisbaneQldTypo]}>
            Business Services
          </Text>
        </View>
        <Text style={[styles.brisbaneQld, styles.brisbaneQldTypo]}>
          Brisbane, QLD | 11 Years Experience
        </Text>
      </View>
      <AboutMe />
      <Skills interests="Interests" propHeight="unset" />
      <Skills interests="Skills" propHeight="unset" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "#fafafa",
    paddingHorizontal: 30,
    paddingVertical: 60,
    gap: 20,
    alignItems: "center",
  },
  sheherFlexBox: {
    display: "flex",
    textAlign: "left",
    color: "#000",
    alignItems: "center",
  },
  brisbaneQldTypo: {
    fontSize: 16,
    display: "flex",
    textAlign: "left",
    color: "#000",
    alignItems: "center",
  },
  icon: {
    height: "100%",
    width: "100%",
  },
  header21: {
    height: 50,
    width: 330,
  },
  image44Icon: {
    borderRadius: 12,
    width: 217,
    height: 250,
  },
  amandaThompson: {
    width: "142.5%",
    top: "-9.37%",
    fontSize: 32,
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
    left: "0%",
    position: "absolute",
  },
  heading11: {
    alignSelf: "stretch",
    flex: 1,
  },
  sheher: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Raleway-SemiBold",
    width: 76,
    alignSelf: "stretch",
  },
  frame: {
    height: 32,
    flexDirection: "row",
    gap: 10,
    overflow: "hidden",
    width: 330,
  },
  businessServices: {
    width: "247.73%",
    top: "11.11%",
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
    left: "0%",
    position: "absolute",
  },
  heading2: {
    height: 18,
    alignSelf: "stretch",
  },
  brisbaneQld: {
    fontFamily: "Raleway-Regular",
    height: 13,
    alignSelf: "stretch",
  },
  heading1: {
    gap: 5,
    overflow: "hidden",
    alignSelf: "stretch",
  },
});

export default MENTORPROFILE;
