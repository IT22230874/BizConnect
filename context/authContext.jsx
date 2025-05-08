import React, { useContext, createContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth, db } from "../config/FirebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { StyleSheet, Text, View, Image } from "react-native";
import { StatusBar } from "expo-status-bar";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const role = await fetchUserRoleAndData(currentUser.uid);
        if (role) setIsAuthenticated(true); // Only authenticate if a role is found
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Function to fetch user role and data from Firestore
  const fetchUserRoleAndData = async (uid) => {
    try {
      const usersRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(usersRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role;

        if (role) {
          const collectionName =
            role === "entrepreneur" ? "entrepreneurs" : "buyers";
          const specificUserDocRef = doc(db, collectionName, uid);
          const specificUserDocSnap = await getDoc(specificUserDocRef);

          if (specificUserDocSnap.exists()) {
            const specificData = specificUserDocSnap.data();
            setUser({ ...userData, ...specificData }); // Merge the common and role-specific data
            return role; // Return role after fetching data
          } else {
            console.error(
              `No specific data found for UID: ${uid} in ${collectionName}`
            );
          }
        } else {
          console.error(`No role found for UID: ${uid}`);
        }
      } else {
        console.error(`No user document found for UID: ${uid}`);
      }
    } catch (error) {
      console.error("Error fetching user role and data:", error);
    }
    return null; // Return null if no role found
  };

  // Update profile function
  const updateProfile = async (updatedData, imageUri = null) => {
    try {
      if (!user) throw new Error("No user is currently logged in");

      const collectionName =
        user.role === "entrepreneur" ? "entrepreneurs" : "buyers";
      const userRef = doc(db, collectionName, user.uid);

      const dataToUpdate = { ...updatedData };
      if (imageUri) dataToUpdate.profileImage = imageUri;

      await setDoc(userRef, dataToUpdate, { merge: true });

      // Update the in-memory user state
      setUser((prevUser) => ({
        ...prevUser,
        ...dataToUpdate,
      }));

      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
  };

  // Sign In function
  const signin = async (identifier, password) => {
    try {
      let user;

      if (identifier.includes("@")) {
        // Sign in with email and password
        const response = await signInWithEmailAndPassword(
          auth,
          identifier,
          password
        );
        user = response.user;
      } else {
        // Sign in with phone number
        user = await signInWithPhoneNumber(auth, identifier, password);
      }

      // Fetch the user's role
      const userRole = await fetchUserRoleAndData(user.uid); // Make sure this returns the role

      if (userRole) {
        return {
          success: true,
          data: user,
          role: userRole, // Add role to response
        };
      } else {
        return {
          success: false,
          data: "User role not found",
        };
      }
    } catch (e) {
      const errorMsg = handleFirebaseError(e.code);
      return {
        success: false,
        data: errorMsg,
      };
    }
  };

  // Sign Up function
  const signup = async (email, password, username, phoneNumber, role) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user in main "users" collection
      const userDocRef = doc(db, "users", response.user.uid);
      await setDoc(userDocRef, {
        uid: response.user.uid,
        email,
        username,
        phoneNumber,
        role,
        createdAt: new Date(),
      });

      // Create document in role-specific collection
      const collectionName =
        role === "entrepreneur" ? "entrepreneurs" : "buyers";
      const specificUserDocRef = doc(db, collectionName, response.user.uid);
      await setDoc(specificUserDocRef, {
        uid: response.user.uid,
        email,
        username,
        phoneNumber,
      });

      const userRole = await fetchUserRoleAndData(response.user.uid);
      return { success: true, data: response.user, role: userRole };
    } catch (e) {
      return { success: false, data: e.message };
    }
  };

  // Sign Out function
  const signout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Error during sign out:", e);
    }
  };

  // Handle Firebase errors
  const handleFirebaseError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/invalid-credential":
        return "The credentials provided are invalid.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" translucent />
        <Image
          source={require("../assets/Bizconnect_Logo.png")} // Replace with your logo's path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    ); // Loading spinner can be added here
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, signin, signout, signup, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the AuthContext
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value)
    throw new Error("useAuth must be used within an AuthContextProvider");
  return value;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Change to your desired background color
  },
  logo: {
    width: 100, // Adjust the size according to your logo dimensions
    height: 100, // Adjust the size according to your logo dimensions
    marginBottom: 20, // Space between the logo and spinner
  },
});