import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, Alert, StyleSheet, View } from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../config/FirebaseConfig";
import { Colors } from "../../../constants/Colors"; // Assuming you have a Colors file for your theme
import Loading from "../../Loading";
import { RFValue } from "react-native-responsive-fontsize";

export default function AcceptBidButton({ entrepreneurId }) {
  const [loading, setLoading] = useState(false);
  const [bidAccepted, setBidAccepted] = useState(false); // New state for bid status

  useEffect(() => {
    // Check if the bid is already accepted when the component mounts
    const checkBidStatus = async () => {
      try {
        if (!entrepreneurId) {
          console.error("Entrepreneur ID is undefined");
          return;
        }

        // Query to get the bidId from PlacedBids collection where entrepreneurId matches
        const q = query(
          collection(db, "PlacedBids"),
          where("entrepreneurId", "==", entrepreneurId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("No bids found for this entrepreneur.");
          return;
        }

        const bidDoc = querySnapshot.docs[0];
        const bidData = bidDoc.data();

        // Check the status of the bid
        if (bidData.status === "accepted") {
          setBidAccepted(true); // If the bid is already accepted, update the state
        }
      } catch (error) {
        console.error("Error checking bid status: ", error);
      }
    };

    checkBidStatus();
  }, [entrepreneurId]);

  const acceptBid = async () => {
    try {
      setLoading(true);

      if (!entrepreneurId) {
        console.error("Entrepreneur ID is undefined");
        Alert.alert("Error", "Entrepreneur ID is missing.");
        setLoading(false);
        return;
      }

      // Query to get the bidId from PlacedBids collection where entrepreneurId matches
      const q = query(
        collection(db, "PlacedBids"),
        where("entrepreneurId", "==", entrepreneurId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No bids found for this entrepreneur.");
        Alert.alert("Error", "No bids found for this entrepreneur.");
        setLoading(false);
        return;
      }

      const bidDoc = querySnapshot.docs[0];
      const bidData = bidDoc.data();
      const bidId = bidData.bidId;

      // Fetch the owner's name using the ownerId (which is the uid in this case)
      const ownerId = bidData.ownerId; // Owner ID from bid data
      const ownerDocRef = doc(db, "buyers", ownerId); // Assuming the buyers are stored in the 'buyers' collection
      const ownerDocSnap = await getDoc(ownerDocRef);

      let ownerName = "Unknown"; // Default value
      if (ownerDocSnap.exists()) {
        const ownerData = ownerDocSnap.data();
        ownerName = ownerData.username || "Unknown"; // Assuming 'username' field holds the owner's name
      }

      // Update the bid status in `PlacedBids` collection
      const bidRef = doc(db, "PlacedBids", bidDoc.id);
      await updateDoc(bidRef, {
        status: "accepted",
        timestamp: new Date(),
      });

      // Find and delete the corresponding notification from `BuyerNotifications`
      const buyerNotificationQuery = query(
        collection(db, "BuyerNotifications"),
        where("bidId", "==", bidId),
        where("ownerId", "==", bidData.ownerId)
      );

      const buyerNotificationSnapshot = await getDocs(buyerNotificationQuery);

      if (!buyerNotificationSnapshot.empty) {
        const notificationDoc = buyerNotificationSnapshot.docs[0];
        const notificationId = notificationDoc.id;

        // Delete the notification
        await deleteDoc(doc(db, "BuyerNotifications", notificationId));
      } else {
        console.log("No matching notification found in BuyerNotifications.");
      }
console.log(" ownerId: ",bidData.ownerId);

      // Add a new notification to the `EntrepreneurNotifications` collection
      const entrepreneurNotification = {
        entrepreneurId: entrepreneurId,
        buyerId: bidData.ownerId,
        
        bidId: bidId,
        message: `Your bid has been accepted by ${ownerName}`, // Using the ownerName variable
        timestamp: new Date(),
        status: "unread", // Optionally track the read/unread status
      };

      await addDoc(
        collection(db, "EntrepreneurNotifications"),
        entrepreneurNotification
      );

      // Notify the entrepreneur
      Alert.alert("Bid Accepted", "The bid has been successfully accepted!");

      // Set the bidAccepted state to true after accepting
      setBidAccepted(true);
    } catch (error) {
      console.error("Error in acceptBid: ", error);
      Alert.alert("Error", "An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  // If the bid has been accepted, hide the button
  if (bidAccepted) {
    return null; // Hide the button if the bid is already accepted
  }

  return (
    <View>
      {loading ? (
        <View style={styles.loading}>
          <Loading />
        </View>
      ) : (
        <TouchableOpacity style={styles.fab} onPress={acceptBid}>
          <Text style={styles.fabText}>Accept Bid</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    bottom: 16,
    left: 18,
    right: 18,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    zIndex: 1, // Optional: use zIndex if you suspect other elements are overlapping
  },
  fab: {
    position: "absolute",
    bottom: 16,
    left: 18,
    right: 18,
    backgroundColor: Colors.secondaryColor, // Replace with your color
    borderRadius: 28,
    padding: 19,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, // Optional: use zIndex if you suspect other elements are overlapping
  },
  fabText: {
    color: "white",
    fontSize: RFValue(14),
    fontFamily: "lato-bold",
  },
});
