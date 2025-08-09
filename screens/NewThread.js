// screens/NewThread.js
import React, { useMemo, useState } from "react";
import { View, TextInput, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Navbar from "../components/Navbar";

const CATEGORY_VIS = {
  "official.announcements": "public",
  "official.mentor-resources": "mentor",
  "official.mentee-resources": "mentee",
  "official.events": "public",
  "official.feedback": "public",
  "community.general": "public",
  "community.experiences": "public",
  "community.help": "public",
  "community.study": "public",
  "community.careers": "public",
  "community.showcase": "public",
};
const canPost = (userType, vis) =>
  vis === "public" || (vis === "mentor" && userType === "Mentor") || (vis === "mentee" && userType === "Mentee");

export default function NewThread() {
  const route = useRoute();
  const navigation = useNavigation();
  const { uid, type, categoryId, categoryName } = route.params;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const allowed = useMemo(() => canPost(type, CATEGORY_VIS[categoryId]), [type, categoryId]);

  const createThread = async () => {
    if (!allowed) {
      Alert.alert("Not allowed", "You don’t have permission to post in this category.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      Alert.alert("Missing info", "Please enter a title and a message.");
      return;
    }

    // Create thread
    const now = serverTimestamp();
    const threadRef = await addDoc(collection(db, "threads"), {
      categoryId,
      title: title.trim(),
      createdBy: uid,
      creatorName: "You", // or pull from profile
      createdAt: now,
      lastPostAt: now,
    });

    // Add initial post
    await addDoc(collection(db, "posts"), {
      threadId: threadRef.id,
      text: body.trim(),
      createdBy: uid,
      creatorName: "You",
      createdAt: now,
    });

    navigation.replace("ThreadDetail", { threadId: threadRef.id, title: title.trim(), uid, type });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 96 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>{categoryName}</Text>
        <TextInput
          placeholder="Thread title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Write the first post…"
          value={body}
          onChangeText={setBody}
          style={[styles.input, { height: 160, textAlignVertical: "top" }]}
          multiline
        />
        <Pressable style={[styles.btn, !allowed && { opacity: 0.5 }]} onPress={createThread} disabled={!allowed}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Create</Text>
        </Pressable>
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#e5e7eb",
    borderRadius: 12, padding: 12,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#ed469a",
    paddingVertical: 12, borderRadius: 12,
    alignItems: "center",
  },
});
