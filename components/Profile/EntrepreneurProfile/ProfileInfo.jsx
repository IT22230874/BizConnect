import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/FirebaseConfig"; // Firestore instance
import { useAuth } from "../../../context/authContext"; // Importing useAuth for current user
import { Colors } from "../../../constants/Colors"; // Import Colors for consistency
import { RFValue } from "react-native-responsive-fontsize";
import { SkeletonLayouts } from "../../Skeleton/Skeleton";

const ProfileInfo = ({ entrepreneurId }) => {
  const { user } = useAuth(); // Get the currently logged-in user
  const [bio, setBio] = useState(""); // State to hold the bio
  const [loading, setLoading] = useState(true); // Loading state
  const [expanded, setExpanded] = useState(false); // State to toggle read more/less

  // Function to fetch the entrepreneur's profile info from Firestore
  const fetchUserProfile = async () => {
    try {
      const idToFetch = entrepreneurId || user?.uid; // Use provided entrepreneurId or current user's ID
      const userDocRef = doc(db, "entrepreneurs", idToFetch); // Reference to entrepreneur's document
      const userDocSnap = await getDoc(userDocRef); // Fetch document snapshot

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // console.log(userData);

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

  // Fetch profile info when the component mounts or entrepreneurId changes
  useEffect(() => {
    if (entrepreneurId || user) {
      fetchUserProfile(); // Fetch profile if UID is provided or user is logged in
    }
  }, [entrepreneurId, user]);

  if (loading) {
    return <SkeletonLayouts.TextBlock />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>About Me</Text>

        <Text style={styles.aboutText}>
          {/* Display the bio with read more/read less inline */}
          {expanded ? bio : bio.length > 100 ? `${bio.substring(0, 100)}` : bio}
          {bio.length > 100 && !expanded && "..."}{" "}
          {/* Add ellipsis if truncated */}
          {/* Show the read more/read less button inline */}
          {bio.length > 100 && (
            <Text
              style={styles.readMore}
              onPress={() => setExpanded(!expanded)} // Toggle expanded state
            >
              {expanded ? " read less" : " read more"}
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  aboutSection: {
    flex: 1,
  },
  aboutTitle: {
    color: "rgba(141, 110, 99, 1)",
    fontFamily: "lato-bold",
    marginBottom: 8,
    fontSize: RFValue(13),
    textTransform: "uppercase",
  },
  aboutText: {
    color: "#000",
    fontFamily: "lato",
    fontSize: RFValue(13),
    lineHeight: 22,
  },
  readMore: {
    color: Colors.secondaryColor,
    textDecorationLine: "underline",
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
});

export default ProfileInfo;
