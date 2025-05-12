// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, collection, doc, getDoc, getDocs, Timestamp, FieldValue, Filter } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Optionally import the services that you want to use
// import {...} from "firebase/database";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

import { FIREBASE_SERVICE_ACCOUNT_JSON } from '@env';
const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON);

// Then pass `serviceAccount` to initializeApp() or cert()


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { 
  API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET,
  MESSAGING_SENDER_ID, APP_ID, MEASUREMENT_ID 
} from '@env';

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID
  //credential: cert(serviceAccount)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const auth = getAuth(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null); //pretty sure this does nothing lol

console.log("hi")

/* ---- code examples ----*/

// Function to read data from Firestore
// grabs a whole collection
/* const readData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Profiles'));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}; */

// grabs a specific user from the database
/* const readData = async () => {
  try {
    const docRef = doc(db, "Users", "alice");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error('error fetching data:', error);
  }
}; */

// grabs a specific user and seperates the fields
/* const readData = async () => {
  try {
    const docRef = doc(db, "Users", "alice");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const userID = data["userID"];
      const username = data["username"];
      const password = data["password"];

      console.log("UserID:", userID);
      console.log("Username:", username);
      console.log("Password:", password);
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error('error fetching data:', error);
  }
};  */

// Call the function to read data
//readData();


/* ---- end of code examples ---- */

export { analytics, auth, getAuth, db };