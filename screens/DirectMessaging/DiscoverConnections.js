// -----------------------------------------------------------------------------
// Purpose: Screen to find new users and manage connection requests.
// Features:
// - Displays incoming connection requests with Accept/Decline.
// - Allows searching profiles by name, excluding self & existing connections.
// - Sends new connection requests and shows "Pending" state.
// - Maintains accepted connections list to avoid duplicates.
// -----------------------------------------------------------------------------
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import AdaptiveTextInput from "../../components/AdaptiveTextInput";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PINK = "#ed469a";
const BORDER = "#e8e8ef";
const BG = "#f6f7fb";

const DiscoverConnections = ({ route, navigation }) => {
  const { uid } = route.params; // Current logged-in user's UID

  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    fetchSentRequests();
    fetchIncomingRequests();
    fetchConnections();
  }, [uid]);

  // Fetch requests sent by me
  const fetchSentRequests = async () => {
    const q = query(collection(db, "ConnectionRequests"), where("from", "==", uid));
    const snap = await getDocs(q);
    setSentRequests(snap.docs.map((d) => d.data().to));
  };

  // Fetch requests where I'm the receiver
  const fetchIncomingRequests = async () => {
    const q = query(collection(db, "ConnectionRequests"), where("to", "==", uid));
    const snap = await getDocs(q);

    const requests = await Promise.all(
      snap.docs.map(async (docSnap) => {
        const { from } = docSnap.data();

        // Fetch sender's profile based on correct field "userID"
        const profileQ = query(
          collection(db, "Profiles"),
          where("userID", "==", from)
        );
        const profileSnap = await getDocs(profileQ);

        if (!profileSnap.empty) {
          const profileData = profileSnap.docs[0].data();
          return {
            docId: docSnap.id,
            uid: from,
            fullName: `${profileData.firstName} ${profileData.lastName}`,
            title: `${profileData.profileType || "Member"} – ${profileData.currentRole || "Role"}`,
          };
        }
        return null;
      })
    );

    setIncomingRequests(requests.filter(Boolean));
  };

  // Fetch all my accepted connections so I don't see them in search
  const fetchConnections = async () => {
    const q = query(collection(db, "Connections"), where("userIds", "array-contains", uid));
    const snap = await getDocs(q);

    const connectedIds = [];
    snap.forEach((doc) => {
      const { userIds } = doc.data();
      connectedIds.push(...userIds.filter((id) => id !== uid));
    });
    setConnections(connectedIds);
  };

  // Accept a request -> create Connection + remove request
  const handleAccept = async (senderUid, docId) => {
    // Fetch profiles for display names
    const myProfileSnap = await getDocs(
      query(collection(db, "Profiles"), where("userID", "==", uid))
    );
    const senderProfileSnap = await getDocs(
      query(collection(db, "Profiles"), where("userID", "==", senderUid))
    );

    const myProfile = myProfileSnap.docs[0]?.data();
    const senderProfile = senderProfileSnap.docs[0]?.data();

    // Create connection
    await addDoc(collection(db, "Connections"), {
      userIds: [uid, senderUid],
      userNames: {
        [uid]: `${myProfile.firstName} ${myProfile.lastName}`,
        [senderUid]: `${senderProfile.firstName} ${senderProfile.lastName}`,
      },
      createdAt: new Date(),
    });

    // Delete pending request
    await deleteDoc(doc(db, "ConnectionRequests", docId));

    fetchIncomingRequests();
    fetchConnections();
  };

  // Decline request -> delete pending request
  const handleDecline = async (docId) => {
    await deleteDoc(doc(db, "ConnectionRequests", docId));
    fetchIncomingRequests();
  };

  // Send new connection request
  const handleSendRequest = async (targetUid) => {
    if (targetUid === uid) return; // Prevent sending to self

    await addDoc(collection(db, "ConnectionRequests"), {
      from: uid,
      to: targetUid,
      createdAt: new Date(),
      status: "pending",
    });

    setSentRequests([...sentRequests, targetUid]);
  };

  // Search users by first + last name (excludes self + existing connections)
  const handleSearch = async () => {
    const q = query(collection(db, "Profiles"));
    const snap = await getDocs(q);

    const results = snap.docs
      .map((doc) => doc.data())
      .filter(
        (p) =>
          `${p.firstName} ${p.lastName}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()) &&
          p.userID !== uid && // Exclude self
          !connections.includes(p.userID)
      )
      .map((p) => ({
        uid: p.userID,
        fullName: `${p.firstName} ${p.lastName}`,
        title: `${p.profileType || "Member"} – ${p.currentRole || "Role"}`,
      }));

    setProfiles(results);
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Discover & Connect</Text>

      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subTitle}>Incoming Requests</Text>
          {incomingRequests.map((r) => (
            <View key={r.uid} style={styles.card}>
              <View>
                <Text style={styles.name}>{r.fullName}</Text>
                <Text style={styles.subtitle}>{r.title}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.accept]}
                  onPress={() => handleAccept(r.uid, r.docId)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.decline]}
                  onPress={() => handleDecline(r.docId)}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name..."
          style={styles.searchInput}
        />
        <Pressable onPress={handleSearch}>
          <Icon name="magnify" size={22} color={PINK} />
        </Pressable>
      </View>

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.subtitle}>{item.title}</Text>
            </View>
            <View>
              {sentRequests.includes(item.uid) ? (
                <Text style={styles.pending}>Pending</Text>
              ) : (
                <Pressable
                  style={[styles.button, styles.send]}
                  onPress={() => handleSendRequest(item.uid)}
                >
                  <Text style={styles.buttonText}>Connect</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noResults}>Search for someone to connect</Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Return</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: BG },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#111",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  section: { marginBottom: 20 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 16, marginRight: 8 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#666" },
  actions: { flexDirection: "row", gap: 8, marginTop: 6 },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  accept: { backgroundColor: "#10b981" },
  decline: { backgroundColor: "#ef4444" },
  send: { backgroundColor: PINK },
  pending: {
    fontStyle: "italic",
    color: "#888",
    fontWeight: "500",
  },
  noResults: {
    paddingTop: 30,
    textAlign: "center",
    color: "#aaa",
  },
  backButton: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: PINK,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default DiscoverConnections;
