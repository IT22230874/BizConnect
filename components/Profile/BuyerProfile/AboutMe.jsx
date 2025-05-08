import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useAuth } from "../../../context/authContext"; // Import useAuth hook
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/FirebaseConfig"; // Firestore instance
import { Colors } from "../../../constants/Colors"; // Import Colors for consistency
import { RFValue } from "react-native-responsive-fontsize"; // Font scaling for responsiveness

const AboutMe = ({ buyerId }) => {
  const { user } = useAuth(); // Get the currently logged-in user
  const [bio, setBio] = useState(""); // State to hold bio
  const [loading, setLoading] = useState(true); // Loading state
  const [expanded, setExpanded] = useState(false); // State to toggle read more/less

  // Function to fetch the buyer's profile info from Firestore
  const fetchUserBio = async () => {
    try {
      const idToFetch = buyerId || user?.uid; // Use provided buyerId or current user's ID
      const userDocRef = doc(db, "buyers", idToFetch); // Reference to buyer's document
      const userDocSnap = await getDoc(userDocRef); // Fetch document snapshot

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setBio(userData.bio || "No bio available"); // Set bio or default if not available
      } else {
        console.log("No document found for this UID:", idToFetch); // Log if no document is found
        setBio("No bio available"); // Default message if no document exists
      }
    } catch (error) {
      console.error("Error fetching user profile from Firestore:", error); // Log errors
      setBio("Failed to fetch bio."); // Error message if fetching fails
    } finally {
      setLoading(false); // Set loading to false after data fetch
    }
  };

  // Fetch profile info when the component mounts or buyerId changes
  useEffect(() => {
    if (buyerId || user) {
      fetchUserBio(); // Fetch profile if buyerId is provided or user is logged in
    }
  }, [buyerId, user]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ABOUT ME</Text>
      <Text style={styles.description}>{bio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  title: {
    color: "rgba(141, 110, 99, 1)",
    fontFamily: "poppins-semibold",
    fontSize: 19,
  },
  description: {
    color: "#262626",
    fontFamily: "poppins",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
});

export default AboutMe;
