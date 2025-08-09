import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../firebaseConfig";
import Navbar from "../components/Navbar"; // ⬅️ show the bottom bar

const PINK = "#ed469a";
const PINK_LIGHT = "#ffe4f0";
const GRAY_TEXT = "#6b7280";
const PAGE_BG = "#f6f7fb";
const BORDER = "#e8e8ef";

const MessageInbox = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid } = route.params ?? {};

  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchOrCreateConnections = async () => {
      if (!uid) return;
      const connectionsRef = collection(db, "Connections");
      const q1 = query(connectionsRef, where("userIds", "array-contains", uid));
      const snap = await getDocs(q1);

      if (snap.empty) {
        // seed one so screen isn’t blank the first time
        const dummyUserId = "test_user_2";
        const dummyUserName = "Test User 2";
        await addDoc(connectionsRef, {
          userIds: [uid, dummyUserId],
          userNames: { [uid]: "You", [dummyUserId]: dummyUserName },
          createdAt: new Date(),
        });
        return fetchOrCreateConnections();
      }

      const users = [];
      snap.forEach((d) => {
        const data = d.data();
        const otherUserId = data.userIds.find((id) => id !== uid);
        users.push({
          id: otherUserId,
          name: data.userNames?.[otherUserId] || "User",
          lastMessage: "Say hi 👋", // placeholder (kept as requested)
          unreadCount: 0,
        });
      });
      setConnections(users);
    };

    fetchOrCreateConnections();
  }, [uid]);

  const visible = useMemo(() => {
    let rows = connections;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    return rows;
  }, [connections, search, activeFilter]);

  const handleOpenChat = (otherUserId, otherUserName) => {
    navigation.navigate("DirectMessage", {
      currentUserId: uid,
      otherUserId,
      otherUserName,
    });
  };

  const initials = (name) =>
    name
      .split(" ")
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?";

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => handleOpenChat(item.id, item.name)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(item.name)}</Text>
        <View style={styles.statusDot} />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.row}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.timeText}>{""}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.preview} numberOfLines={1}>
            {item.lastMessage || "Start a conversation"}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Pressable style={styles.headerBtn} onPress={() => {}}>
          <Icon name="magnify" size={22} color={PINK} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Icon name="magnify" size={20} color={GRAY_TEXT} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor="#9aa0a6"
          style={styles.searchInput}
        />
        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Icon name="close-circle" size={18} color="#c7c9d1" />
          </Pressable>
        ) : null}
      </View>

      {/* Filter pills (visual only for now) */}
      <View style={styles.pills}>
        {["All", "Personal", "Work", "Groups"].map((p) => (
          <Pressable
            key={p}
            onPress={() => setActiveFilter(p)}
            style={[styles.pill, activeFilter === p && styles.pillActive]}
          >
            <Text style={[styles.pillText, activeFilter === p && styles.pillTextActive]}>
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }} // space for navbar
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: GRAY_TEXT }}>No conversations yet</Text>
          </View>
        }
      />

      {/* Floating compose */}
      <Pressable style={styles.fab} onPress={() => { /* open “new chat” later */ }}>
        <Icon name="message-plus" size={26} color="#fff" />
      </Pressable>

      {/* Bottom navbar */}
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: PAGE_BG },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerBtn: {
    width: 36,
    height: 36,
    backgroundColor: PINK_LIGHT,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  searchBar: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: "#111827" },

  pills: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pillActive: { backgroundColor: PINK_LIGHT, borderColor: PINK },
  pillText: { fontSize: 13, color: "#111827" },
  pillTextActive: { color: PINK, fontWeight: "700" },

  chatCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  avatarText: { fontWeight: "700", color: PINK },
  statusDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },

  chatContent: { flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatName: { fontSize: 16, fontWeight: "700", color: "#111827", maxWidth: "75%" },
  timeText: { fontSize: 12, color: GRAY_TEXT },
  preview: { color: GRAY_TEXT, marginTop: 2, fontSize: 14, flexShrink: 1, marginRight: 8 },

  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PINK,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: PINK,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
});

export default MessageInbox;
