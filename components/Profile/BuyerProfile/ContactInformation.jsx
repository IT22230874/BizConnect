import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from "../../../context/authContext"; // Import useAuth hook
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/FirebaseConfig"; // Firestore instance

const ContactItem = ({ icon, label, value }) => (
  <View style={styles.contactItem}>
    <Ionicons name={icon} size={20} color="rgba(141, 110, 99, 1)" style={styles.icon} />
    <View style={styles.contactDetails}>
      <Text style={styles.contactLabel}>{label}:</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
  </View>
);

const ContactInformation = ({ buyerId }) => {
  const { user } = useAuth(); // Get the currently logged-in user
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phoneNumber: "",
    address: "",
  }); // State to hold contact information
  const [loading, setLoading] = useState(true); // Loading state

  // Function to fetch contact information from Firestore
  const fetchContactInfo = async () => {
    try {
      const idToFetch = buyerId || user?.uid; // Use provided buyerId or current user's ID
      const userDocRef = doc(db, "buyers", idToFetch); // Reference to buyer's document
      const userDocSnap = await getDoc(userDocRef); // Fetch document snapshot

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setContactInfo({
          email: userData.email || "No email available",
          phoneNumber: userData.phoneNumber || "No phone number available",
          address: userData.address || "No address available",
        });
      } else {
        console.log("No document found for this UID:", idToFetch); // Log if no document is found
        setContactInfo({
          email: "No email available",
          phoneNumber: "No phone number available",
          address: "No address available",
        });
      }
    } catch (error) {
      console.error("Error fetching contact information from Firestore:", error); // Log errors
    } finally {
      setLoading(false); // Set loading to false after data fetch
    }
  };

  // Fetch contact information when the component mounts or buyerId changes
  useEffect(() => {
    if (buyerId || user) {
      fetchContactInfo(); // Fetch contact info if buyerId is provided or user is logged in
    }
  }, [buyerId, user]);

  const contactData = [
    {
      label: "Email",
      value: contactInfo.email,
      icon: "mail-outline",
    },
    {
      label: "Phone",
      value: contactInfo.phoneNumber,
      icon: "call-outline",
    },
    {
      label: "Address",
      value: contactInfo.address,
      icon: "location-outline",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONTACT INFORMATION</Text>
      <Text style={styles.subtitle}>Business Contact Details:</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        contactData.map((item, index) => (
          <ContactItem
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 26,
  },
  title: {
    color: "rgba(141, 110, 99, 1)",
    fontFamily: "poppins-semibold",
    fontSize: 19,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "poppins-semibold",
    marginTop: 8,
    color: "rgba(141, 110, 99, 1)",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
  contactDetails: {
    flexDirection: "row",
    flex: 1,
  },
  contactLabel: {
    width: 64,
    fontFamily: "poppins-semibold",
    fontSize: 15,
    color: "#262626",
  },
  contactValue: {
    flex: 1,
    fontFamily: "poppins",
    fontSize: 16,
    color: "#262626",
  },
});

export default ContactInformation;
