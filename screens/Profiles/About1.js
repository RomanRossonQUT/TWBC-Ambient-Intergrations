import React, { useState } from "react"; 
import { Pressable, StyleSheet, View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ProgressBar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import { TextInput as RNPTextInput } from 'react-native-paper';
import AdaptiveTextInput from '../../components/AdaptiveTextInput';

const About1 = ({ route }) => {
  const navigation = useNavigation();
  const { uid, pid, type } = route.params;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [country, setCountry] = useState('');
  const [pronouns, setPronouns] = useState('');  // New state for pronouns

  const saveData = async () => {
    await updateDoc(doc(db, "Profiles", pid.toString()), {
      firstName: firstName,
      lastName: lastName,
      currentRole: currentRole,
      currentIndustry: currentIndustry,
      preferredLanguage: preferredLanguage,
      country: country,
      pronouns: pronouns,  // Save pronouns to Firestore
      profileType: type
    }, { merge: true });
    navigation.navigate("About2", { uid, pid, type });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.about14}>
        <Pressable
          style={styles.header31}
           
        >
          <Image
            style={styles.icon}
            contentFit="cover"
            source={require("../../assets/header-3-11.png")}
          />
        </Pressable>
        <View style={styles.progressContainer}>
          <ProgressBar
            style={styles.progressbar}
            progress={0.25}
            color="#ed469a"
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.tellUsAbout}>Tell us about yourself</Text>
          <Text style={styles.thisWillHelp}>This will help us match you with mentors.</Text>
        </View>

        <View style={styles.infocontainer}>
          <AdaptiveTextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />

          <AdaptiveTextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />

          <AdaptiveTextInput
            placeholder="Current Role"
            value={currentRole}
            onChangeText={setCurrentRole}
          />

          <AdaptiveTextInput
            placeholder="Current Industry"
            value={currentIndustry}
            onChangeText={setCurrentIndustry}
          />

          <AdaptiveTextInput
            placeholder="Preferred Language"
            value={preferredLanguage}
            onChangeText={setPreferredLanguage}
          />

          <AdaptiveTextInput
            placeholder="Country"
            value={country}
            onChangeText={setCountry}
          />

          <AdaptiveTextInput
            placeholder="Pronouns"
            value={pronouns}
            onChangeText={setPronouns}
          />
        </View>

        <Pressable style={styles.buttonNext} onPress={saveData}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  infocontainer: {
    gap: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 30,
    width: "100%",
    paddingTop: "20%",
    paddingBottom: "20%",
    justifyContent: "center",
  },
  about14: {
    flex: 1,
    gap: 30,
    width: "100%",
  },
  header31: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    height: "100%",
    width: "80%",
    resizeMode: "contain",
  },
  progressContainer: {
    marginBottom: 20,
  },
  buttonPrimary: {
    borderRadius: 45,
    height: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  progressbar: {
    backgroundColor: "#ea9bbf",
    height: 20,
  },
  tellUsAbout: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Raleway-Bold",
  },
  thisWillHelp: {
    fontSize: 15,
    fontFamily: "Raleway-Regular",
  },
  info: {
    overflow: "hidden",
    alignSelf: "stretch",
  },
  buttonNext: {
    backgroundColor: "#ed469a",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});

export default About1;
