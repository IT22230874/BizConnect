import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useIsFocused, useRoute } from "@react-navigation/native"; // Import useRoute to access route params
import ProfileHeader from "../userProfile/buyerprofile/ProfileHeader";
import AboutMe from "../../components/Profile/BuyerProfile/AboutMe";
import ContactInformation from "../../components/Profile/BuyerProfile/ContactInformation";
import SocialMediaLinks from "../../components/Profile/BuyerProfile/SocialMediaLinks";
import { Colors } from "../../constants/Colors";

export default function Profile() {
  const isFocused = useIsFocused(); // Check if the screen is focused

  // You can implement your fetch function here
  const fetchData = () => {
    // Fetch the necessary data to refresh your components
    // This function could be defined in each component (e.g. AboutMe, ContactInformation)
    // and called here to update their states as needed.
  };

  useEffect(() => {
    if (isFocused) {
      fetchData(); // Call the fetch function when the screen is focused
    }
  }, [isFocused]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Pass buyerId to ProfileHeader */}
        <ProfileHeader  />
        <View style={styles.divider} />
        <AboutMe />
        <ContactInformation />
        <View style={styles.divider} />
        <SocialMediaLinks />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 480,
    width: "100%",
    backgroundColor: Colors.primaryColor,
  },
  content: {
    marginTop: 25,
    paddingHorizontal: 16,
  },
  divider: {
    backgroundColor: "#E0E0E0",
    marginVertical: 19,
    height: 1,
  },
});
