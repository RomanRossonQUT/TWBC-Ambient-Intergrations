import React, { useState } from "react";
import { Pressable, StyleSheet, View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ProgressBar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { setDoc, doc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons'; // For the back arrow icon

const About3 = ({ route }) => {
  const navigation = useNavigation();
  const { uid, pid, type } = route.params;
  const [activeButtons, setActiveButtons] = useState({});

  const buttonData = [
    "Leadership", "Management", "Development", "Communication", "Creativity"
  ];

  const toggleButtonColor = (index) => {
    setActiveButtons((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const saveData = async () => {
    console.log(activeButtons);
    const selectedSkills = Object.keys(activeButtons).filter((key) => activeButtons[key]).map(Number);

    for (i in selectedSkills) {

      selectedSkills[i] += 1;
    }
    console.log(selectedSkills);

    await setDoc(doc(db, "Profiles", pid.toString()), {
      skills: selectedSkills,
    }, { merge: true });

    navigation.navigate("About4", { uid, pid, type });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.about34}>
        
        {/* Header image */}
        <Pressable
          style={styles.header31}
          onPress={() => navigation.navigate("StartScreen")}
        >
          <Image
            style={styles.icon}
            contentFit="cover"
            source={require("../assets/header-3-11.png")}
          />
        </Pressable>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            style={styles.progressbar}
            progress={0.75}
            color="#ed469a"
          />
        </View>

        {/* Text instructions */}
        <View style={styles.info}>
          <Text style={styles.tellUsYour}>Tell us your skills</Text>
        </View>

        {/* Buttons for skills */}
        <View style={styles.buttons}>
          {buttonData.map((buttonLabel, index) => (
            <Pressable
              key={index}
              style={[styles.buttonPrimary1, activeButtons[index] && { backgroundColor: "#ED469A" }]}
              onPress={() => toggleButtonColor(index)}
            >
              <Text style={styles.viewDetails}>{buttonLabel}</Text>
            </Pressable>
          ))}
        </View>

        {/* Back and Next buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>

          <Pressable style={styles.buttonNext} onPress={saveData}>
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 30,
    width: "100%",
    paddingTop: "20%",
    paddingBottom: "20%",
  },
  about34: {
    flex: 1,
    gap: 30,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressbar: {
    backgroundColor: "#ea9bbf",
    height: 20,
    width: 330,
  },
  tellUsYour: {
    fontSize: 32,
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
  },
  info: {
    overflow: "hidden",
    gap: 20,
    alignSelf: "stretch",
  },
  buttons: {
    flexWrap: "wrap",
    alignContent: "flex-start",
    gap: 10,
    flexDirection: "row",
    alignSelf: "stretch",
  },
  buttonPrimary1: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ea9bbf",
    borderRadius: 5,
  },
  viewDetails: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  header31: {
    width: 300,
    height: 50,
  },
  icon: {
    height: "100%",
    width: "100%",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  buttonNext: {
    backgroundColor: "#ed469a",  // Custom background color
    width: "75%",               // Full width, shared with the back button
    paddingVertical: 15,        // Padding for better touch area
    borderRadius: 10,           // Rounded corners
    justifyContent: "center",   // Center align text vertically
    alignItems: "center",       // Center align text horizontally
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  backButton: {
    backgroundColor: "#FFB6C1",  // Lighter pink color
    width: "20%",                // Smaller size for the back button
    paddingVertical: 10,         // Padding for better touch area
    borderRadius: 10,            // Rounded square
    justifyContent: "center",    // Center align text vertically
    alignItems: "center",        // Center align text horizontally
  },
});

export default About3;
