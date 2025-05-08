import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl, // Import RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../../config/FirebaseConfig"; // Update with your actual Firebase config path
import { collection, getDocs, query } from "firebase/firestore";
import BidItem from "../../components/EntBidList/BidItem";
import { Colors } from "../../constants/Colors";

export default function BidPosts() {
  const [bids, setBids] = useState([]);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const bidsCollection = collection(db, "Bids");
        const q = query(bidsCollection);
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

    fetchBids();
  });

  const renderBidItem = ({ item }) => <BidItem item={item} />;

  // Handle refresh function
  const handleRefresh = async () => {
    setRefreshing(true); // Start the refreshing indicator
    await fetchBids(); // Fetch bids again
    setRefreshing(false); // Stop the refreshing indicator
  };

 
  return (
    
      <View>
        <FlatList
          data={bids}
          renderItem={renderBidItem}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </View>
    
  );
}

const styles = StyleSheet.create({
  list: {
    marginBottom: 80, // Adjusted to account for FAB size
  },
});
