import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../firebaseConfig";
import Navbar from "../components/Navbar";

const PINK = "#ed469a";
const BORDER = "#e5e7eb";
const GRAY = "#6b7280";
const BG = "#f6f7fb";

export default function ThreadDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { threadId, title, uid, type } = route.params;

  const [posts, setPosts] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  // selected image for this reply
  const [imageUri, setImageUri] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: title || "Thread" });
  }, [title]);

  // Load posts
  useEffect(() => {
    const qPosts = query(
      collection(db, "posts"),
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    });
    return () => unsub();
  }, [threadId]);

  const timeAgo = (ts) => {
    const d = ts?.toDate?.() || new Date(ts);
    const diff = (Date.now() - d.getTime()) / 1000; // seconds
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos to share images.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (!res.canceled && res.assets?.length) {
      setImageUri(res.assets[0].uri);
    }
  };

  const uploadImageIfAny = async () => {
    if (!imageUri) return null;
    // turn the local file into a blob
    const resp = await fetch(imageUri);
    const blob = await resp.blob();
    const key = `threads/${threadId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const storageRef = ref(storage, key);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text && !imageUri) return;
    setSending(true);
    try {
      const imageUrl = await uploadImageIfAny();

      await addDoc(collection(db, "posts"), {
        threadId,
        text: text || "",
        imageUrl: imageUrl || null,
        createdBy: uid,
        creatorName: "You", // replace with profile name if you have it
        createdAt: serverTimestamp(),
      });

      // bump thread
      await updateDoc(doc(db, "threads", threadId), { lastPostAt: serverTimestamp() });

      setReply("");
      setImageUri(null);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    } catch (e) {
      console.error(e);
      Alert.alert("Post failed", "Could not send your reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{item.creatorName || "User"}</Text>
        <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
      </View>

      {item.text ? <Text style={styles.postText}>{item.text}</Text> : null}

      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );

  const listEmpty = (
    <View style={{ paddingTop: 32, alignItems: "center" }}>
      <Text style={{ color: GRAY }}>No replies yet. Be the first to post!</Text>
    </View>
  );

  return (
    <View style={styles.page}>
      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
      />

      {/* Composer */}
      <View style={styles.composerWrap}>
        {imageUri ? (
          <View style={styles.previewRow}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.clearPreview}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>×</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
            <Text style={styles.iconText}>🖼️</Text>
          </TouchableOpacity>

          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder="Write a reply…"
            placeholderTextColor="#9aa0a6"
            style={styles.input}
            multiline
          />

          <TouchableOpacity
            onPress={sendReply}
            disabled={sending || (!reply.trim() && !imageUri)}
            style={[styles.postBtn, (sending || (!reply.trim() && !imageUri)) && { opacity: 0.6 }]}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },

  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  postAuthor: { fontWeight: "700", color: "#111827" },
  postTime: { color: GRAY, fontSize: 12 },
  postText: { color: "#111827", fontSize: 15, lineHeight: 20, marginTop: 2 },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#fafafa",
  },

  composerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 68, // keep above navbar
    paddingHorizontal: 12,
  },
  previewRow: {
    alignSelf: "flex-start",
    marginBottom: 6,
    position: "relative",
  },
  preview: { width: 90, height: 90, borderRadius: 10, backgroundColor: "#eee" },
  clearPreview: {
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

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 18 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
  },
  postBtn: {
    backgroundColor: PINK,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
