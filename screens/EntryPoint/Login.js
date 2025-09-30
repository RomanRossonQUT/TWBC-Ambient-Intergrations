// ----------------------------------------------------------------------------
// Purpose: Email/password login screen.
// Notes:
// - Uses Firebase Auth for sign-in.
// - Validates basic email & password before calling Firebase.
// - Shows inline helper errors and a Snackbar for global messages.
// - Snackbar: shows friendly Firebase error messages.
// - Navigates to "MenteeMentorSelector" on successful sign-in.
// ----------------------------------------------------------------------------

import React, { useState } from "react";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { TextInput as RNPTextInput, Button, HelperText, Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const PINK = "#ED469A";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [snack, setSnack] = useState({ visible: false, msg: "" });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const showSnack = (msg) => setSnack({ visible: true, msg });
  const hideSnack = () => setSnack({ visible: false, msg: "" });

  // Validation: basic email format + min password length
  const validate = () => {
    let ok = true;
    setEmailError("");
    setPasswordError("");

    const emailTrim = email.trim();
    const passTrim = password.trim();

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrim) {
      setEmailError("Email is required");
      ok = false;
    } else if (!emailRegex.test(emailTrim)) {
      setEmailError("Enter a valid email (e.g. name@domain.com)");
      ok = false;
    }

    if (!passTrim) {
      setPasswordError("Password is required");
      ok = false;
    } else if (passTrim.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      ok = false;
    }
    return ok;
  };

  // Actions: attempt firebase sign-in
  const handleLogin = async () => {
    if (!validate()) {
      showSnack("Please fix the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      const emailTrim = email.trim();
      const passTrim = password.trim();
      await signInWithEmailAndPassword(auth, emailTrim, passTrim);
      navigation.navigate("MenteeMentorSelector");
    } catch (e) {
      // Friendly Firebase error messages
      let msg = "Unable to sign in. Please try again.";
      switch (e.code) {
        case "auth/invalid-email":
          msg = "That email address is invalid.";
          setEmailError("Invalid email address");
          break;
        case "auth/user-disabled":
          msg = "This account has been disabled.";
          break;
        case "auth/user-not-found":
          msg = "No account found for that email.";
          setEmailError("No account found for this email");
          break;
        case "auth/wrong-password":
          msg = "Incorrect password.";
          setPasswordError("Incorrect password");
          break;
        case "auth/too-many-requests":
          msg = "Too many attempts. Please wait and try again.";
          break;
      }
      showSnack(msg);
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.loginAccount, styles.loginAccountFlexBox]}>
          <Pressable style={styles.header1}>
            <Image
              style={styles.icon}
              contentFit="cover"
              source={require("../../assets/header-11.png")}
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
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              placeholderTextColor="#9eaab6"
              error={!!emailError}
              theme={{
                fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
                colors: {
                  text: "#191919",
                  primary: PINK,
                  error: "#d32f2f",
                },
              }}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError("");
              }}
            />
            <HelperText type="error" visible={!!emailError}>
              {emailError}
            </HelperText>

            <RNPTextInput
              style={styles.form}
              label="Password"
              placeholder="Enter Password"
              mode="outlined"
              placeholderTextColor="#9eaab6"
              secureTextEntry
              error={!!passwordError}
              theme={{
                fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
                colors: {
                  text: "#191919",
                  primary: PINK,
                  error: "#d32f2f",
                },
              }}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (passwordError) setPasswordError("");
              }}
            />
            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>
          </View>

          <Pressable
            style={[styles.buttonPrimary, styles.loginSectionSpaceBlock, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={[styles.viewDetails, styles.viewDetailsTypo]}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          <Button
            color="#ea9bbf"
            onPress={() => navigation.navigate("SignUp")}
            style={styles.dontHaveAnBtn1}
            labelStyle={styles.dontHaveAnBtn}
          >
            Don&apos;t have an account?
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snack.visible}
        onDismiss={hideSnack}
        duration={3500}
        action={{ label: "OK", onPress: hideSnack }}
      >
        {snack.msg}
      </Snackbar>
    </>
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
  dontHaveAnBtn1: { marginTop: 10 },
  loginAccountFlexBox: { justifyContent: "center", alignItems: "center" },
  infoCommon: { gap: 20, overflow: "hidden" },
  loginToAccountFlexBox: { textAlign: "center", color: "#000", alignSelf: "stretch" },
  loginSectionSpaceBlock: { paddingVertical: 10, paddingHorizontal: 0, alignSelf: "stretch" },
  viewDetailsTypo: { fontFamily: "Raleway-Bold", fontWeight: "700" },
  icon: { height: "100%", width: "100%" },
  header1: { width: 330, height: 270 },
  loginToAccount: { fontSize: 32, fontFamily: "Raleway-Bold", fontWeight: "700" },
  joinAndConnect: { fontFamily: "Raleway-Regular", fontSize: 18 },
  info: { alignSelf: "stretch" },
  form: { alignSelf: "stretch" },
  loginSection: { gap: 6, overflow: "hidden" },
  viewDetails: { color: "#fff", textAlign: "center", fontSize: 18 },
  buttonPrimary: {
    borderRadius: 5,
    backgroundColor: "#ed469a",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  loginAccount: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
    gap: 20,
    width: "100%",
  },
});

export default Login;
