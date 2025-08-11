// screens/DirectMessage.js
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
import { db, storage } from "../firebaseConfig";

const PINK_BUBBLE = "#FFB6C1";
const PINK_PRIMARY = "#ED469A";
const LIGHT_GRAY = "#f0f0f0";
const GRAY = "#999";
const TIMESTAMP_GAP_MINUTES = 5;

export default function DirectMessage({ route }) {
  const { currentUserId, otherUserId, otherUserName } = route.params;
  const [items, setItems] = useState([]); // interleaved time markers + messages
  const [newMessage, setNewMessage] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [sending, setSending] = useState(false);

  const chatId = [currentUserId, otherUserId].sort().join("_");
  const navigation = useNavigation();
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: otherUserName });
  }, [navigation, otherUserName]);

  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const raw = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(buildInterleavedList(raw));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    });

    return () => unsubscribe();
  }, []);

  // ---------- helpers ----------
  const toDate = (ts) => (ts?.toDate?.() ? ts.toDate() : new Date(ts));
  const minutesBetween = (a, b) => Math.abs((b - a) / (1000 * 60));

  // "27 JUL AT 8:00 PM"
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

  // Build array with time markers + messages
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

  // ---------- image picking (tap = gallery, long-press = camera) ----------
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
        // Back-compat
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

  const uploadImageIfAny = async () => {
    if (!imageUri) return null;
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const path = `dm/${chatId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  // ---------- send ----------
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text && !imageUri) return;

    setSending(true);
    try {
      const imageUrl = await uploadImageIfAny();
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: currentUserId,
        text: text || "",
        imageUrl: imageUrl || null,
        timestamp: new Date(),
      });
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

  const data = useMemo(() => items, [items]);
  const canSend = !sending && (newMessage.trim().length > 0 || !!imageUri);

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
  listContent: { padding: 12, paddingBottom: 130 },

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
