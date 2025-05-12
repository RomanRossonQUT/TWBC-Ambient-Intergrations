import * as React from "react";
import { Button } from "@rneui/themed";
import {
  StyleSheet,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const Complete = ({
  onButtonPrimaryPress,
  onButtonPrimaryPress1,
  viewDetails,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.buttonPrimaryParent}>
      <Button
        style={[styles.buttonPrimary, styles.buttonFlexBox]}
        radius={5}
        iconPosition="left"
        type="solid"
        color="#9eaab6"
        icon={{ name: "arrow-left", type: "material-community" }}
        onPress={onButtonPrimaryPress}
      />
      <TouchableOpacity
        style={[styles.buttonPrimary1, styles.buttonFlexBox]}
        activeOpacity={0.2}
        onPress={onButtonPrimaryPress1}
      >
        <Text style={styles.viewDetails}>{viewDetails}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonFlexBox: {
    justifyContent: "center",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonPrimary: {
    width: 40,
    height: 41,
  },
  viewDetails: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Raleway-Bold",
    color: "#fff",
    textAlign: "center",
  },
  buttonPrimary1: {
    flex: 1,
    backgroundColor: "#ed469a",
    paddingHorizontal: 0,
    paddingVertical: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonPrimaryParent: {
    alignSelf: "stretch",
    gap: 20,
    alignItems: "center",
    flexDirection: "row",
  },
});

export default Complete;
