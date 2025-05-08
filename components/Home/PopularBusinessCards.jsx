import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";

export default function PopularBusinessCards({ business }) {
  const router = useRouter();

  // Get the image source, handling both array and single imageUrl cases
  const imageSource = useMemo(() => {
    if (business?.images && Array.isArray(business.images) && business.images.length > 0) {
      return { uri: business.images[0] };
    }
    return { uri: business?.imageUrl };
  }, [business?.images, business?.imageUrl]);

  return (
    <TouchableOpacity
      onPress={() => router.push("/businessdetails/" + business?.id)}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <TouchableOpacity style={styles.heartContainer}>
          <Ionicons name="heart-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <Image source={imageSource} style={styles.image} />
        <View style={styles.infoContainer}>
          <View style={styles.blurContainer} />
          <Text style={styles.name}>{business?.name}</Text>
          <View style={styles.addressContainer}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#fff"
              style={styles.locationIcon}
            />
            <Text style={styles.address}>{business?.address}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Image
                source={require("../../assets/images/star.png")}
                style={{ width: 10, height: 10, marginRight: 5 }}
              />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
            <Text style={styles.category}>{business?.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginLeft: 20,
    marginBottom: 13,
    backgroundColor: "#fff",
    borderRadius: 26,
    borderWidth: 0,
    width: 250,
    height: 356,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowColor: "#000",
    shadowOpacity: 0.85,
    shadowRadius: 14,
    elevation: 5,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  heartContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  infoContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(177, 176, 176, 0.3)",
    blurRadius: 50,
  },
  name: {
    fontFamily: "lato-bold",
    textTransform: "capitalize",
    fontSize: RFValue(15),
    color: "#fff",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  address: {
    fontFamily: "lato",
    fontSize: RFValue(11),
    textTransform: "capitalize",
    color: "#fff",
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    width: "100%",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#fff",
    fontFamily: "roboto-bold",
  },
  category: {
    fontFamily: "roboto-medium",
    backgroundColor: Colors.primaryColor,
    color: "#000",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 10,
    textTransform: "capitalize",
  },
  locationIcon: {
    marginRight: 5,
  },
});