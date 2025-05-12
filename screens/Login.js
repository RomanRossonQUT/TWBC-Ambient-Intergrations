import React, { useState, useEffect } from "react";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { TextInput as RNPTextInput } from "react-native-paper";
import { Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from '../firebaseConfig'


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  const checkStringEmpty = async (string) => {
    if (string == null || string == "") {
      return true
    }
    return false
  }
  const removeWhiteSpace = async (string) => {
    return string.trimEnd();
  }
  
  const handleLogin = () => {
    removeWhiteSpace(email);
    removeWhiteSpace(password);
    if (checkStringEmpty(email) == true || checkStringEmpty(password) == true)
      {
        console.error("email or password is empty");
        error("email or password is empty");
      }
    console.log(email)
    console.log(password)
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        //signed in
        const user = userCredential.user;
        console.log(user);

        // navigate to next screen
        //navigation.navigate("Home")
        navigation.navigate("MenteeMentorSelector");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`Error ${errorCode}: ${errorMessage}`);
      })
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.loginAccount, styles.loginAccountFlexBox]}>
        <Pressable
          style={styles.header1}
        >
          <Image
            style={styles.icon}
            contentFit="cover"
            source={require("../assets/header-11.png")}
          />
        </Pressable>
        <View style={[styles.info, styles.infoCommon]}>
          <Text style={[styles.loginToAccount, styles.loginToAccountFlexBox]}>
            Login to Account
          </Text>
          <Text style={[styles.joinAndConnect, styles.loginToAccountFlexBox]}>
            Join and connect with mentors now!
          </Text>
        </View>
        <View style={[styles.loginSection, styles.loginSectionSpaceBlock]}>
          <RNPTextInput
            style={styles.form}
            label="Email"
            placeholder="Email@address.com"
            mode="outlined"
            placeholderTextColor="#9eaab6"
            theme={{
              fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
              colors: { text: "#191919" },
            }}
            value={email}
            onChangeText={setEmail}
          />
          <RNPTextInput
            style={styles.form}
            label="Password"
            placeholder="Enter Password"
            mode="outlined"
            placeholderTextColor="#9eaab6"
            theme={{
              fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
              colors: { text: "#191919" },
            }}
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <Pressable
          style={[styles.buttonPrimary, styles.loginSectionSpaceBlock]}
          onPress={handleLogin}
        >
          <Text style={[styles.viewDetails, styles.viewDetailsTypo]}>Login</Text>
        </Pressable>
        <Button
          title="Don't have an account?"
          radius="0"
          iconPosition="left"
          type="clear"
          color="#ea9bbf"
          titleStyle={styles.dontHaveAnBtn}
          onPress={() => navigation.navigate("SignUp")}
          containerStyle={styles.dontHaveAnBtn1}
          buttonStyle={styles.dontHaveAnBtn2}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  dontHaveAnBtn: {
    color: "#ea9bbf",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Raleway-SemiBold",
  },
  dontHaveAnBtn1: {
    position: "relative",
  },
  dontHaveAnBtn2: {},
  loginAccountFlexBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoCommon: {
    gap: 20,
    overflow: "hidden",
  },
  loginToAccountFlexBox: {
    textAlign: "left",
    color: "#000",
    alignSelf: "stretch",
  },
  loginSectionSpaceBlock: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    alignSelf: "stretch",
  },
  viewDetailsTypo: {
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  icon: {
    height: "100%",
    width: "100%",
  },
  header1: {
    width: 330,
    height: 270,
  },
  loginToAccount: {
    fontSize: 32,
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  joinAndConnect: {
    fontFamily: "Raleway-Regular",
    fontSize: 18,
  },
  info: {
    alignSelf: "stretch",
  },
  form: {
    alignSelf: "stretch",
  },
  loginSection: {
    gap: 20,
    overflow: "hidden",
  },
  viewDetails: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  buttonPrimary: {
    borderRadius: 5,
    backgroundColor: "#ed469a",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginAccount: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingVertical: 0,
    gap: 30,
    width: "100%",
  },
});

export default Login;
