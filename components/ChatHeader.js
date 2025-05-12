import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";

const ChatHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            style={styles.icon}
            contentFit="cover"
            source={require("../assets/arrow.png")}
          />
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.userName}>Amanda Thompson</Text>
          <Text style={styles.userRole}>Business Services</Text>
        </View>
        <Pressable
          style={styles.profileButton}
          onPress={() => navigation.navigate("MENTORPROFILE")}
        >
          <Image
            style={styles.profileIcon}
            contentFit="cover"
            source={require("../assets/frame-139.png")}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    shadowOpacity: 1,
    alignSelf: "stretch",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 25,
    height: 25,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Raleway-Bold",
    textAlign: "center",
    color: "#000",
  },
  userRole: {
    fontSize: 14,
    fontFamily: "Raleway-Regular",
    textAlign: "center",
    color: "#000",
  },
  profileButton: {
    width: 50,
    height: 50,
  },
  profileIcon: {
    borderRadius: 25,
    width: "100%",
    height: "100%",
  },
  icon: {
    width: "100%",
    height: "100%",
  },
});

export default ChatHeader;
