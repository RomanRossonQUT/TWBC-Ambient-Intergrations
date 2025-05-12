import * as React from "react";
import { Text, StyleSheet, View } from "react-native";

const AboutMe = ({ aboutMe }) => {
  return (
    <View style={[styles.aboutMeParent, styles.aboutMeParentFlexBox]}>
      <Text style={[styles.aboutMe, styles.aboutMeFlexBox]}>About Me</Text>
      <View
        style={[styles.loremIpsumDolorSitAmetConWrapper, styles.aboutMeParentFlexBox]}
      >
        <Text style={[styles.loremIpsumDolor, styles.aboutMeFlexBox]}>
          {aboutMe || "No about me info available."}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  aboutMeParentFlexBox: { overflow: "hidden", alignSelf: "stretch" },
  aboutMeFlexBox: { textAlign: "left", color: "#000" },
  aboutMe: { fontSize: 18, fontWeight: "700", fontFamily: "Raleway-Bold" },
  loremIpsumDolor: { flex: 1, fontSize: 16, fontFamily: "Raleway-Regular" },
  loremIpsumDolorSitAmetConWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
  },
  aboutMeParent: {
    borderStyle: "dashed",
    borderColor: "#ececec",
    borderTopWidth: 2,
    paddingTop: 20,
    gap: 10,
  },
});

export default AboutMe;
