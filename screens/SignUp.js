import React, { useState } from "react";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { TextInput as RNPTextInput, Button, HelperText, Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const PINK = "#ED469A";

const SignUp = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [snack, setSnack] = useState({ visible: false, msg: "" });
  const [loading, setLoading] = useState(false);

  const showSnack = (msg) => setSnack({ visible: true, msg });
  const hideSnack = () => setSnack({ visible: false, msg: "" });

  const validate = () => {
    let ok = true;
    setEmailError("");
    setPasswordError("");
    setConfirmError("");

    const emailTrim = email.trim();
    const passTrim = password1.trim();
    const passConfirmTrim = password2.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrim) {
      setEmailError("Email is required");
      ok = false;
    } else if (!emailRegex.test(emailTrim)) {
      setEmailError("Enter a valid email address");
      ok = false;
    }

    if (!passTrim) {
      setPasswordError("Password is required");
      ok = false;
    } else if (passTrim.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      ok = false;
    }

    if (passTrim !== passConfirmTrim) {
      setConfirmError("Passwords do not match");
      ok = false;
    }

    return ok;
  };

  const handleSignUp = async () => {
    if (!validate()) {
      showSnack("Please fix the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      const emailTrim = email.trim();
      const passTrim = password1.trim();

      const userCredential = await createUserWithEmailAndPassword(auth, emailTrim, passTrim);
      const uid = userCredential.user.uid;

      // Store user metadata only — NEVER store raw passwords
      await setDoc(doc(db, "Users", uid), {
        userID: uid,
        username: emailTrim,
        menteeID: null,
        mentorID: null,
      });

      showSnack("Account created successfully!");
      setTimeout(() => {
        navigation.navigate("MenteeMentorSelector", { uid });
      }, 1200);
    } catch (e) {
      let msg = "Unable to create account. Please try again.";
      switch (e.code) {
        case "auth/email-already-in-use":
          msg = "This email is already registered.";
          setEmailError("Email already in use");
          break;
        case "auth/invalid-email":
          msg = "Invalid email address.";
          setEmailError("Invalid email address");
          break;
        case "auth/weak-password":
          msg = "Password is too weak.";
          setPasswordError("Choose a stronger password");
          break;
      }
      showSnack(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.createAccount, styles.center]}>
          <Pressable style={styles.header}>
            <Image style={styles.icon} contentFit="cover" source={require("../assets/header-11.png")} />
          </Pressable>

          <View style={styles.info}>
            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.subtitle}>Join and connect with mentors now!</Text>
          </View>

          <View style={styles.formSection}>
            <RNPTextInput
              style={styles.form}
              label="Email"
              placeholder="Email@address.com"
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              error={!!emailError}
              theme={{ colors: { primary: PINK, error: "#d32f2f" } }}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError("");
              }}
            />
            <HelperText type="error" visible={!!emailError}>{emailError}</HelperText>

            <RNPTextInput
              style={styles.form}
              label="Password"
              placeholder="Enter Password"
              mode="outlined"
              secureTextEntry
              error={!!passwordError}
              theme={{ colors: { primary: PINK, error: "#d32f2f" } }}
              value={password1}
              onChangeText={(t) => {
                setPassword1(t);
                if (passwordError) setPasswordError("");
              }}
            />
            <HelperText type="error" visible={!!passwordError}>{passwordError}</HelperText>

            <RNPTextInput
              style={styles.form}
              label="Confirm Password"
              placeholder="Re-enter Password"
              mode="outlined"
              secureTextEntry
              error={!!confirmError}
              theme={{ colors: { primary: PINK, error: "#d32f2f" } }}
              value={password2}
              onChangeText={(t) => {
                setPassword2(t);
                if (confirmError) setConfirmError("");
              }}
            />
            <HelperText type="error" visible={!!confirmError}>{confirmError}</HelperText>
          </View>

          <Pressable
            style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Creating..." : "Sign Up"}</Text>
          </Pressable>

          <Button
            color="#ea9bbf"
            onPress={() => navigation.navigate("Login")}
            style={styles.linkButton}
            labelStyle={styles.linkText}
          >
            Already have an account?
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
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  createAccount: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  formSection: {
    width: "100%",
    marginTop: 12,
    marginBottom: 16,
  },
  form: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  buttonPrimary: {
    backgroundColor: PINK,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  linkButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  linkText: {
    fontSize: 15,
    color: "#ea9bbf",
    textAlign: "center",
  },
});


export default SignUp;
