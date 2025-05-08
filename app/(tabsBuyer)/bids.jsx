import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { db, auth } from "../../config/FirebaseConfig"; // Update with your actual Firebase config path
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Colors } from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { getStorage, ref, deleteObject } from "firebase/storage"; // Import the necessary storage functions
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Header from "../../components/Header";

export default function Bids() {
  const [bids, setBids] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBidIds, setExpandedBidIds] = useState([]);
  const [visibleMenu, setVisibleMenu] = useState(null); // To track which menu is visible
  const router = useRouter();
  const userId = auth.currentUser?.uid;

  const fetchBids = async () => {
    if (!userId) {
      console.error("No user is currently logged in.");
      return;
    }

    try {
      const bidsCollection = collection(db, "Bids");
      const q = query(bidsCollection, where("userId", "==", userId));
      const bidsSnapshot = await getDocs(q);
      const bidsList = bidsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBids(bidsList);
    } catch (error) {
      console.error("Error fetching bids: ", error);
    }
  };

  // Use useFocusEffect to refresh the bids whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBids();
    }, [userId])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBids();
    setRefreshing(false);
  };

  const toggleExpanded = (bidId) => {
    setExpandedBidIds((prevExpanded) =>
      prevExpanded.includes(bidId)
        ? prevExpanded.filter((id) => id !== bidId)
        : [...prevExpanded, bidId]
    );
  };

  const handleEdit = (bidId) => {
    router.push(`/bids/addEditBid?bidId=${bidId}`); // Pass the bidId in the query parameter
    setVisibleMenu(null); // Close menu after action
  };

  const storage = getStorage(); // Initialize Firebase Storage

  const handleDelete = (bidId, imageUrl) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this bid?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              // Check if imageUrl exists before attempting to delete it
              if (imageUrl) {
                const imageRef = ref(storage, imageUrl); // Create a reference to the image in storage
                await deleteObject(imageRef); // Delete the image
              }

              await deleteDoc(doc(db, "Bids", bidId)); // Now delete the bid document
              handleRefresh(); // Refresh the list after deletion
              setVisibleMenu(null); // Close menu after action
            } catch (error) {
              console.error("Error deleting bid:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const renderBidItem = ({ item }) => {
    const isExpanded = expandedBidIds.includes(item.id); // Check if this item is expanded

    return (
      <View style={styles.card}>
        <View style={styles.moreMenu}>
          <TouchableOpacity onPress={() => setVisibleMenu(item.id)}>
            <Ionicons name="ellipsis-vertical" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {visibleMenu === item.id && (
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={styles.menuOverlayBackground}
              onPress={() => setVisibleMenu(null)} // Close menu on tapping outside
            />
            <View style={styles.menuOptions}>
              <TouchableOpacity
                onPress={() => handleEdit(item.id)}
                style={styles.menuOption}
              >
                <Ionicons
                  name="pencil"
                  size={20}
                  color={Colors.secondaryColor}
                />
                <Text style={styles.menuOptionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.image)}
                style={styles.menuOption}
              >
                <Ionicons name="trash" size={20} color="red" />
                <Text style={styles.menuOptionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.imageContainer}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.cardImage} />
          )}
          <View style={styles.cardClosingTimeContainer}>
            <Ionicons name="time-outline" size={14} color="white" />
            <Text style={styles.cardClosingTimeText}>
              {new Date(item.bidClosingTime?.seconds * 1000).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.cardAddressContainer}>
            <Ionicons name="location-outline" size={16} color="#555" />
            <Text style={styles.cardAddress}>{item.address}</Text>
          </View>

          <Pressable onPress={() => toggleExpanded(item.id)}>
            <Text
              style={styles.cardDescription}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {item.description}
            </Text>
          </Pressable>

          {item.description.length > 100 && (
            <Text
              onPress={() => toggleExpanded(item.id)}
              style={styles.readMoreText}
            >
              {isExpanded ? "Read Less" : "Read More"}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.primaryColor }}>
      <Header title="Bids" showBackButton={false} />

      <FlatList
        data={bids}
        renderItem={renderBidItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/bids/addEditBid")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontFamily: "roboto-bold",
    marginBottom: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Colors.secondaryColor,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  list: {
    marginBottom: 80,
  },
  moreMenu: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    zIndex: 10, // Ensure it appears above other elements
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  menuOverlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuOptions: {
    position: "absolute",
    top: 35, // Adjust based on the height of your button
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    padding: 10,
    zIndex: 10, // Ensure it appears above other elements
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuOptionText: {
    fontSize: 14,
    color: Colors.secondaryColor,
    marginLeft: 8, // Space between icon and text
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  imageContainer: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 186,
    borderRadius: 8,
  },
  cardClosingTimeContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cardClosingTimeText: {
    color: "white",
    fontSize: RFValue(10.5),
    fontFamily: "poppins",
    marginLeft: 5,
    marginTop: 2,
  },
  cardContent: {
    flexDirection: "column",
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "poppins-semibold",
    marginBottom: 5,
  },
  cardAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  cardAddress: {
    fontSize: 14,
    color: "#6D4C41",
    fontFamily: "poppins",
    marginLeft: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#333",
    fontFamily: "poppins",
    lineHeight: 20,
  },
  readMoreText: {
    color: Colors.secondaryColor,
    fontFamily: "poppins",
    marginBottom: 5,
    fontSize: 14,
  },
});
