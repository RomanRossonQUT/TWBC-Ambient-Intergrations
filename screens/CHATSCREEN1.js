import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import ChatHeader from "../components/ChatHeader";
import Message from "../components/Message";

const CHATSCREEN1 = () => {
  return (
    <View style={styles.chatScreen}>
      <ChatHeader />
      <View style={styles.input}>
        <Message />
        <Image
          style={styles.inputChild}
          contentFit="cover"
          source={require("../assets/frame-27.png")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputChild: {
    alignSelf: "stretch",
    maxHeight: "100%",
    width: 37,
    overflow: "hidden",
  },
  input: {
    position: "absolute",
    bottom: 0,
    left: 0,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 8,
    elevation: 8,
    shadowOpacity: 1,
    backgroundColor: "#fff",
    width: 390,
    height: 95,
    flexDirection: "row",
    paddingHorizontal: 30,
    paddingVertical: 20,
    gap: 25,
    zIndex: 1,
  },
  chatScreen: {
    backgroundColor: "#fafafa",
    flex: 1,
    width: "100%",
    height: 844,
    alignItems: "center",
  },
});

export default CHATSCREEN1;
