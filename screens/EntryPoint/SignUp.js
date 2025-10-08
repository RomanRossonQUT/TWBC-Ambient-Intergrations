// -----------------------------------------------------------------------------
// Purpose: Account creation screen using Firebase Auth + Firestore.
// Notes:
// - Validates email/password and confirms match before creating account.
// - Creates a minimal user profile document in Firestore (no passwords stored).
// - Shows inline field errors + a global Snackbar for status messages.
// - Navigates to "Login" or "MenteeMentorSelector" after success.
// -----------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { TextInput as RNPTextInput, Button, HelperText, Snackbar, ActivityIndicator } from "react-native-paper";
import AdaptiveTextInput from "../../components/AdaptiveTextInput";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import Icon from 'react-native-vector-icons/Ionicons';

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
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null, 'available', 'taken', 'checking'
  const showSnack = (msg) => setSnack({ visible: true, msg });
  const hideSnack = () => setSnack({ visible: false, msg: "" });

  // Debounced email checking function
  const checkEmailAvailability = useCallback(async (emailToCheck) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setEmailStatus(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck)) {
      setEmailStatus(null);
      return;
    }

    try {
      setEmailChecking(true);
      setEmailStatus('checking');
      console.log("[DEBUG] Checking email availability:", emailToCheck);

      // Check both Firebase Auth and Firestore for existing emails
      let emailExists = false;

      // Method 1: Check Firebase Auth
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, emailToCheck);
        console.log("[DATA] Firebase Auth sign-in methods:", signInMethods);
        
        if (signInMethods && signInMethods.length > 0) {
          emailExists = true;
          console.log("[DATA] Email found in Firebase Auth");
        }
      } catch (authError) {
        console.log("[WARN] Firebase Auth check failed:", authError.message);
      }

      // Method 2: Check Firestore Users collection
      if (!emailExists) {
        try {
          const usersQuery = query(
            collection(db, "Users"),
            where("username", "==", emailToCheck)
          );
          const usersSnapshot = await getDocs(usersQuery);
          console.log("[DATA] Firestore Users query result:", usersSnapshot.size, "documents");
          
          if (!usersSnapshot.empty) {
            emailExists = true;
            console.log("[DATA] Email found in Firestore Users collection");
          }
        } catch (firestoreError) {
          console.log("[WARN] Firestore Users check failed:", firestoreError.message);
        }
      }

      // Method 3: Check Firestore Profiles collection (backup check)
      if (!emailExists) {
        try {
          const profilesQuery = query(
            collection(db, "Profiles"),
            where("email", "==", emailToCheck)
          );
          const profilesSnapshot = await getDocs(profilesQuery);
          console.log("[DATA] Firestore Profiles query result:", profilesSnapshot.size, "documents");
          
          if (!profilesSnapshot.empty) {
            emailExists = true;
            console.log("[DATA] Email found in Firestore Profiles collection");
          }
        } catch (firestoreError) {
          console.log("[WARN] Firestore Profiles check failed:", firestoreError.message);
        }
      }

      // Set final status
      if (emailExists) {
        setEmailStatus('taken');
        setEmailError("This email is already registered");
        console.log("[DATA] Email is already taken - found in database");
      } else {
        setEmailStatus('available');
        setEmailError("");
        console.log("[SUCCESS] Email is available - not found in any database");
      }
    } catch (error) {
      console.error("[ERROR] Error checking email:", error);
      console.error("[ERROR] Error details:", error.code, error.message);
      setEmailStatus(null);
      // Don't set error here as it might be a network issue
    } finally {
      setEmailChecking(false);
    }
  }, []);

  // Debounce email checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (email.trim()) {
        checkEmailAvailability(email.trim());
      } else {
        setEmailStatus(null);
        setEmailError("");
      }
    }, 800); // 800ms delay

    return () => clearTimeout(timeoutId);
  }, [email, checkEmailAvailability]);

  // Validation: email format, min length, match confirmation, email availability
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
    } else if (emailStatus === 'taken') {
      setEmailError("This email is already registered");
      ok = false;
    } else if (emailStatus === 'checking') {
      setEmailError("Please wait while we check email availability");
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

  // Actions: attempt Firebase sign-up + create Firestore user doc
  const handleSignUp = async () => {
    if (!validate()) {
      showSnack("Please fix the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      const emailTrim = email.trim();
      const passTrim = password1.trim();

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, emailTrim, passTrim);
      const uid = userCredential.user.uid;

      // Store user metadata only — NEVER store raw passwords. Passwords are managed by Firebase Auth.
      await setDoc(doc(db, "Users", uid), {
        userID: uid,
        username: emailTrim,
        menteeID: null,
        mentorID: null,
      });

      showSnack("Account created successfully!");
      // Slight delay so the user can see the success toast
      setTimeout(() => {
        navigation.navigate("MenteeMentorSelector", { uid });
      }, 1200);
    } catch (e) {
      // Friendly Firebase error messages
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

  // Render
  return (
    <>
      <View style={styles.container}>
        <Pressable 
          style={styles.backArrow}
          onPress={() => navigation.navigate("AppEntry")}
        >
          <Text style={styles.backArrowText}>←</Text>
        </Pressable>
        <View style={[styles.createAccount, styles.center]}>
          <Pressable style={styles.header}>
            <Image style={styles.icon} contentFit="cover" source={require("../../assets/header-11.png")} />
          </Pressable>

          <View style={styles.info}>
            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.subtitle}>Join and connect with mentors now!</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.emailInputContainer}>
              <AdaptiveTextInput
                placeholder="Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                error={!!emailError}
              />
              {emailStatus === 'checking' && (
                <View style={styles.emailStatusIcon}>
                  <ActivityIndicator size={20} color={PINK} />
                </View>
              )}
              {emailStatus === 'available' && (
                <View style={styles.emailStatusIcon}>
                  <Icon name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
              )}
              {emailStatus === 'taken' && (
                <View style={styles.emailStatusIcon}>
                  <Icon name="close-circle" size={20} color="#f44336" />
                </View>
              )}
            </View>
            <HelperText type="error" visible={!!emailError}>{emailError}</HelperText>

            <AdaptiveTextInput
              placeholder="Password"
              value={password1}
              onChangeText={(t) => {
                setPassword1(t);
                if (passwordError) setPasswordError("");
              }}
              secureTextEntry
              error={!!passwordError}
            />
            <HelperText type="error" visible={!!passwordError}>{passwordError}</HelperText>

            <AdaptiveTextInput
              placeholder="Confirm Password"
              value={password2}
              onChangeText={(t) => {
                setPassword2(t);
                if (confirmError) setConfirmError("");
              }}
              secureTextEntry
              error={!!confirmError}
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
      </View>

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
  container: {
    flex: 1,
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
  emailInputContainer: {
    width: "100%",
    marginBottom: 0,
    position: 'relative',
  },
  emailStatusIcon: {
    position: 'absolute',
    right: 20,
    top: 25,
    zIndex: 1,
  },
  form: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  successText: {
    color: "#4CAF50",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
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
  backArrow: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  backArrowText: {
    fontSize: 24,
    color: "#d0d0d0",
    fontFamily: "Raleway-Regular",
  },
});


export default SignUp;
