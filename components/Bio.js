// REVIEW
import { Input } from "@ui-kitten/components";
import { Text, StyleSheet, View } from "react-native";

const Bio = () => {
  return (
    <View style={styles.signupSection}>
      <Input
        style={styles.form}
        placeholder="Enter a short summary. "
        placeholderTextColor="#9eaab6"
        textStyle={styles.formTextInputText}
        label="Bio"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formTextInputText: {
    fontFamily: "Roboto-Regular",
    color: "#000",
  },
  form: {
    alignSelf: "stretch",
  },
  signupSection: {
    overflow: "hidden",
    alignSelf: "stretch",
  },
});

export default Bio;
