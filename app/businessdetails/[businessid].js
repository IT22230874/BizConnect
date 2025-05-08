import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import Intro from "../../components/BusinessDetails/Intro";
import ActionButton from "../../components/BusinessDetails/ActionButton";
import About from "../../components/BusinessDetails/About";
import LoadingScreen from "../../components/LoadingScreen";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/authContext";

export default function BusinessDetail() {
  const { user } = useAuth(); // Access the authenticated user from context
  const { businessid } = useLocalSearchParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetBusinessDetailsById();
  }, []);

  const GetBusinessDetailsById = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "BusinessList", businessid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setBusiness(docSnap.data());
      } else {
        console.log("No such document");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <View style={styles.container}>
          <StatusBar translucent style="dark" />
          {business && (
            <>
              {/* Intro */}
              <Intro business={business} />
              {/* About Section */}
              <About business={business} />
              {/* Action Button */}
              <ActionButton entrepreneurId={business.userId} />
              </>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Ensure the content starts at the top
  },
});
