import * as React from "react";

const INPUT1 = () => {
  return (
    <View style={styles.input}>
      <Text style={styles.sendAMessage}>Send a Message</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sendAMessage: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    color: "#9e9fa0",
    textAlign: "left",
  },
  input: {
    borderRadius: 10,
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderColor: "#ececec",
    borderWidth: 2,
    width: "100%",
    overflow: "hidden",
    flexDirection: "row",
    paddingHorizontal: 30,
    paddingVertical: 18,
  },
});

export default INPUT1;
