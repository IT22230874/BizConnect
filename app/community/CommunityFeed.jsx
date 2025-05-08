import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import PostCard from "./PostCard"; // Assuming PostCard is imported correctly
import { db } from "../../config/FirebaseConfig"; // Firebase config import
import {
  getDocs,
  collection,
  query,
  doc as firestoreDoc,
  getDoc,
} from "firebase/firestore"; // Fixed doc import conflict
import { useFocusEffect } from "@react-navigation/native"; // For automatic refresh
import { Colors } from "../../constants/Colors";

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchCollabSpacePosts();
  }, []);
  const fetchCollabSpacePosts = async () => {
    setIsLoading(true); // Start loading
    try {
      // Fetch all CollabSpace posts
      const q = query(collection(db, "CollabSpaces"));
      const querySnapshot = await getDocs(q);
  
      // Map through posts to add profile image, name, and address from entrepreneurs collection
      const postsData = await Promise.all(
        querySnapshot.docs.map(async (postDoc) => {
          const postData = { id: postDoc.id, ...postDoc.data() };

          // Fetch the corresponding entrepreneur profile using the creator's uid
          const entrepreneurRef = firestoreDoc(
            db,
            "entrepreneurs",
            postData.userId
          );
          const entrepreneurSnap = await getDoc(entrepreneurRef);

          // Default values
          let profileImage =
            "https://www.pikpng.com/pngl/b/417-4172348_testimonial-user-icon-color-clipart.png";
          let firstName = "Unknown";
          let lastName = "";
          let jobTitle = "";
          let address = "Not provided";

          // Check if the entrepreneur document exists and get the required data
          if (entrepreneurSnap.exists()) {
            const entrepreneurData = entrepreneurSnap.data();
            console.log("Entrepreneur data: ", entrepreneurData);
            profileImage = entrepreneurData.profileImage || profileImage;
            firstName = entrepreneurData.firstName || firstName;
            lastName = entrepreneurData.lastName || lastName;
            jobTitle = entrepreneurData.title || "";
            address = entrepreneurData.address?.city || address?.city;
          }

          // Return the post data with the additional fields
          return {
            ...postData,
            profileImage,
            userName: `${firstName} ${lastName}`,
            location: address,
            jobTitle,
          };
        })
      );
  
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setIsLoading(false); // Stop loading once data is fetched
    }
  };
  

  // useFocusEffect will refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchCollabSpacePosts();
    }, [])
  );

  const renderPost = ({ item }) => <PostCard post={item} />;

  return (
    <View style={styles.feedContainer}>
      {isLoading ? (
        // Show loading spinner while fetching posts
        <ActivityIndicator size="large" color="#FF8C00" style={styles.loader} />
      ) : // Render posts once loading is finished
      posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
        />
      ) : (
        <Text style={styles.noPostsText}>No posts available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  feedContainer: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 6,
  },
  noPostsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
