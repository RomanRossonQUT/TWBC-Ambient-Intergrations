import * as React from "react";
import { TextInput, StyleSheet } from "react-native";

const Message = () => {
  return (
    <TextInput
      style={styles.input}
      placeholder="Send a Message"
      placeholderTextColor="#9e9fa0"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderColor: "#ececec",
    borderWidth: 2,
    overflow: "hidden",
    flexDirection: "row",
    paddingHorizontal: 30,
    paddingVertical: 18,
    fontFamily: "Roboto-Regular",
    fontSize: 12,
  },
});

export default Message;
