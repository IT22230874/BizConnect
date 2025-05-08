import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import PostCard from "./PostCard"; // Assuming PostCard is imported correctly
import { db, auth } from "../../config/FirebaseConfig"; // Firebase and Auth config import
import {
  getDocs,
  collection,
  query,
  where,
  doc as firestoreDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // To detect the logged-in user
import { useAuth } from "../../context/authContext";

export default function MyCollabSpaces() {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null); // To store the current user's UID
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const { user } = useAuth();
  console.log("User:", user);
  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      fetchUserCollabSpaces(user.uid);
    }
  }, [userId]); // Fetch posts when userId is available

  const fetchUserCollabSpaces = async (userId) => {
    setIsLoading(true); // Start loading
    try {
      const q = query(
        collection(db, "CollabSpaces"),
        where("userId", "==", userId)
      ); // Fetch only posts by the logged-in user
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
            profileImage = entrepreneurData.profileImage || profileImage;
            firstName = entrepreneurData.firstName || firstName;
            lastName = entrepreneurData.lastName || lastName;
            jobTitle = entrepreneurData.title || title;
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
    padding: 10,
    backgroundColor: "#fff",
    flex: 1,
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
