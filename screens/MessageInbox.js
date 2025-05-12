import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../firebaseConfig";

const MessageInbox = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid } = route.params;

  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchOrCreateConnections = async () => {
      const connectionsRef = collection(db, "Connections");

      // Find all connections that involve the current user
      const q = query(connectionsRef, where("userIds", "array-contains", uid));
      const querySnapshot = await getDocs(q);

      // If none exist, create a test connection (useful for first time testing)
      if (querySnapshot.empty) {
        console.log("No connections found. Creating a test connection...");
        const dummyUserId = "test_user_2";
        const dummyUserName = "Test User 2";

        await addDoc(connectionsRef, {
          userIds: [uid, dummyUserId],
          userNames: {
            [uid]: "You",
            [dummyUserId]: dummyUserName,
          },
          createdAt: new Date(),
        });

        // Fetch again after adding dummy connection
        return fetchOrCreateConnections();
      }

      // Format data to display connected users
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const otherUserId = data.userIds.find((id) => id !== uid);
        users.push({
          id: otherUserId,
          name: data.userNames?.[otherUserId] || "User",
        });
      });

      setConnections(users);
    };

    fetchOrCreateConnections();
  }, []);

  const handleOpenChat = (otherUserId, otherUserName) => {
    navigation.navigate("DirectMessage", {
      currentUserId: uid,
      otherUserId,
      otherUserName,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connected Users</Text>
      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleOpenChat(item.id, item.name)}
          >
            <Text style={styles.userName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  userName: {
    fontSize: 18,
  },
});

export default MessageInbox;
