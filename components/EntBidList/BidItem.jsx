import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "../../constants/Colors";
import PlaceBid from "./PlaceBid";
import { RFValue } from "react-native-responsive-fontsize";
import { useExpoRouter } from "expo-router/build/global-state/router-store";

const BidItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const router = useExpoRouter();

  useEffect(() => {
    // console.log("Image URL:", item.image);
  }, [item.image]);

  const formatTimeAgo = (seconds) => {
    const now = new Date();
    const postTime = new Date(seconds * 1000);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };
  const handlePress = () => {
    router.push({
      pathname: "/bids/BidDetails",
      params: { item: JSON.stringify(item) }, // Stringify the object
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.name}</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#656565" />
          <Text style={styles.location}>{item.address} | </Text>
          <View style={styles.postedTime}>
            <Ionicons name="time-outline" size={14} color="#656565" />
            <Text style={styles.timeText}>
              {formatTimeAgo(item.bidClosingTime?.seconds)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Fixed Price</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Est. Time: 2-4 weeks</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>5-10 proposals</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: RFValue(14),
    fontFamily: "poppins-semibold",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  postedTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: RFValue(11),
    color: "#656565",
    marginLeft: 4,
    fontFamily: "poppins",
  },
  description: {
    fontSize: RFValue(12),
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: "lato",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: RFValue(11),
    color: "#656565",
    marginLeft: 4,
    fontFamily: "poppins",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  tags: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(170, 106, 28, 0.09)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: RFValue(11),
    color: "#656565",
    fontFamily: "poppins-semibold",
  },
});


export default BidItem;
