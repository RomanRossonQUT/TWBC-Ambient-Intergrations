// This file is used to configure and initialise Firebase services for a React Native application.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// Import environment variables for Firebase configuration from the .env file.
import { 
  API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET,
  MESSAGING_SENDER_ID, APP_ID, MEASUREMENT_ID 
} from '@env';

// Firebase configuration objects.
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID
};

// Initialise Firebase.
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);

// Cloudinary configuration is now handled directly via REST API calls in relevant files.

// Export the Firebase services for use in other parts of the application.
export { app, auth, db };
export default { auth, getAuth, db };
export const storage = getStorage(app);