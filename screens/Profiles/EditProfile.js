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
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";

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
  });

  const [allSkills, setAllSkills] = useState([]);
  const [allInterests, setAllInterests] = useState([]);

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
      });

      navigation.navigate("UserProfile", { uid, pid, type });
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => handleChange("firstName", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => handleChange("lastName", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Pronouns"
        value={formData.pronouns}
        onChangeText={(text) => handleChange("pronouns", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Current Role"
        value={formData.currentRole}
        onChangeText={(text) => handleChange("currentRole", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Current Industry"
        value={formData.currentIndustry}
        onChangeText={(text) => handleChange("currentIndustry", text)}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="Bio"
        value={formData.bio}
        onChangeText={(text) => handleChange("bio", text)}
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

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </Pressable>
    </ScrollView>
  );
};

 
const styles = StyleSheet.create({
  container: {
    padding: 20,
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
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
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
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditProfile;
