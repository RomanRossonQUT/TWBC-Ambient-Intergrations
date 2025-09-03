// -----------------------------------------------------------------------------
// Purpose: Display a list of discussion threads within a given forum category.
// Features:
// - Real-time subscription to Firestore "threads" collection for the category.
// - Shows thread title, creator, and last post timestamp.
// - Allows navigation into thread details.
// - Provides FAB to start a new thread in the category.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Navbar from "../../components/Navbar";

export default function ThreadList() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid, pid, type, categoryId, categoryName } = route.params;

  const [threads, setThreads] = useState([]);

  // Set the screen title to the category name
  useEffect(() => {
    navigation.setOptions({ title: categoryName });
  }, [categoryName]);

  // Subscribe to threads in the category
  useEffect(() => {
    const q = query(
      collection(db, "threads"),
      where("categoryId", "==", categoryId),
      orderBy("lastPostAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setThreads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [categoryId]);

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
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>by {item.creatorName || "user"} • {new Date(item.lastPostAt?.toDate?.() || item.lastPostAt).toLocaleString()}</Text>
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
  },
  title: { fontSize: 16, fontWeight: "700" },
  meta: { color: "#6b7280", marginTop: 6, fontSize: 12 },
  fab: {
    position: "absolute", right: 16, bottom: 90,
    backgroundColor: "#ed469a", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
  },
});
