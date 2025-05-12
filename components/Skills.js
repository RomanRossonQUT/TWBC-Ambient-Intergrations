import React from "react";
import { Text, StyleSheet, View } from "react-native";

const Skills = ({ interests, title = 'Skills/Interests', propHeight }) => {
  const hasInterests = Array.isArray(interests) && interests.length > 0;

  return (
    <View style={styles.interestsParent}>
      <Text style={[styles.interests, styles.interestsTypo]}>
        {hasInterests ? title : 'No Skills/Interests Available'}
      </Text>
      {hasInterests && (
        <View style={[styles.frameParent, { height: propHeight }]}>
          {interests.map((interest, index) => (
            <View key={index} style={styles.buttonHighlightWrapper}>
              <Text style={styles.buttonHighlight}>{interest}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  interestsTypo: { textAlign: "left", fontWeight: "700" },
  frameParent: {
    height: 86,
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: 5,
    flexDirection: "row",
  },
  interestsParent: {
    borderStyle: "dashed",
    borderColor: "#ececec",
    borderTopWidth: 2,
    paddingTop: 20,
    gap: 10,
  },
  buttonHighlight: { fontSize: 16, fontWeight: "700", color: "#fff" },
  buttonHighlightWrapper: {
    borderRadius: 5,
    backgroundColor: "#ea9bbf",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default Skills;
