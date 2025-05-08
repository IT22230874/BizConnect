import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Importing Ionicons
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/FirebaseConfig"; // Firestore instance
import { useAuth } from "../../../context/authContext"; // Importing useAuth
import { RFValue } from "react-native-responsive-fontsize";
import { SkeletonLayouts } from "../../Skeleton/Skeleton";

// Component for rendering individual contact details
const ContactItem = ({ label, value, iconName }) => (
  <View style={styles.contactItem}>
    <Ionicons
      name={iconName}
      size={20} // Slightly larger icon for better visibility
      color="#6D4C41"
      style={styles.contactIcon}
    />
    <View style={styles.contactInfo}>
      <Text style={styles.contactLabel}>{label}:</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
  </View>
);

// ContactDetails component that fetches entrepreneur's details by ID
const ContactDetails = ({ entrepreneurId }) => {
  const { user } = useAuth(); // Get the currently logged-in user
  const [contactInfo, setContactInfo] = useState([]); // State to hold contact details
  const [loading, setLoading] = useState(true); // Loading state

  // Function to fetch contact details from Firestore
  const fetchContactDetails = async () => {
    const idToFetch = entrepreneurId || user?.uid; // Use provided entrepreneurId or current user's ID
    if (idToFetch) {
      try {
        // Reference to the entrepreneur's document in Firestore
        const entrepreneurDocRef = doc(db, "entrepreneurs", idToFetch);
        const entrepreneurDocSnap = await getDoc(entrepreneurDocRef);

        if (entrepreneurDocSnap.exists()) {
          const entrepreneurData = entrepreneurDocSnap.data();

          // Combine city, streetName, and streetNumber to create a full address
          const formatAddress = (data) => {
            // Check if the address is stored as an object
            if (data.address && typeof data.address === "object") {
              const { streetNumber, streetName, city } = data.address;
              return [streetNumber, streetName, city]
                .filter(Boolean) // Remove any null or undefined values
                .join(", ");
            }

            // If stored as separate fields
            return [data.streetNumber, data.streetName, data.city]
              .filter(Boolean) // Remove any null or undefined values
              .join(", ");
          };

          const contactData = [
            {
              iconName: "call-outline",
              label: "Phone",
              value: entrepreneurData.phoneNumber || "Not provided",
            },
            {
              iconName: "location-outline",
              label: "Address",
              value: formatAddress(entrepreneurData) || "Not provided",
              // Pass the full address object for editing
              rawValue: entrepreneurData.address || {
                streetNumber: entrepreneurData.streetNumber,
                streetName: entrepreneurData.streetName,
                city: entrepreneurData.city,
              },
            },
          ];
          setContactInfo(contactData); // Update state with fetched contact details
        } else {
          console.log("No such entrepreneur document!");
          setContactInfo([
            { label: "Error", value: "No contact details found." },
          ]);
        }
      } catch (error) {
        console.error("Error fetching contact details: ", error);
        setContactInfo([
          { label: "Error", value: "Failed to fetch contact details." },
        ]);
      } finally {
        setLoading(false); // Set loading to false after data fetch
      }
    }
  };

  // Fetch contact details when entrepreneurId is available
  useEffect(() => {
    setLoading(true);
    fetchContactDetails();
  }, [entrepreneurId, user]); // Added user to dependency array
  if (loading) {
    return <SkeletonLayouts.ContactDetails />;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Business Contact Details:</Text>
      {loading ? (
        <Text>Loading contact details...</Text>
      ) : contactInfo.length > 0 ? (
        contactInfo.map((item, index) => (
          <ContactItem
            key={index}
            iconName={item.iconName}
            label={item.label}
            value={item.value}
          />
        ))
      ) : (
        <Text>No contact details available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginBottom: -16,
    paddingHorizontal: 4,
  },
  title: {
    color: "rgba(141, 110, 99, 1)",
    fontFamily: "lato-bold",
    fontSize: RFValue(13),
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactIcon: {
    width: 24, // Increase the icon size for better visibility
    height: 24, // Ensure the icon is properly proportioned
    marginRight: 12, // Increase space between icon and text
  },
  contactInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center", // Centers text within the row
  },
  contactLabel: {
    minWidth: 70, // Set a consistent width to align the label
    color: "#262626",
    fontFamily: "lato-bold",
    fontSize: RFValue(13),
  },
  contactValue: {
    flex: 1,
    color: "#262626",
    fontFamily: "lato",
    fontSize: RFValue(12),
    textAlignVertical: "center", // Ensures the value text is vertically aligned
  },
});

export default ContactDetails;
