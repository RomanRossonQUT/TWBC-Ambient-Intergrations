import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";

const SendMessage = () => {
  const navigation = useNavigation();

  return (
    <View style={[styles.frameParent, styles.frameParentFlexBox]}>
      <Pressable
        style={styles.wrapper}
        onPress={() => navigation.navigate("MENTORPROFILE")}
      >
        <Image
          style={styles.icon}
          contentFit="cover"
          source={require("../assets/frame-139.png")}
        />
      </Pressable>
      <View style={styles.frameGroup}>
        <View style={styles.amandaThompsonParent}>
          <Text style={[styles.amandaThompson, styles.amandaThompsonClr]}>
            Amanda Thompson
          </Text>
          <Text style={[styles.businessServices, styles.amandaThompsonClr]}>
            Business Services
          </Text>
        </View>
        <Pressable
          style={[styles.buttonHighlightWrapper, styles.frameParentFlexBox]}
          onPress={() => navigation.navigate("CHATSCREEN1")}
        >
          <Text style={[styles.buttonHighlight, styles.amandaThompsonTypo]}>
            Send a Message!
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frameParentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "stretch",
    overflow: "hidden",
  },
  amandaThompsonClr: {
    color: "#000",
    textAlign: "left",
  },
  amandaThompsonTypo: {
    fontWeight: "700",
    fontSize: 16,
  },
  icon: {
    borderRadius: 25,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  wrapper: {
    width: 50,
    height: 50,
  },
  amandaThompson: {
    fontFamily: "Raleway-Bold",
    textAlign: "left",
    fontWeight: "700",
    fontSize: 16,
  },
  businessServices: {
    fontSize: 12,
    fontFamily: "Raleway-Regular",
    textAlign: "left",
  },
  amandaThompsonParent: {
    width: 121,
    height: 35,
    gap: 5,
    overflow: "hidden",
  },
  buttonHighlight: {
    fontFamily: "Roboto-Bold",
    color: "#fff",
    textAlign: "left",
  },
  buttonHighlightWrapper: {
    borderRadius: 5,
    backgroundColor: "#ed469a",
    paddingHorizontal: 0,
    paddingVertical: 10,
    justifyContent: "center",
  },
  frameGroup: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  frameParent: {
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 34,
  },
});

export default SendMessage;
