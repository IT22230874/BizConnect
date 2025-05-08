import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { db } from "../../../config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import ProfileHeader from "./ProfileHeader";
import AboutMe from "../../../components/Profile/BuyerProfile/AboutMe";
import ContactInformation from "../../../components/Profile/BuyerProfile/ContactInformation";
import SocialMediaLinks from "../../../components/Profile/BuyerProfile/SocialMediaLinks";
import Header from "../../../components/Header"; // Assuming you want the Header component
import LoadingScreen from "../../../components/LoadingScreen";
import { Colors } from "../../../constants/Colors";

export default function BuyerProfile() {
  const { buyerid } = useLocalSearchParams(); // Get the buyer ID from the route
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerProfile = async () => {
      try {
        const docRef = doc(db, "buyers", buyerid); // Fetch from the correct collection
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBuyer(docSnap.data());
        } else {
          console.log("No buyer found!");
        }
      } catch (error) {
        console.error("Error fetching buyer data: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (buyerid) {
      fetchBuyerProfile();
    }
  }, [buyerid]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Header title={`${buyer?.firstName}'s Profile`} showNotification={true} />
      <View style={styles.container}>
        {buyer ? (
          <>
            <ScrollView>
              <View style={styles.content}>
                <ProfileHeader buyerId={buyerid} />
                <View style={styles.divider} />
                <AboutMe buyerId={buyerid} />
                <ContactInformation buyerId={buyerid} />
                <View style={styles.divider} />
                <SocialMediaLinks buyerId={buyerid} />
              </View>
            </ScrollView>
          </>
        ) : (
          <Text style={styles.noBuyerText}>No buyer found.</Text>
        )}
      </View>
    </>
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
    marginTop: 0,
    paddingHorizontal: 16,
  },
  divider: {
    backgroundColor: "#E0E0E0",
    marginVertical: 19,
    height: 1,
  },
  noBuyerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontSize: 16,
  },
});
