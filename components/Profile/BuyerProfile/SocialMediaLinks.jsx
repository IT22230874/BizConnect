import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  ToastAndroid, // Import ToastAndroid for displaying toast messages
} from "react-native"; // Import Linking for URL handling
import Fontisto from "@expo/vector-icons/Fontisto";
import { useAuth } from "../../../context/authContext"; // Import useAuth hook
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/FirebaseConfig"; // Firestore instance

const SocialMediaItem = ({ icon, label, value, onPress }) => (
  <View style={styles.itemContainer}>
    <TouchableOpacity style={styles.socialItem} onPress={onPress}>
      <Fontisto name={icon} size={20} color="#ffffff" style={styles.icon} />
    </TouchableOpacity>
    <Text style={styles.socialLabel}>{label}</Text>
  </View>
);

const SocialMediaLinks = ({ buyerId }) => {
  const { user } = useAuth(); // Get the currently logged-in user
  const [socialLinks, setSocialLinks] = useState({
    website: "",
    instagram: "",
    facebook: "",
    twitter: "", // Added Twitter state
  }); // State to hold social media links
  const [loading, setLoading] = useState(true); // Loading state

  // Function to fetch social media links from Firestore
  const fetchSocialLinks = async () => {
    try {
      const idToFetch = buyerId || user?.uid; // Use provided buyerId or current user's ID
      const userDocRef = doc(db, "buyers", idToFetch); // Reference to buyer's document
      const userDocSnap = await getDoc(userDocRef); // Fetch document snapshot

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setSocialLinks({
          website: userData.website || "",
          instagram: userData.instagram || "",
          facebook: userData.facebook || "",
          twitter: userData.twitter || "", // Fetch Twitter link
        });
      } else {
        console.log("No document found for this UID:", idToFetch); // Log if no document is found
      }
    } catch (error) {
      console.error("Error fetching social media links from Firestore:", error); // Log errors
    } finally {
      setLoading(false); // Set loading to false after data fetch
    }
  };

  // Fetch social media links when the component mounts or buyerId changes
  useEffect(() => {
    if (buyerId || user) {
      fetchSocialLinks(); // Fetch social links if buyerId is provided or user is logged in
    }
  }, [buyerId, user]);

  const socialData = [
    {
      icon: "world-o",
      label: "Website",
      value: socialLinks.website,
      url: socialLinks.website, // URL to open for website
    },
    {
      icon: "instagram",
      label: "Instagram",
      value: socialLinks.instagram,
      url: socialLinks.instagram, // URL to open for Instagram
    },
    {
      icon: "facebook",
      label: "Facebook",
      value: socialLinks.facebook,
      url: socialLinks.facebook, // URL to open for Facebook
    },
    {
      icon: "twitter", // Twitter icon
      label: "Twitter", // Change this to the desired label if needed
      value: socialLinks.twitter,
      url: socialLinks.twitter, // URL to open for Twitter
    },
  ];

  // Function to handle opening URLs or showing a toast message
  const handleLinkPress = async (url, label) => {
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log(`Can't open URL: ${url}`);
      }
    } else {
      // Show a toast message if no link is available
      ToastAndroid.show(`No ${label} link available.`, ToastAndroid.SHORT); // Show toast message
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Website and Social Media Links:</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.socialContainer}>
          {socialData.map((item, index) => (
            <SocialMediaItem
              key={index}
              icon={item.icon}
              label={item.label}
              value={item.value || "No link available"} // Show a placeholder if the value is empty
              onPress={() => handleLinkPress(item.url, item.label)} // Pass the URL and label to the onPress function
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    paddingHorizontal: 0,
  },
  title: {
    color: "rgba(141, 110, 99, 1)",
    fontSize: 15,
    fontFamily: "poppins-semibold",
    marginBottom: 8,
  },
  socialContainer: {
    flexDirection: "row", // Display items in a row
    marginTop: 10, // Add some margin above the buttons
  },
  itemContainer: {
    alignItems: "center", // Center align items within each item container
    flex: 1, // Allow the item containers to flexibly occupy space
    marginHorizontal: 5, // Reduced horizontal margin for less gap between items
  },
  socialItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#AA6A1C", // Updated background color for uniformity
    borderRadius: 30, // Make buttons rounded
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 60, // Fixed width for the button
    height: 60, // Fixed height for the button
  },
  socialLabel: {
    marginTop: 5, // Add some space above the label
    fontFamily: "poppins-semibold",
    fontSize: 14,
    color: "#000", // Change label color to white for contrast
  },
});

export default SocialMediaLinks;
