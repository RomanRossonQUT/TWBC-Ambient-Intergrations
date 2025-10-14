// ----------------------------------------------------------------------------
// Purpose: App entry screen with navigation to Login/SignUp.
// Notes:
// - Simple welcome screen with app intro text.
// - Buttons to navigate to Login or SignUp screens.
// ----------------------------------------------------------------------------

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import 'react-native-gesture-handler';


const AppEntry = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.startScreen}>
        <Image
          style={styles.header1Icon}
          contentFit="contain"
          source={require("../../assets/header-11.png")}
        />
        <View style={styles.info}>
          <Text style={[styles.learnFromAmazing, styles.theAimOfFlexBox]}>
            LEARN FROM AMAZING WOMEN IN <Text style={styles.businessHighlight}>BUSINESS</Text>
          </Text>
          <Text style={[styles.theAimOf, styles.theAimOfFlexBox]}>
            The aim of The Women’s Business School is to provide a space where
            women can come together to learn from each other, be inspired to
            dream bigger and reach their full potential.
          </Text>
        </View>
        <Pressable
          style={[styles.buttonPrimary1, styles.buttonFlexBox]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={[styles.viewDetails, styles.viewDetailsTypo]}>Login</Text>
        </Pressable>
        <Pressable
          style={[styles.buttonPrimary1, styles.buttonFlexBox]}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={[styles.viewDetails, styles.viewDetailsTypo]}>
            Sign Up
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  theAimOfFlexBox: {
    textAlign: "center",
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
    height: 220,
  },
  businessHighlight: {
    color: "#ed469a",
    fontFamily: "NotoSerifTelugu-Bold",
  },
  learnFromAmazing: {
    fontSize: 28,
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  theAimOf: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: "Raleway-Regular",
    textAlign: "center",
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

export default AppEntry;
