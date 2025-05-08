import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
} from "react-native";
import { db } from "../../config/FirebaseConfig"; // Update with your actual Firebase config path
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { Colors } from "../../constants/Colors";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { RFValue } from "react-native-responsive-fontsize";

const PlaceBid = ({ item }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [username, setUsername] = useState(""); // State for storing the username
  const auth = getAuth(); // Get the Auth instance
  const entrepreneurId = auth.currentUser ? auth.currentUser.uid : null; // Get logged-in user ID

  // Fetch username on component mount
  useEffect(() => {
    const fetchUsername = async () => {
      if (entrepreneurId) {
        const userDoc = await getDoc(doc(db, "users", entrepreneurId)); // Adjust "users" to your user collection name
        if (userDoc.exists()) {
          setUsername(userDoc.data().username); // Replace with your actual field name
        }
      }
    };

    fetchUsername();
  }, [entrepreneurId]);

  const handlePlaceBid = async () => {
    // Extract numeric value from bidAmount
    const numericBidAmount = bidAmount.replace(/^Rs\. /, "");
  
    // Validate bid amount
    if (!numericBidAmount || isNaN(numericBidAmount) || Number(numericBidAmount) <= 0) {
      Alert.alert("Invalid Bid", "Please enter a valid bid amount.");
      return;
    }
  
    try {
      const bidId = item.id;
      const ownerId = item.userId;
  
      // Store the numeric bid amount
      await addDoc(collection(db, "PlacedBids"), {
        bidId,
        entrepreneurId,
        amount: Number(numericBidAmount), // Convert to a number
        ownerId,
        timestamp: new Date(),
      });
  
      // Create a notification
      await addDoc(collection(db, "BuyerNotifications"), {
        bidId,
        ownerId,
        entrepreneurId,
        message: `You have received a new bid of Rs. ${numericBidAmount} from Entrepreneur ${username}.`,
        timestamp: new Date(),
      });
  
      console.log("Bid placed:", numericBidAmount);
      setBidAmount(""); // Reset input
      Alert.alert("Success", "Your bid has been placed successfully!");
    } catch (error) {
      console.error("Error placing bid:", error);
      Alert.alert("Error", "There was an error placing your bid. Please try again.");
    }
  };
  

  const handleBidChange = (text) => {
    // Remove "Rs. " if already present to avoid double prefixing
    let cleanedText = text.replace(/^Rs\. /, "");

    // Remove non-numeric characters except "."
    cleanedText = cleanedText.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = cleanedText.split(".");
    if (parts.length > 2) {
      cleanedText = parts[0] + "." + parts.slice(1).join("");
    }

    // Ensure it doesn't start with multiple zeros unless it's "0."
    if (cleanedText.startsWith("00")) {
      cleanedText = "0";
    }

    // Format with Rs. prefix
    setBidAmount(cleanedText ? `Rs. ${cleanedText}` : "");
  };

  return (
    <View style={styles.bidInputContainer}>
      <TextInput
        style={styles.bidInput}
        placeholder="Enter your est. cost per item"
        value={bidAmount}
        onChangeText={handleBidChange}
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={handlePlaceBid} style={styles.placeBidButton}>
        <Text style={styles.placeBidButtonText}>Place</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bidInputContainer: {
    position: "relative",
    width: "100%",
  },
  bidInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 80, // Add padding to avoid text overlap with the button
    height: 45,
    fontFamily: "poppins",
    fontSize: RFValue(12),
  },
  placeBidButton: {
    position: "absolute",
    right: 3,
    top: 3,
    backgroundColor: Colors.secondaryColor,
    borderRadius: 17,
    paddingHorizontal: 25,
    paddingVertical: 8,
  },
  placeBidButtonText: {
    color: "white",
    fontFamily: "poppins-bold",
    fontSize: RFValue(12),
  },
});

export default PlaceBid;
