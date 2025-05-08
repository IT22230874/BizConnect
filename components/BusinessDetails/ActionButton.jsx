import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function ActionButton({ entrepreneurId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [entrepreneurDetails, setEntrepreneurDetails] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchEntrepreneurDetails = async () => {
      if (!entrepreneurId) return;

      try {
        const userRef = doc(db, "entrepreneurs", entrepreneurId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setEntrepreneurDetails({ ...userSnap.data(), uid: entrepreneurId });
        }
      } catch (error) {
        console.error("Error fetching entrepreneur details:", error);
      }
    };

    fetchEntrepreneurDetails();
  }, [entrepreneurId]);

  if (user?.uid === entrepreneurId) {
    return null; // Hide button for the user's own profile
  }

  const onPressHandler = () => {
    if (entrepreneurId) {
      router.push({
        pathname: "/profile/entrepreneurProfile/[entrepreneurid]",
        params: { id: entrepreneurId },
      });
    } else {
      console.error("Entrepreneur ID is missing.");
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onPressHandler}>
      <View style={styles.buttonContent}>
        <Ionicons name="person-outline" size={20} color="white" />
        <Text style={styles.buttonText}>View Profile</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 29,
    left: 18,
    right: 18,
    backgroundColor: Colors.secondaryColor,
    borderRadius: 28,
    padding: 19,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "lato-bold",
    fontSize: RFValue(12),
    color: "white",
    marginLeft: 10,
  },
});
