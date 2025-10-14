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
  interestsTypo: { 
    textAlign: "left", 
    fontWeight: "700",
    fontSize: 18,
    color: "#333",
    marginBottom: 12,
  },
  frameParent: {
    height: 86,
    flexWrap: "wrap",
    alignContent: "flex-start",
    justifyContent: "flex-start",
    gap: 6,
    flexDirection: "row",
    paddingHorizontal: 0,
  },
  interestsParent: {
    borderStyle: "dashed",
    borderColor: "#ececec",
    borderTopWidth: 2,
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  buttonHighlight: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#fff",
    textAlign: "center",
  },
  buttonHighlightWrapper: {
    borderRadius: 20,
    backgroundColor: "#ea9bbf",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

export default Skills;
