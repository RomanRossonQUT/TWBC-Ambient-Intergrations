import React, { useState, useEffect } from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { TextInput as RNPTextInput } from "react-native-paper";
import { Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc} from "firebase/firestore"
import { db, auth } from '../firebaseConfig'

const CreateAccount = () => {
  // declare values needed to create a user account
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

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

  const saveUserInFirestore = async (uid, email, password) => {
    try {
      await setDoc(doc(db, "Users", uid), {
        userID: uid,
        username: email,
        password: password,
        menteeID: null,
        mentorID: null
      });
      console.log("saved?");
    } catch (error) {
        console.error('error saving account to db:', error);
    }
  }

  const handleSignUp = () => {
    console.log(email)
    console.log(password1)
    console.log(password2)
    removeWhiteSpace(password1);
    removeWhiteSpace(password2);
    removeWhiteSpace(email);
    if (password1 == password2) {
      // passwords are the same so now create account
      // TODO: currently an issue with if there is a space in the email at the end

      console.log("attempting to save");
      if (checkStringEmpty(email) == true || checkStringEmpty(password1) == true || checkStringEmpty(password2) == true) {
        console.error("email or password is empty");
        error("email or password is empty");
    }
    
      createUserWithEmailAndPassword(auth, email, password1)
        .then((userCredential) => {
          //signed up
          const user = userCredential.user;
          const uid = user.uid;
          //console.log(uid);
          saveUserInFirestore(uid, email, password1);
          // navigate to the next page
          navigation.navigate("Welcome")
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error(`Error ${errorCode}: ${errorMessage}`);
        });

    } else {
      // this will need to change
      console.error("passwords are not the same");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={[styles.createAccount, styles.createAccountFlexBox]}>
        <Pressable
          style={styles.header1}
          onPress={() => navigation.navigate("StartScreen")}
        >
          <Image
            style={styles.icon}
            contentFit="cover"
            source={require("../assets/header-11.png")}
          />
        </Pressable>
        <View style={[styles.info, styles.infoCommon]}>
          <Text style={[styles.createAnAccount, styles.createAnAccountFlexBox]}>
            Create an Account
          </Text>
          <Text style={[styles.joinAndConnect, styles.createAnAccountFlexBox]}>
            Join and connect with mentors now!
          </Text>
        </View>
        <View style={[styles.signupSection, styles.signupSectionSpaceBlock]}>
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
            value={password1}
            onChangeText={setPassword1}
          />
          <RNPTextInput
            style={styles.form}
            label="Reconfirm Password"
            placeholder="Reconfirm Password"
            mode="outlined"
            placeholderTextColor="#9eaab6"
            theme={{
              fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
              colors: { text: "#191919" },
            }}
            value={password2}
            onChangeText={setPassword2}
          />
        </View>
        <Pressable
          style={[styles.buttonPrimary, styles.signupSectionSpaceBlock]}
          //onPress={() => navigation.navigate("Welcome")}
          onPress={handleSignUp}
        >
          <Text style={[styles.viewDetails, styles.viewDetailsTypo]}>
            Sign Up
          </Text>
        </Pressable>
        <Button
          title="Already have an account?"
          radius="0"
          iconPosition="left"
          type="clear"
          color="#ea9bbf"
          titleStyle={styles.alreadyHaveAnBtn}
          onPress={() => navigation.navigate("LoginAccount")}
          containerStyle={styles.alreadyHaveAnBtn1}
          buttonStyle={styles.alreadyHaveAnBtn2}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 30,
    paddingVertical: 30,
    alignItems: "center",
    marginTop: 50,
  },
  alreadyHaveAnBtn: {
    color: "#ea9bbf",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Raleway-SemiBold",
  },
  alreadyHaveAnBtn1: {
    position: "relative",
  },
  alreadyHaveAnBtn2: {},
  createAccountFlexBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoCommon: {
    gap: 20,
    overflow: "hidden",
  },
  createAnAccountFlexBox: {
    textAlign: "left",
    color: "#000",
    alignSelf: "stretch",
  },
  signupSectionSpaceBlock: {
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
  createAnAccount: {
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
  signupSection: {
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
  createAccount: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 0,
    gap: 30,
    width: "100%",
  },
});

export default CreateAccount;
