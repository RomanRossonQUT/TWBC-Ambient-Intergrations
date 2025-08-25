import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // Using ONLY one auth instance

const SignUp = ({ navigation }) => {
  // State variables for form inputs
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to trim spaces
  const trimInput = (str) => str.trim();

  // Basic email format validation
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Save user to Firestore
  const saveUserInFirestore = async (uid, email) => {
    try {
      await setDoc(doc(collection(db, "users"), uid), {
        uid,
        email,
        createdAt: new Date(),
      });
      console.log("SUCCESS: User saved to Firestore.");
    } catch (error) {
      console.error("Firestore save error:", error.message);
      Alert.alert("Error", "Failed to save user data.");
    }
  };

  // Handle Signup
  const handleSignUp = async () => {
    try {
      const trimmedEmail = trimInput(email);
      const trimmedPassword1 = trimInput(password1);
      const trimmedPassword2 = trimInput(password2);

      // Validation checks
      if (!trimmedEmail || !trimmedPassword1 || !trimmedPassword2) {
        Alert.alert("Missing Fields", "Please fill in all fields.");
        return;
      }

      if (!isValidEmail(trimmedEmail)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
      }

      if (trimmedPassword1.length < 6) {
        Alert.alert("Weak Password", "Password must be at least 6 characters.");
        return;
      }

      if (trimmedPassword1 !== trimmedPassword2) {
        Alert.alert("Password Mismatch", "Passwords do not match.");
        return;
      }

      setLoading(true);

      // Firebase signup
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword1
      );

      if (!userCredential?.user) {
        throw new Error("Signup failed: No user data returned.");
      }

      const uid = userCredential.user.uid;
      await saveUserInFirestore(uid, trimmedEmail);

      console.log("Account created successfully:", uid);
      Alert.alert("Success", "Your account has been created!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Signup error:", error.message);
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Women's Business School</Text>
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>Join and connect with mentors now!</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password1}
        onChangeText={setPassword1}
        secureTextEntry
      />

      {/* Confirm Password */}
      <TextInput
        style={styles.input}
        placeholder="Reconfirm Password"
        placeholderTextColor="#888"
        value={password2}
        onChangeText={setPassword2}
        secureTextEntry
      />

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating Account..." : "Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e91e63",
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
