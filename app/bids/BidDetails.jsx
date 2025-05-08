import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import PlaceBid from "../../components/EntBidList/PlaceBid";
import { useLocalSearchParams } from "expo-router";
import Header from "../../components/Header";
import { Image } from "react-native";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const BidDetails = () => {
  const { item } = useLocalSearchParams();
  const parsedItem = item ? JSON.parse(item) : {}; // Parse the string back to an object
  const storage = getStorage();
  const [imageUris, setImageUris] = useState([]); // ✅ State to store multiple image URLs

  useEffect(() => {
    const fetchImageUrls = async () => {
      if (parsedItem?.image && Array.isArray(parsedItem.image)) {
        try {
          const storage = getStorage();
          const urls = await Promise.all(
            parsedItem.image.map(async (imagePath) => {
              const imageRef = ref(storage, imagePath);
              return await getDownloadURL(imageRef);
            })
          );
          setImageUris(urls); // ✅ Store all image URLs
        } catch (error) {
          console.error("Error fetching images:", error);
        }
      }
    };

    fetchImageUrls();
  }, [parsedItem.image]);

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

  return (
    <SafeAreaView style={styles.container}>
      <Header title={"Job Details"} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{parsedItem.name}</Text>
            <View style={styles.postedTime}>
              <Ionicons name="time-outline" size={14} color="#656565" />
              <Text style={styles.timeText}>
                {formatTimeAgo(parsedItem.bidClosingTime?.seconds)}
              </Text>
            </View>
          </View>

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

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#656565" />
            <Text style={styles.location}>{parsedItem.address}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.description}>{parsedItem.description}</Text>
          </View>

          {imageUris && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Images</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
              >
                {imageUris.length > 0 ? (
                  imageUris.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.image} />
                  ))
                ) : (
                  <Text>Loading Images...</Text>
                )}
              </ScrollView>
            </View>
          )}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills Required</Text>
            <View style={styles.skillTags}>
              <View style={styles.skillTag}>
                <Text style={styles.skillTagText}>Project Management</Text>
              </View>
              <View style={styles.skillTag}>
                <Text style={styles.skillTagText}>Communication</Text>
              </View>
            </View>
          </View> */}
        </View>
      </ScrollView>

      <View style={styles.bidSection}>
        <Text style={styles.sectionTitle}>
          Place Your Proposal
          <Text style={styles.cardInputSubTitle}> /per item</Text>
        </Text>

        <PlaceBid item={parsedItem} />
      </View>
    </SafeAreaView>
  );
};
//  Estimate Cost /
//                   <Text style={styles.cardInputSubTitle}>per product</Text>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: RFValue(18),
    fontFamily: "poppins-semibold",
    color: "#333",
    marginBottom: 8,
  },
  postedTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: RFValue(12),
    color: "#656565",
    marginLeft: 4,
    fontFamily: "poppins",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
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
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  location: {
    fontSize: RFValue(12),
    color: "#656565",
    marginLeft: 4,
    fontFamily: "poppins",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: RFValue(14),
    fontFamily: "poppins-semibold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: RFValue(13),
    color: "#333",
    lineHeight: 20,
    fontFamily: "lato",
  },
  skillTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillTagText: {
    fontSize: RFValue(12),
    color: "#1967d2",
    fontFamily: "poppins",
  },
  bidSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,

    width: "100%",
    // marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  cardInputSubTitle: {
    fontSize: RFValue(12),
    color: "#656565",
    fontFamily: "poppins",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  image: { width: 200, height: 200, resizeMode: "cover", borderRadius: 8 },
});

export default BidDetails;
