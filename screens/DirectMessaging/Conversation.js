// -----------------------------------------------------------------------------
// Purpose: One-to-one direct messaging screen with text + image support.
// Notes:
// - Messages live under Firestore: chats/{chatId}/messages ordered by timestamp.
// - chatId is a deterministic join of the two user IDs (sorted).
// - Real-time updates via onSnapshot; interleaves timestamp markers between msgs.
// - Image sharing supports gallery (tap) and camera (long-press) via Expo ImagePicker.
// - Images are uploaded to Firebase Storage; messages store the download URL.
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import notificationService from "../../services/notificationService";

const PINK_BUBBLE = "#FFB6C1";
const PINK_PRIMARY = "#ED469A";
const LIGHT_GRAY = "#f0f0f0";
const GRAY = "#999";
const TIMESTAMP_GAP_MINUTES = 5;

export default function Conversation({ route }) {
  const { currentUserId, otherUserId, otherUserName } = route.params;
  // Interleaved list of {type: 'time', ...} and {type: 'message', ...}
  const [items, setItems] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [sending, setSending] = useState(false);

  const chatId = [currentUserId, otherUserId].sort().join("_");
  const navigation = useNavigation();
  const listRef = useRef(null);

  // Live subscription to messages (kept with empty deps to preserve behavior)
  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const raw = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(buildInterleavedList(raw));
      // Auto-scroll to bottom on new messages
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    });

    return () => unsubscribe();
  }, []);

  // Convert Firestore Timestamp | Date | number -> Date
  const toDate = (ts) => (ts?.toDate?.() ? ts.toDate() : new Date(ts));
  // Minutes difference between two Date objects
  const minutesBetween = (a, b) => Math.abs((b - a) / (1000 * 60));

  // Format: "27 JUL AT 8:00 PM"
  const formatMessengerStamp = (ts) => {
    const d = toDate(ts);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const time = d.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month} AT ${time.toUpperCase()}`;
  };

  // Produce an array of time markers + messages based on inactivity gaps
  const buildInterleavedList = (messages) => {
    const out = [];
    let lastTs = null;
    messages.forEach((m) => {
      const d = toDate(m.timestamp);
      if (!lastTs || minutesBetween(lastTs, d) >= TIMESTAMP_GAP_MINUTES) {
        out.push({ id: `tm-${m.id}`, type: "time", label: formatMessengerStamp(m.timestamp) });
      }
      out.push({ ...m, type: "message" });
      lastTs = d;
    });
    return out;
  };

  // Image picking (tap = gallery, long-press = camera)
  const pickImage = async () => {
    try {
      // Permissions
      let perm = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      if (!perm.granted) {
        Alert.alert("Permission needed", "We need access to your photos to share images.");
        return;
      }

      // Build mediaTypes for SDK 51+ (ImagePicker.MediaType) and older (MediaTypeOptions)
      let mediaTypesOpt = {};
      if (ImagePicker.MediaType) {
        // New API
        // Some environments accept enum directly, others prefer array form — handle both
        mediaTypesOpt =
          Array.isArray?.(ImagePicker.MediaType)
            ? { mediaTypes: [ImagePicker.MediaType.Image] }
            : { mediaTypes: ImagePicker.MediaType.Image };
      } else if (ImagePicker.MediaTypeOptions) {
        // Legacy API currently not working
        mediaTypesOpt = { mediaTypes: ImagePicker.MediaTypeOptions.Images };
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        ...mediaTypesOpt,
        allowsMultipleSelection: false,
        quality: 0.85,
        exif: false,
        base64: false,
      });

      if (res?.canceled) return;

      const asset = res.assets?.[0];
      const uri = asset?.uri || res.uri;
      if (uri) setImageUri(uri);
    } catch (e) {
      console.warn("Image picker failed:", e);
      Alert.alert("Couldn't open photos", "Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      let perm = await ImagePicker.getCameraPermissionsAsync();
      if (!perm.granted) {
        perm = await ImagePicker.requestCameraPermissionsAsync();
      }
      if (!perm.granted) {
        Alert.alert("Permission needed", "We need camera access to take a photo.");
        return;
      }
      const r = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        base64: false,
      });
      if (!r.canceled && r.assets?.[0]?.uri) {
        setImageUri(r.assets[0].uri);
      }
    } catch (e) {
      console.warn("Camera failed:", e);
      Alert.alert("Couldn't open camera", "Please try again.");
    }
  };

  // Upload the selected image (if any) to Cloudinary and return its URL
  const uploadImageToCloudinary = async () => {
    if (!imageUri) return null;

    try {
      // For React Native, we need to use a different approach
      const formData = new FormData();
      
      // Create a file object for React Native
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "image.jpg",
      });
      
      // Use unsigned upload preset
      formData.append("upload_preset", "uploads");

      const res = await fetch("https://api.cloudinary.com/v1_1/de5xybldg/image/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[ERROR] Cloudinary upload error response:", errorData);
        Alert.alert("Upload failed", "Could not upload the image. Please try again.");
        return null;
      }

      const data = await res.json();
      console.log("[SUCCESS] Image uploaded to Cloudinary:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("[ERROR] Error uploading image to Cloudinary:", error);
      Alert.alert("Upload failed", "Could not upload the image. Please try again.");
      return null;
    }
  };

  // Send message (text + optional image)
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text && !imageUri) return;

    setSending(true);
    try {
      const imageUrl = await uploadImageToCloudinary();
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: currentUserId,
        text: text || "",
        imageUrl: imageUrl || null,
        timestamp: new Date(),
      });
      
      // Send push notification to the other user
      try {
        // Get the other user's push token (you'd need to store this in your user profile)
        // For now, we'll send a local notification as a fallback
        const notificationTitle = otherUserName;
        const notificationBody = text || "Image shared";
        
        // Send local notification (works when app is in background)
        await notificationService.sendLocalNotification(
          notificationTitle,
          notificationBody,
          {
            type: 'message',
            conversationId: chatId,
            senderId: currentUserId,
            senderName: otherUserName
          }
        );
        
        // TODO: Send push notification to other user's device
        // This would require storing push tokens in user profiles
        // await notificationService.sendPushNotification(
        //   otherUserPushToken,
        //   notificationTitle,
        //   notificationBody,
        //   { type: 'message', conversationId: chatId }
        // );
      } catch (notificationError) {
        console.log('Notification error:', notificationError);
        // Don't fail the message send if notification fails
      }
      
      setNewMessage("");
      setImageUri(null);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (e) {
      console.error(e);
      Alert.alert("Send failed", "Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Derived flags/data
  const data = useMemo(() => items, [items]);
  const canSend = !sending && (newMessage.trim().length > 0 || !!imageUri);

  // Row renderer
  const renderItem = ({ item }) => {
    if (item.type === "time") {
      return (
        <View style={styles.timeMarkerWrap}>
          <Text style={styles.timeMarkerText}>{item.label}</Text>
        </View>
      );
    }
    const isMe = item.senderId === currentUserId;
    return (
      <View style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          {item.text ? <Text style={styles.msgText}>{item.text}</Text> : null}
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.msgImage} resizeMode="cover" />
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      {/* composer */}
      <View style={styles.inputBar}>
        {/* image preview chip */}
        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.previewImg} />
            <TouchableOpacity style={styles.previewClose} onPress={() => setImageUri(null)}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>×</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.rowComposer}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={pickImage}
            onLongPress={takePhoto}
            delayLongPress={250}
          >
            <Text style={{ fontSize: 18 }}>🖼️</Text>
          </TouchableOpacity>

          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message"
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, !canSend && { opacity: 0.6 }]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Text style={styles.sendLabel}>{sending ? "Sending…" : "Send"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#ed469a',
    fontFamily: 'Raleway-Regular',
    fontWeight: '900',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  headerSpacer: {
    width: 44, // Same width as back button to center title
  },
  listContent: { padding: 12, paddingBottom: 150 },

  timeMarkerWrap: {
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 6,
    borderRadius: 8,
  },
  timeMarkerText: { fontSize: 11, letterSpacing: 0.3, color: GRAY },

  row: { width: "100%", marginBottom: 6 },
  rowLeft: { alignItems: "flex-start" },
  rowRight: { alignItems: "flex-end" },

  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  myBubble: { backgroundColor: PINK_BUBBLE, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: LIGHT_GRAY, borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, color: "#111" },
  msgImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: "#eee",
  },

  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 8,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  previewWrap: { alignSelf: "flex-start", marginLeft: 8, marginBottom: 6, position: "relative" },
  previewImg: { width: 80, height: 80, borderRadius: 10, backgroundColor: "#eee" },
  previewClose: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0008",
    alignItems: "center",
    justifyContent: "center",
  },

  rowComposer: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  iconBtn: {
    width: 40, height: 44, borderRadius: 12,
    borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 44, maxHeight: 120,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff",
  },
  sendBtn: {
    backgroundColor: PINK_PRIMARY,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  sendLabel: { color: "#fff", fontWeight: "700" },
});
