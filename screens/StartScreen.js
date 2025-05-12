import * as React from "react";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";

const StartScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.startScreen}>
        <Image
          style={styles.header1Icon}
          contentFit="contain"
          source={require("../assets/header-11.png")}
        />
        <View style={styles.info}>
          <Text style={[styles.learnFromAmazing, styles.theAimOfFlexBox]}>
            LEARN FROM AMAZING WOMEN IN BUSINESS
          </Text>
          <Text style={[styles.theAimOf, styles.theAimOfFlexBox]}>
            The aim of The Women’s Business School is to provide a space where
            women can come together to learn from each other, be inspired to
            dream bigger and reach their full potential.
          </Text>
        </View>
        <Pressable
          style={[styles.buttonPrimary, styles.buttonFlexBox]}
          onPress={() => navigation.navigate("LoginAccount")}
        >
          <Text style={[styles.viewDetails, styles.viewDetailsTypo]}>Login</Text>
        </Pressable>
        <Pressable
          style={[styles.buttonPrimary1, styles.buttonFlexBox]}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          <Text style={[styles.viewDetails, styles.viewDetailsTypo]}>
            Sign Up
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  theAimOfFlexBox: {
    textAlign: "left",
    alignSelf: "stretch",
  },
  buttonFlexBox: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 5,
    alignSelf: "stretch",
    alignItems: "center",
  },
  viewDetailsTypo: {
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  header1Icon: {
    width: "100%",
    height: 270,
  },
  learnFromAmazing: {
    fontSize: 32,
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  theAimOf: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: "Raleway-Regular",
  },
  info: {
    overflow: "hidden",
    gap: 20,
    alignSelf: "stretch",
    alignItems: "center",
  },
  viewDetails: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  buttonPrimary: {
    backgroundColor: "#ea9bbf",
  },
  buttonPrimary1: {
    backgroundColor: "#ed469a",
  },
  startScreen: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 30,
    paddingTop: "20%",
    paddingBottom: "20%",
    gap: 30,
    justifyContent: "center",
  },
});

export default StartScreen;
