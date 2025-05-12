import React, { useEffect, useState } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const DirectMessage = ({ route }) => {
  const { currentUserId, otherUserId, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const chatId = [currentUserId, otherUserId].sort().join("_");

  const navigation = useNavigation();

  useEffect(() => {
  navigation.setOptions({ title: `Chat with ${otherUserName}` });
}, [navigation, otherUserName]);

  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (newMessage.trim().length === 0) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: currentUserId,
      text: newMessage,
      timestamp: new Date(),
    });

    setNewMessage("");
  };

  const formatTimestamp = (timestamp) => {
  const date = timestamp?.toDate?.() || new Date(timestamp); // Support Firestore or Date object
  return date.toLocaleString("en-US", {
    weekday: "short", // TUE
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}></Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.timestampText}>{formatTimestamp(item.timestamp)}</Text>
            <Text style={item.senderId === currentUserId ? styles.myMessage : styles.theirMessage}>
              {item.text}
            </Text>
          </View>

        )}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  messageList: { flex: 1, marginBottom: 10 },
  inputContainer: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, borderColor: "#ccc", borderWidth: 1, borderRadius: 5, padding: 8, marginRight: 10 },
  myMessage: { alignSelf: "flex-end", backgroundColor: "#FFB6C1", padding: 10, borderRadius: 10, marginBottom: 5 },
  theirMessage: { alignSelf: "flex-start", backgroundColor: "#eee", padding: 10, borderRadius: 10, marginBottom: 5 },
  sendButton: {
    backgroundColor: '#ED469A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageContainer: {
    marginBottom: 10,
  },
  timestampText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
    textAlign: "center",
  },

});

export default DirectMessage;