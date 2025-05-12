import React, { useEffect, useState } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet } from "react-native";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const DirectMessage = ({ route }) => {
  const { currentUserId, otherUserId, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const chatId = [currentUserId, otherUserId].sort().join("_");

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with {otherUserName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={item.senderId === currentUserId ? styles.myMessage : styles.theirMessage}>
            {item.text}
          </Text>
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
        <Button title="Send" onPress={handleSend} />
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
  myMessage: { alignSelf: "flex-end", backgroundColor: "#dcf8c6", padding: 10, borderRadius: 10, marginBottom: 5 },
  theirMessage: { alignSelf: "flex-start", backgroundColor: "#eee", padding: 10, borderRadius: 10, marginBottom: 5 }
});

export default DirectMessage;