// REVIEW
import React, { useState } from "react";
import { TextInput as RNPTextInput } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import Complete from "./Complete";
import { getDocs, collection, setDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from '../firebaseConfig'

const SignupSection = ({ userID, profileID, profileType }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [formValue, setFormValue] = useState();
  const [formItems, setFormItems] = useState([
    { value: "Construction", label: "Construction" },
    { value: "Education", label: "Education" },
    { value: "Energy", label: "Energy" },
    { value: "Finance", label: "Finance" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Hospitality", label: "Hospitality" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Retail", label: "Retail" },
    { value: "Technology", label: "Technology" },
    { value: "Transportation", label: "Transportation" },
    { value: "Construction", label: "Construction" },
    { value: "Education", label: "Education" },
    { value: "Energy", label: "Energy" },
    { value: "Finance", label: "Finance" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Hospitality", label: "Hospitality" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Retail", label: "Retail" },
    { value: "Technology", label: "Technology" },
    { value: "Transportation", label: "Transportation" },
  ]);
  const [form1Open, setForm1Open] = useState(false);
  const [form1Value, setForm1Value] = useState();
  const [form1Items, setForm1Items] = useState([
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Chinese", label: "Chinese" },
    { value: "Japanese", label: "Japanese" },
    { value: "Korean", label: "Korean" },
    { value: "Italian", label: "Italian" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Russian", label: "Russian" },
    { value: "Arabic", label: "Arabic" },
    { value: "Hindi", label: "Hindi" },
    { value: "Bengali", label: "Bengali" },
    { value: "Turkish", label: "Turkish" },
    { value: "Vietnamese", label: "Vietnamese" },
    { value: "Dutch", label: "Dutch" },
    { value: "Greek", label: "Greek" },
    { value: "Hebrew", label: "Hebrew" },
    { value: "Polish", label: "Polish" },
    { value: "Thai", label: "Thai" },
    { value: "Swedish", label: "Swedish" },
    { value: "Danish", label: "Danish" },
    { value: "Finnish", label: "Finnish" },
    { value: "Norwegian", label: "Norwegian" },
    { value: "Hungarian", label: "Hungarian" },
    { value: "Czech", label: "Czech" },
    { value: "Slovak", label: "Slovak" },
    { value: "Romanian", label: "Romanian" },
    { value: "Bulgarian", label: "Bulgarian" },
    { value: "Croatian", label: "Croatian" },
    { value: "Serbian", label: "Serbian" },
    { value: "Ukrainian", label: "Ukrainian" },
    { value: "Malay", label: "Malay" },
    { value: "Indonesian", label: "Indonesian" },
    { value: "Filipino", label: "Filipino" },
    { value: "Swahili", label: "Swahili" },
    { value: "Zulu", label: "Zulu" },
    { value: "Afrikaans", label: "Afrikaans" },
    { value: "Persian", label: "Persian" },
    { value: "Urdu", label: "Urdu" },
    { value: "Tamil", label: "Tamil" },
    { value: "Telugu", label: "Telugu" },
    { value: "Kannada", label: "Kannada" },
    { value: "Malayalam", label: "Malayalam" },
    { value: "Marathi", label: "Marathi" },
    { value: "Gujarati", label: "Gujarati" },
    { value: "Punjabi", label: "Punjabi" },
    { value: "Burmese", label: "Burmese" },
    { value: "Khmer", label: "Khmer" },
    { value: "Lao", label: "Lao" },
    { value: "Sinhala", label: "Sinhala" },
    { value: "Nepali", label: "Nepali" },
    { value: "Armenian", label: "Armenian" },
    { value: "Georgian", label: "Georgian" },
    { value: "Mongolian", label: "Mongolian" },
    { value: "Kazakh", label: "Kazakh" },
    { value: "Uzbek", label: "Uzbek" },
    { value: "Azerbaijani", label: "Azerbaijani" },
    { value: "Kurdish", label: "Kurdish" },
    { value: "Pashto", label: "Pashto" },
    { value: "Tajik", label: "Tajik" },
    { value: "Turkmen", label: "Turkmen" },
  ]);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [country, setCountry] = useState('');

  //console.log(userID, profileID, profileType);

  const navigation = useNavigation();

  const saveForm = async () => {
    //need to add error handling and checking if r
    try {
      /* await updateDoc(doc(db, "Profiles", profileID), {
        currentIndustry: formValue,
        currentRole: currentRole,
        firstName: firstname,
        lastName: lastname,
        languages: form1Value,
        location: country,
        pronouns: null // TODO: add pronouns
      }) */
  
      navigation.navigate("About2", { userID, profileID, profileType })
    }  catch (error) {
      console.error('Error:', error);
    }

  }

  return (
    <View style={styles.signupSection}>
      <RNPTextInput
        style={styles.form}
        label="Firstname"
        placeholder="e.g Mary"
        mode="outlined"
        placeholderTextColor="#9eaab6"
        outlineColor="#9eaab6"
        activeOutlineColor="#ed469a"
        theme={{
          fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
          colors: { text: "#191919" },
        }}
        value={firstname}
        onChangeText={setFirstname}
      />
      <RNPTextInput
        style={styles.form}
        label="Lastname"
        placeholder="e.g Smith"
        mode="outlined"
        placeholderTextColor="#9eaab6"
        outlineColor="#9eaab6"
        activeOutlineColor="#ed469a"
        theme={{
          fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
          colors: { text: "#191919" },
        }}
        value={lastname}
        onChangeText={setLastname}
      />
      <RNPTextInput
        style={styles.form}
        label="Current Role"
        placeholder="e.g Teacher, Nurse, General Manager etc."
        mode="outlined"
        placeholderTextColor="#9eaab6"
        outlineColor="#9eaab6"
        activeOutlineColor="#ed469a"
        theme={{
          fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
          colors: { text: "#191919" },
        }}
        value={currentRole}
        onChangeText={setCurrentRole}
      />
      <View style={styles.form}>
        <DropDownPicker
          open={formOpen}
          setOpen={setFormOpen}
          value={formValue}
          setValue={setFormValue}
          placeholder="Current Industry"
          items={formItems}
          labelStyle={styles.formText}
          textStyle={styles.formText}
        />
      </View>
      <View style={styles.form}>
        <DropDownPicker
          open={form1Open}
          setOpen={setForm1Open}
          value={form1Value}
          setValue={setForm1Value}
          placeholder="Preferred Language"
          items={form1Items}
          labelStyle={styles.formText}
          textStyle={styles.form1Text}
        />
      </View>
      <RNPTextInput
        style={styles.form}
        label="Country"
        placeholder="e.g Australia, New Zealand"
        mode="outlined"
        placeholderTextColor="#9eaab6"
        outlineColor="#9eaab6"
        activeOutlineColor="#ed469a"
        theme={{
          fonts: { regular: { fontFamily: "Roboto", fontWeight: "Medium" } },
          colors: { text: "#191919" },
        }}
        value={country}
        onChangeText={setCountry}
      />
      <Complete
        onButtonPrimaryPress={() => navigation.navigate("MenteeMentorSelector")}
        onButtonPrimaryPress1={() => saveForm()}
        viewDetails="Continue"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formText: {
    color: "#000",
    fontFamily: "Roboto-Regular",
  },
  form: {
    alignSelf: "stretch",
    fontFamily: "Roboto-Regular",
  },
  signupSection: {
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 10,
    gap: 20,
    alignSelf: "stretch",
  },
});

export default SignupSection;
