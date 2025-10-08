import React, { useState } from "react";
import { Pressable, StyleSheet, View, Text, ScrollView, TextInput, Alert } from "react-native";
import AdaptiveTextInput from "../../components/AdaptiveTextInput";
import { Image } from "expo-image";
import { ProgressBar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { setDoc, doc } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const About4 = ({ route }) => {
  const navigation = useNavigation();
  const { uid, pid, type } = route.params;
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        console.log("[DATA] Profile image selected:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("[ERROR] Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const saveData = async () => {
    try {
      console.log("[DEBUG] Saving bio and profile data");
      console.log("[DATA] Bio:", bio);
      console.log("[DATA] Profile image:", profileImage);

      // Save the user's bio and profile image in Firebase
      await setDoc(doc(db, "Profiles", pid.toString()), {
        bio: bio,
        profileImageUrl: profileImage || null, // Save image URI or null if no image
      }, { merge: true });

      console.log("[SUCCESS] Bio and profile data saved successfully");
      
      // Navigate to the Home screen after saving
      navigation.navigate("Home", {uid, pid, type});
    } catch (error) {
      console.error("[ERROR] Error saving bio and profile data:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
      <View style={styles.about44}>
        <Pressable
          style={styles.headerContainer}
           
        >
          <Image
            style={styles.headerImage}
            contentFit="contain"
            source={require("../../assets/header-11.png")}
          />
        </Pressable>
        <View style={styles.progressContainer}>
          <ProgressBar
            style={styles.progressbar}
            progress={1}
            color="#ed469a"
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.tellUsMore}>Tell us more about you!</Text>
        </View>
        
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <Text style={styles.sectionTitle}>Add a Profile Picture</Text>
          <Pressable style={styles.profilePictureContainer} onPress={pickImage}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profilePicture}
                contentFit="cover"
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Icon name="camera" size={40} color="#666" />
              </View>
            )}
          </Pressable>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>Tell us about yourself</Text>
          <TextInput
            placeholder="Enter your bio here..."
            value={bio}
            onChangeText={(text) => setBio(text)}
            style={styles.multilineInput}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.buttonFinish} onPress={saveData}>
            <Text style={styles.buttonText}>Finish</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 30,
    width: "100%",
    paddingTop: "20%",
    paddingBottom: "20%",
  },
  about44: {
    flex: 1,
    gap: 30,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  headerContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressbar: {
    backgroundColor: "#ea9bbf",
    height: 20,
    width: 330,
  },
  tellUsMore: {
    fontSize: 32,
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
    textAlign: "center",
  },
  info: {
    overflow: "hidden",
    gap: 20,
    alignSelf: "stretch",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "100%",
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    width: "100%",
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
    fontFamily: 'Roboto',
    fontWeight: '400',
    backgroundColor: '#fff',
  },
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  bioSection: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Raleway-Bold",
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  profilePictureContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ed469a",
    borderStyle: "dashed",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  buttonFinish: {
    backgroundColor: "#ed469a",
    width: "75%",
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  backButton: {
    backgroundColor: "#FFB6C1",
    width: "20%",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default About4;
