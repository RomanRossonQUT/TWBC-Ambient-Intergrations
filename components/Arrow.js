import * as React from "react";

const Arrow = () => {
  return (
    <Image
      style={styles.arrowIcon}
      contentFit="cover"
      source={require("../assets/arrow1.png")}
    />
  );
};

const styles = StyleSheet.create({
  arrowIcon: {
    width: 25,
    height: 25,
  },
});

export default Arrow;
