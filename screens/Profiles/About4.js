import React, { useState } from "react";
import { Pressable, StyleSheet, View, Text, ScrollView, TextInput } from "react-native";
import { Image } from "expo-image";
import { ProgressBar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { setDoc, doc } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';

const About4 = ({ route }) => {
  const navigation = useNavigation();
  const { uid, pid, type } = route.params;
  const [bio, setBio] = useState('');

  const saveData = async () => {
    // Save the user's bio in Firebase
    await setDoc(doc(db, "Profiles", pid.toString()), {
      bio: bio,
    }, { merge: true });

    // Navigate to the Home screen after saving the bio
    navigation.navigate("Home", {uid, pid, type});
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.about44}>
        <Pressable
          style={styles.headerContainer}
           
        >
          <Image
            style={styles.headerImage}
            contentFit="contain"
            source={require("../../assets/header-11.png")}
          />
        </Pressable>
        <View style={styles.progressContainer}>
          <ProgressBar
            style={styles.progressbar}
            progress={1}
            color="#ed469a"
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.tellUsMore}>Tell us more about you!</Text>
        </View>
        <TextInput
          placeholder="Enter Bio"
          value={bio}
          onChangeText={(text) => setBio(text)}
          style={styles.input}
        />
        <View style={styles.buttonsContainer}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.buttonFinish} onPress={saveData}>
            <Text style={styles.buttonText}>Finish</Text>
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
  about44: {
    flex: 1,
    gap: 30,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  headerContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressbar: {
    backgroundColor: "#ea9bbf",
    height: 20,
    width: 330,
  },
  tellUsMore: {
    fontSize: 32,
    fontFamily: "Raleway-Bold",
    fontWeight: "700",
    textAlign: "center",
  },
  info: {
    overflow: "hidden",
    gap: 20,
    alignSelf: "stretch",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "100%",
    marginBottom: 20,
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  buttonFinish: {
    backgroundColor: "#ed469a",
    width: "75%",
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  backButton: {
    backgroundColor: "#FFB6C1",
    width: "20%",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default About4;
