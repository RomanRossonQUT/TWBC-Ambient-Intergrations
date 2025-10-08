// -----------------------------------------------------------------------------
// Purpose: List the user's connections and open direct message threads.
// Notes:
// - Uses Firestore "Connections" collection to find users connected to `uid`.
// - Real-time updates via onSnapshot; derives connected users list.
// - Search bar filters by name; simple (non-functional) filter pills are kept.
// - Navigates to "Conversation" on tap, and "DiscoverConnections" to find more.
// -----------------------------------------------------------------------------
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
import AdaptiveTextInput from "../../components/AdaptiveTextInput";
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db } from "../../firebaseConfig";
import Navbar from "../../components/Navbar";

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
    if (!uid) return;

    // Create a query for connections involving this user
    const connQuery = query(
      collection(db, "Connections"),
      where("userIds", "array-contains", uid)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(connQuery, async (connSnapshot) => {
      if (connSnapshot.empty) {
        setConnections([]);
        return;
      }

      const connectedUserIds = [];
      const connectedUserNames = {};

      connSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const otherId = data.userIds.find((id) => id !== uid);
        if (otherId) {
          connectedUserIds.push(otherId);
          connectedUserNames[otherId] = data.userNames?.[otherId] || "";
        }
      });

      // Get user profiles for connected users
      const usersSnapshot = await getDocs(collection(db, "Users"));
      const allUsers = usersSnapshot.docs.map((u) => ({
        id: u.id,
        ...u.data(),
      }));

      // Get recent messages for each connection
      const connectedUsers = await Promise.all(
        allUsers
          .filter((u) => connectedUserIds.includes(u.id))
          .map(async (u) => {
            // Get the most recent message between these two users
            const chatId = [uid, u.id].sort().join('_');
            const messagesQuery = query(
              collection(db, "chats", chatId, "messages"),
              orderBy("timestamp", "desc"),
              limit(1)
            );
            
            let lastMessage = "Start a conversation";
            let unreadCount = 0;
            
            try {
              const messagesSnapshot = await getDocs(messagesQuery);
              if (!messagesSnapshot.empty) {
                const lastMsg = messagesSnapshot.docs[0].data();
                lastMessage = lastMsg.text || "Image shared";
                
                // Count unread messages (messages not from current user)
                const unreadQuery = query(
                  collection(db, "chats", chatId, "messages"),
                  where("senderId", "!=", uid),
                  where("timestamp", ">", lastMsg.timestamp || new Date(0))
                );
                const unreadSnapshot = await getDocs(unreadQuery);
                unreadCount = unreadSnapshot.size;
              }
            } catch (error) {
              // No messages found for this chat
            }

            return {
              id: u.id,
              name:
                connectedUserNames[u.id] ||
                `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                "Unknown User",
              lastMessage,
              unreadCount,
            };
          })
      );

      setConnections(connectedUsers);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
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
    navigation.navigate("Conversation", {
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
        <Pressable
          style={styles.headerBtn}
          onPress={() => navigation.navigate("DiscoverConnections", { uid })}
        >
          <Icon name="account-plus" size={22} color={PINK} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="magnify" size={20} color={GRAY_TEXT} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search conversations"
          placeholderTextColor="#9aa0a6"
          style={styles.searchInput}
        />
        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Icon name="close-circle" size={18} color="#c7c9d1" />
          </Pressable>
        ) : null}
      </View>

      {/* Filter Pills */}
      <View style={styles.pills}>
        {["All", "Personal", "Work", "Groups"].map((p) => (
          <Pressable
            key={p}
            onPress={() => setActiveFilter(p)}
            style={[styles.pill, activeFilter === p && styles.pillActive]}
          >
            <Text
              style={[
                styles.pillText,
                activeFilter === p && styles.pillTextActive,
              ]}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Chat List */}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: GRAY_TEXT }}>No conversations yet</Text>
          </View>
        }
      />

      {/* Floating Compose Button */}
      {/* <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("DiscoverConnections", { uid })}
      >
        <Icon name="message-plus" size={26} color="#fff" />
      </Pressable> */}

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: PAGE_BG },
  header: {
    paddingTop: 70,
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
  pills: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    maxWidth: "75%",
  },
  timeText: { fontSize: 12, color: GRAY_TEXT },
  preview: {
    color: GRAY_TEXT,
    marginTop: 2,
    fontSize: 14,
    flexShrink: 1,
    marginRight: 8,
  },
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
