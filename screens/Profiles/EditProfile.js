// -----------------------------------------------------------------------------
// Purpose: Edit an existing profile document (mentor/mentee) in Firestore.
// Notes:
// - Loads the profile by `pid` and populates a local form state.
// - Fetches all SkillTags and InterestTags to allow multi-select chips.
// - Saves updates back to the "Profiles" collection and navigates to
//   "UserProfile" on success.
// - Preserves current behavior: numeric tag IDs, simple toggling logic.
// -----------------------------------------------------------------------------
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import AdaptiveTextInput from "../../components/AdaptiveTextInput";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

const EditProfile = ({ route }) => {
  const navigation = useNavigation();
  const { uid, pid, type } = route.params;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    pronouns: "",
    currentRole: "",
    currentIndustry: "",
    bio: "",
    skills: [],
    interests: [],
    profileImageUrl: "",
  });

  const [allSkills, setAllSkills] = useState([]);
  const [allInterests, setAllInterests] = useState([]);

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
        setFormData(prev => ({ ...prev, profileImageUrl: result.assets[0].uri }));
        console.log("[DATA] Profile image selected:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("[ERROR] Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, "Profiles", pid.toString());
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            pronouns: data.pronouns || "",
            currentRole: data.currentRole || "",
            currentIndustry: data.currentIndustry || "",
            bio: data.bio || "",
            skills: data.skills || [],
            interests: data.interests || [],
            profileImageUrl: data.profileImageUrl || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile: ", error);
      }
    };

    const fetchTags = async () => {
      try {
        // Fetch all skills
        const skillsSnap = await getDocs(collection(db, "SkillTags"));
        const skillsList = skillsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllSkills(skillsList);

        // Fetch all interests
        const interestsSnap = await getDocs(collection(db, "InterestTags"));
        const interestsList = interestsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllInterests(interestsList);
      } catch (error) {
        console.error("Error fetching tags: ", error);
      }
    };

    fetchProfile();
    fetchTags();
  }, [pid]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleSelection = (field, id) => {
    setFormData(prev => {
      const updated = prev[field].includes(Number(id))
        ? prev[field].filter(item => item !== Number(id))
        : [...prev[field], Number(id)];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = async () => {
    try {
      const profileRef = doc(db, "Profiles", pid.toString());
      await updateDoc(profileRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        pronouns: formData.pronouns,
        currentRole: formData.currentRole,
        currentIndustry: formData.currentIndustry,
        bio: formData.bio,
        skills: formData.skills,
        interests: formData.interests,
        profileImageUrl: formData.profileImageUrl,
      });

      navigation.navigate("UserProfile", { uid, pid, type });
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Profile Picture Section */}
      <View style={styles.profilePictureSection}>
        <Text style={styles.subTitle}>Profile Picture</Text>
        <Pressable style={styles.profilePictureContainer} onPress={pickImage}>
          {formData.profileImageUrl ? (
            <Image
              source={{ uri: formData.profileImageUrl }}
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

      <AdaptiveTextInput
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => handleChange("firstName", text)}
      />
      <AdaptiveTextInput
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => handleChange("lastName", text)}
      />
      <AdaptiveTextInput
        placeholder="Pronouns"
        value={formData.pronouns}
        onChangeText={(text) => handleChange("pronouns", text)}
      />
      <AdaptiveTextInput
        placeholder="Current Role"
        value={formData.currentRole}
        onChangeText={(text) => handleChange("currentRole", text)}
      />
      <AdaptiveTextInput
        placeholder="Current Industry"
        value={formData.currentIndustry}
        onChangeText={(text) => handleChange("currentIndustry", text)}
      />
      <Text style={styles.subTitle}>Bio</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        multiline
        placeholder="Tell us about yourself..."
        value={formData.bio}
        onChangeText={(text) => handleChange("bio", text)}
        textAlignVertical="top"
      />

      {/* Interests Section */}
      <Text style={styles.subTitle}>Interests</Text>
      <View style={styles.tagsContainer}>
        {allInterests.map((interest) => (
          <Pressable
            key={interest.id}
            style={[
              styles.tag,
              formData.interests.includes(Number(interest.id)) && styles.tagSelected,
            ]}
            onPress={() => toggleSelection("interests", interest.id)}
          >
            <Text
              style={[
                styles.tagText,
                formData.interests.includes(Number(interest.id)) && styles.tagTextSelected,
              ]}
            >
              {interest.tagName}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Skills Section */}
      <Text style={styles.subTitle}>Skills</Text>
      <View style={styles.tagsContainer}>
        {allSkills.map((skill) => (
          <Pressable
            key={skill.id}
            style={[
              styles.tag,
              formData.skills.includes(Number(skill.id)) && styles.tagSelected,
            ]}
            onPress={() => toggleSelection("skills", skill.id)}
          >
            <Text
              style={[
                styles.tagText,
                formData.skills.includes(Number(skill.id)) && styles.tagTextSelected,
              ]}
            >
              {skill.tagName}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

 
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "stretch",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  multilineInput: {
    height: 100,
    borderRadius: 30,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: '400',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 20,
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
  },
  tagSelected: {
    backgroundColor: "#ed469a",
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
  tagTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#ed469a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditProfile;
