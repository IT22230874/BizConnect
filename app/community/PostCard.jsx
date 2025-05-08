import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";

export default function PostCard({ post }) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push({
      pathname: "/community/CollabSpace",
      params: { postId: post.id, profileImage: post.profileImage, userName: post.userName, location: post.location }, // Pass only the post ID
    });
  };
  // console.log(post);
  return (
    <View style={styles.cardContainer}>
      {/* Image with Overlay */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: post.featuredImage }} style={styles.cardImage} />
        <View style={styles.overlay}>
          {/* Publisher Info at the Top */}
          <View style={styles.publisherInfo}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/userProfile/entrepreneurProfile/[entrepreneurid]",
                  params: { id: post.userId },
                })
              }
            >
              <Image
                source={{ uri: post.profileImage }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <View style={styles.publisherDetails}>
              <Text style={styles.publisherName}>{post.userName}</Text>
              {post.location && post.jobTitle && (
                <Text style={styles.publisherLocation}>{post.jobTitle}| {post.location}</Text>
              )}
              <Text style={styles.postDate}>{post.createdAt}</Text>
            </View>
          </View>
          {/* Title and Button at the Bottom */}
          <View style={styles.bottomContent}>
            <Text style={styles.cardTitle}>{post.title}</Text>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={handleViewDetails}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.primaryColor,
    borderRadius: 9,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderColor: "#EFEFF0",
    borderWidth: 1,
    width: "100%",
    marginVertical: 8,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: 24,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 15,
    justifyContent: "space-between",
  },
  publisherInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 25,
    marginRight: 10,
  },
  publisherDetails: {
    justifyContent: "center",
    gap: 2, 
  },
  publisherName: {
    fontSize: RFValue(11),
    fontFamily: "lato-bold",
    color: "#fff",
  },
  publisherLocation: {
    fontSize: RFValue(9),
    color: "#fff",
    fontFamily: "lato",
  },
  postDate: {
    fontSize: RFValue(9),
    color: "#fff",
    fontFamily: "lato",
  },
  bottomContent: {
    alignItems: "flex-start",
  },
  cardTitle: {
    color: "#fff",
    fontSize: RFValue(14),
    fontFamily: "lato-bold",
    marginBottom: 10,
  },
  detailsButton: {
    backgroundColor: Colors.secondaryColor,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: RFValue(12),
    fontFamily: "lato-bold",
  },
});
