import React, { useMemo } from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View, ImageSourcePropType } from "react-native";

const getStyleValue = (key, value) => {
  if (value === undefined) return;
  return { [key]: value === "unset" ? undefined : value };
};
const Requested = ({ propPaddingVertical, pfp, propWidth, emmaSmith }) => {
  const frameView1Style = useMemo(() => {
    return {
      ...getStyleValue("paddingVertical", propPaddingVertical),
    };
  }, [propPaddingVertical]);

  const frameView2Style = useMemo(() => {
    return {
      ...getStyleValue("width", propWidth),
    };
  }, [propWidth]);

  return (
    <View style={[styles.pfpParent, styles.pfpParentFlexBox, frameView1Style]}>
      <Image style={styles.pfpIcon} contentFit="cover" source={pfp} />
      <View style={styles.frameParent}>
        <View style={[styles.emmaSmithParent, frameView2Style]}>
          <Text style={[styles.emmaSmith, styles.emmaSmithClr]}>
            {emmaSmith}
          </Text>
          <Text style={[styles.businessConsulting, styles.emmaSmithClr]}>
            Business Consulting
          </Text>
        </View>
        <View style={[styles.buttonHighlightWrapper, styles.pfpParentFlexBox]}>
          <Text style={[styles.buttonHighlight, styles.emmaSmithTypo]}>
            Request Sent
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pfpParentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "stretch",
    overflow: "hidden",
  },
  emmaSmithClr: {
    color: "#000",
    textAlign: "left",
  },
  emmaSmithTypo: {
    fontWeight: "700",
    fontSize: 16,
  },
  pfpIcon: {
    width: 50,
    height: 50,
  },
  emmaSmith: {
    fontFamily: "Raleway-Bold",
    textAlign: "left",
    fontWeight: "700",
    fontSize: 16,
  },
  businessConsulting: {
    fontSize: 12,
    fontFamily: "Raleway-Regular",
    textAlign: "left",
  },
  emmaSmithParent: {
    width: 121,
    height: 34,
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
    backgroundColor: "#ea9bbf",
    paddingHorizontal: 0,
    paddingVertical: 10,
    justifyContent: "center",
  },
  frameParent: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  pfpParent: {
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

export default Requested;
