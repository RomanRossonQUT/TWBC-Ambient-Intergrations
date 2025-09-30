// -----------------------------------------------------------------------------
// Purpose: Display a list of discussion threads within a given forum category.
// Features:
// - Real-time subscription to Firestore "threads" collection for the category.
// - Shows thread title, creator, and last post timestamp.
// - Allows navigation into thread details.
// - Provides FAB to start a new thread in the category.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, query, where, orderBy, onSnapshot, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Navbar from "../../components/Navbar";

export default function ThreadList() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid, pid, type, categoryId, categoryName } = route.params;

  const [threads, setThreads] = useState([]);
  const [userNames, setUserNames] = useState({}); // Cache for user names

  // Set the screen title to the category name
  useEffect(() => {
    navigation.setOptions({ title: categoryName });
  }, [categoryName]);

  // Function to fetch user name by user ID
  const fetchUserName = async (userId) => {
    if (userNames[userId]) return userNames[userId]; // Return cached name if available

    try {
      const profileQuery = query(
        collection(db, "Profiles"),
        where("userID", "==", userId)
      );
      const profileSnapshot = await getDocs(profileQuery);
      if (!profileSnapshot.empty) {
        const profileData = profileSnapshot.docs[0].data();
        const userName = `${profileData.firstName} ${profileData.lastName}`;
        setUserNames((prev) => ({ ...prev, [userId]: userName }));
        return userName;
      } else {
        console.warn(`Profile not found for userID: ${userId}`);
      }
    } catch (error) {
      console.error(`Error fetching user name for userID: ${userId}`, error);
    }

    return "Unknown User";
  };

  // Subscribe to threads in the category
  useEffect(() => {
    const q = query(
      collection(db, "threads"),
      where("categoryId", "==", categoryId),
      orderBy("lastPostAt", "desc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const threadsData = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const creatorName = await fetchUserName(data.createdBy);
          return { id: d.id, ...data, creatorName };
        })
      );
      setThreads(threadsData);
    });
    return () => unsub();
  }, [categoryId]);

  const handleDeleteThread = async (threadId) => {
    try {
      await deleteDoc(doc(db, "threads", threadId));
      setThreads((prevThreads) => prevThreads.filter((thread) => thread.id !== threadId));
    } catch (error) {
      console.error(`Error deleting thread with ID: ${threadId}`, error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 24 }}>No threads yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.thread}
            onPress={() =>
              navigation.navigate("ThreadDetail", { uid, pid, type, threadId: item.id, title: item.title })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>by {item.creatorName} • {new Date(item.lastPostAt?.toDate?.() || item.lastPostAt).toLocaleString()}</Text>
            </View>
            {item.createdBy === uid && (
              <Pressable
                style={styles.deleteIcon}
                onPress={() => {
                  Alert.alert(
                    "Delete Thread",
                    "Are you sure you want to delete this thread?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => handleDeleteThread(item.id) },
                    ]
                  );
                }}
              >
                <Text style={{ color: "red" }}>🗑️</Text>
              </Pressable>
            )}
          </Pressable>
        )}
      />

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("NewThread", { uid, pid, type, categoryId, categoryName })}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>New</Text>
      </Pressable>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  thread: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row", // Align content horizontally
    justifyContent: "space-between", // Space between text and bin icon
    alignItems: "center", // Center items vertically
  },
  title: { fontSize: 16, fontWeight: "700" },
  meta: { color: "#6b7280", marginTop: 6, fontSize: 12 },
  deleteIcon: {
    marginLeft: 10, // Add spacing from text
  },
  fab: {
    position: "absolute", right: 16, bottom: 90,
    backgroundColor: "#ed469a", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
  },
});
