import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, SectionList, FlatList } from "react-native";
import { db } from "../../../config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useLocalSearchParams } from "expo-router";
import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "../../../components/Profile/EntrepreneurProfile/ProfileInfo";
import ContactDetails from "../../../components/Profile/EntrepreneurProfile/ContactDetails";
import PreviousWorks from "../../../components/Profile/EntrepreneurProfile/PreviousWorks";
import LoadingScreen from "../../../components/LoadingScreen";
import Header from "../../../components/Header";
import AcceptBidButton from "../../../components/Profile/EntrepreneurProfile/AcceptBidButton";
import Buttons from "../../../components/Profile/EntrepreneurProfile/Buttons";
import { useAuth } from "../../../context/authContext";

export default function EntrepreneurProfile() {
  // Get both possible parameter names (id and entrepreneurid)
  const params = useLocalSearchParams();
  const entrepreneurId = params.id || params.entrepreneurid;
  // console.log("Entrepreneur ID: ", entrepreneurId);
  const [entrepreneur, setEntrepreneur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptButton, setShowAcceptButton] = useState(false);
  const [isPublicView, setIsPublicView] = useState(true);

  const {user} = useAuth();
  const currentUser = user;


  console.log("Entrepreneur ID: ", currentUser);
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
            uid: entrepreneurId, // Ensure uid is set correctly
          };

          setEntrepreneur(entrepreneurData);

          // Check if current user is the entrepreneur
          if (currentUser) {
            const isOwner = currentUser.uid === entrepreneurId;
            setIsPublicView(!isOwner);
            setShowAcceptButton(!isOwner && currentUser?.role === "buyer"
            );
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (!entrepreneur) {
    return (
      <View style={styles.container}>
        <Header title="Profile Not Found" showNotification={false} />
        <View style={styles.centerContent}>
          <Text>This entrepreneur profile is not available.</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* {isPublicView && (
        <Header
          title={`${entrepreneur?.username || "Entrepreneur"}'s Profile`}
          showNotification={isPublicView}
        />
      )} */}
      <Header
        title={`${entrepreneur?.username || "Entrepreneur"}'s Profile`}
        showNotification
      />

      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <ProfileHeader
            entrepreneurId={entrepreneurId}
            isPublicView={isPublicView}
          />
          <View style={styles.content}>
            <Buttons
              entrepreneurId={entrepreneurId}
              isPublicView={isPublicView}
            />
            <ProfileInfo
              entrepreneurId={entrepreneurId}
              isPublicView={isPublicView}
            />
            <ContactDetails
              entrepreneurId={entrepreneurId}
              isPublicView={isPublicView}
            />
          </View>
          <View>
            <PreviousWorks
              entrepreneurId={entrepreneurId}
              isPublicView={isPublicView}
            />
          </View>
        </ScrollView>

        {/* Show AcceptBidButton only for public view and when appropriate */}
        {isPublicView && showAcceptButton && (
          <AcceptBidButton entrepreneurId={entrepreneurId} />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  // scrollContainer: {
  //   marginTop: -20,
  // },
  content: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
