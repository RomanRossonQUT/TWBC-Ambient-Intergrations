// -----------------------------------------------------------------------------
// Purpose: Landing screen for forums.
// Features:
// - Displays available "spaces" (e.g., Official, Community).
// - Filters categories by user type (Mentor, Mentee, Public).
// - Navigates into category thread lists.
// -----------------------------------------------------------------------------
import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Navbar from "../../components/Navbar";

const PINK = "#ed469a";
const BORDER = "#e5e7eb";

//  Spaces and their categories
const SPACES = [
  {
    id: "official",
    name: "TWBC Official",
    categories: [
      { id: "official.announcements", name: "Announcements", visibility: "public" },
      { id: "official.mentor-resources", name: "Mentor Resources", visibility: "mentor" },
      { id: "official.mentee-resources", name: "Mentee Resources", visibility: "mentee" },
      { id: "official.events", name: "Events & Opportunities", visibility: "public" },
      { id: "official.feedback", name: "TWBC Feedback", visibility: "public" },
    ],
  },
  {
    id: "community",
    name: "Community",
    categories: [
      { id: "community.general", name: "General Discussion", visibility: "public" },
      { id: "community.experiences", name: "Mentorship Experiences", visibility: "public" },
      { id: "community.help", name: "Help & Advice", visibility: "public" },
      { id: "community.study", name: "Study Groups", visibility: "public" },
      { id: "community.careers", name: "Career & Opportunities", visibility: "public" },
      { id: "community.showcase", name: "Projects & Showcases", visibility: "public" },
    ],
  },
];

// Determine if a category is visible to the user based on their type
const canSee = (userType, vis) =>
  vis === "public" || (vis === "mentor" && userType === "Mentor") || (vis === "mentee" && userType === "Mentee");

export default function ForumsHome() {
  const navigation = useNavigation();
  const route = useRoute();
  const { uid, pid, type } = route.params ?? {};

  // Filter spaces and categories based on user type
  const visibleSpaces = useMemo(() => {
    return SPACES.map((s) => ({
      ...s,
      categories: s.categories.filter((c) => canSee(type, c.visibility)),
    })).filter((s) => s.categories.length > 0);
  }, [type]);

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
        <Text style={styles.title}>Forums</Text>

        {visibleSpaces.map((space) => (
          <View key={space.id} style={styles.spaceCard}>
            <Text style={styles.spaceTitle}>{space.name}</Text>

            <View style={styles.grid}>
              {space.categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    navigation.navigate("ThreadList", {
                      uid, pid, type,
                      categoryId: cat.id,
                      categoryName: cat.name,
                    })
                  }
                  style={styles.catItem}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catMeta}>
                    {cat.visibility === "public" ? "Everyone" : cat.visibility === "mentor" ? "Mentors only" : "Mentees only"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Navbar />
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  spaceCard: {
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 16, marginBottom: 16, padding: 12,
  },
  spaceTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: PINK },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
  },
  catName: { fontSize: 15, fontWeight: "600" },
  catMeta: { color: "#6b7280", marginTop: 4, fontSize: 12 },
});
