// Import the functions you need from the SDKs
import { initializeApp } from 'firebase/app';
import { collection, getFirestore, doc, getDoc,getDocs } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmnbyabDAJ1gYanHRVMc3wjkB0Ze1vEXc",
  authDomain: "bizconnect-eb2e4.firebaseapp.com",
  projectId: "bizconnect-eb2e4",
  storageBucket: "bizconnect-eb2e4.appspot.com",
  messagingSenderId: "356665018265",
  appId: "1:356665018265:web:6b0f0f71c5db58f5e7b508",
  measurementId: "G-FKCYTYXR71"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firebase Storage
export const storage = getStorage(app);

// Function to fetch user data based on the role ('entrepreneur' or 'buyer')
export const fetchUserData = async (uid, role) => {
  try {
    // Determine the collection based on the user's role
    const collectionName = role === 'entrepreneur' ? 'entrepreneurs' : 'buyers';
    
    // Reference to the user document in the relevant collection
    const userDocRef = doc(db, collectionName, uid);
    
    // Fetch the document
    const userDocSnap = await getDoc(userDocRef);
    
    // Check if the document exists and return the data
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      console.log(`No user data found in Firestore for UID: ${uid} in ${collectionName}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

