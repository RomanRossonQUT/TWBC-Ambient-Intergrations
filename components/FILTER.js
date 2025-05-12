import * as React from "react";

const FILTER = () => {
  return (
    <Image
      style={styles.filterIcon}
      contentFit="cover"
      source={require("../assets/filter1.png")}
    />
  );
};

const styles = StyleSheet.create({
  filterIcon: {
    width: 50,
    height: 50,
  },
});

export default FILTER;
