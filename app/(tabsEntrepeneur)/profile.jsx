// EntrepreneurProfile.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ProfileInfo from "../../components/Profile/EntrepreneurProfile/ProfileInfo";
import ContactDetails from "../../components/Profile/EntrepreneurProfile/ContactDetails";
import PreviousWorks from "../../components/Profile/EntrepreneurProfile/PreviousWorks";
import ProfileHeader from "../userProfile/entrepreneurProfile/ProfileHeader";
import Buttons from "../../components/Profile/EntrepreneurProfile/Buttons";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { StatusBar } from "expo-status-bar";

export default function profile() {
  const auth = getAuth();
  const entrepreneurId = auth.currentUser.uid;

  const [entrepreneur, setEntrepreneur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptButton, setShowAcceptButton] = useState(false);
  const [isPublicView, setIsPublicView] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchEntrepreneurProfile = async () => {
      try {
        setLoading(true);

        if (!entrepreneurId) {
          console.log("No entrepreneur ID provided");
          return;
        }

        const docRef = doc(db, "entrepreneurs", entrepreneurId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const entrepreneurData = {
            ...docSnap.data(),
            uid: entrepreneurId,
          };

          setEntrepreneur(entrepreneurData);

          // Check if current user is the entrepreneur
          if (currentUser) {
            const isOwner = currentUser.uid === entrepreneurId;
            setIsPublicView(!isOwner);
            setShowAcceptButton(!isOwner);
          }
        } else {
          console.log("No entrepreneur found!");
          setEntrepreneur(null); // Explicitly set to null when no data is found
        }
      } catch (error) {
        console.error("Error fetching entrepreneur data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrepreneurProfile();
  }, [entrepreneurId, currentUser]);

  return (
    <>
      <StatusBar style="dark" translucent />

      <View style={styles.container}>
        <ScrollView style={styles.container}>
          <ProfileHeader entrepreneurId={entrepreneurId} />
          <View style={styles.content}>
            <Buttons entrepreneurId={entrepreneurId} loading = {loading}></Buttons>

            <ProfileInfo />
            <ContactDetails />
          </View>
          <PreviousWorks
            entrepreneurId={entrepreneurId}
            isPublicView={isPublicView}
          />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
    // paddingHorizontal: 16,
  },
  coverImage: {
    borderRadius: 20,
    width: "100%",
    aspectRatio: 8.62,
  },
  content: {
    padding: 16,
  },
});
