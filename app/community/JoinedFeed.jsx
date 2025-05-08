import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import PostCard from './PostCard'; // Assuming PostCard is imported correctly
import { db } from '../../config/FirebaseConfig'; // Firebase config import
import { getDocs, collection, query, getDoc, where, doc } from 'firebase/firestore'; // Import necessary functions
import { useAuth } from '../../context/authContext'; // Assuming you have a context for authentication

export default function JoinedFeed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const { user } = useAuth(); // Assuming useAuth provides the current user information

  useEffect(() => {
    fetchJoinedCollabSpaces();
  }, []);

  const fetchJoinedCollabSpaces = async () => {
    try {
      // Start loading
      setIsLoading(true);

      // Fetch all CollabSpace posts
      const q = query(collection(db, 'CollabSpaces'));
      const querySnapshot = await getDocs(q);

      // Map through posts to filter and fetch profile images
      const joinedPostsData = await Promise.all(
        querySnapshot.docs.map(async (postDoc) => {
          const postData = { id: postDoc.id, ...postDoc.data() };

          // Check if the user is a member of this post
          if (postData.members?.includes(user.uid)) {
            // Fetch the corresponding entrepreneur profile image using the creator's uid
            const entrepreneurRef = doc(db, 'entrepreneurs', postData.userId); // Use correct reference
            const entrepreneurSnap = await getDoc(entrepreneurRef);

            // Check if the entrepreneur document exists and get the profileImage
            let profileImage = 'https://www.pikpng.com/pngl/b/417-4172348_testimonial-user-icon-color-clipart.png'; // Default image URL
            if (entrepreneurSnap.exists()) {
              profileImage = entrepreneurSnap.data().profileImage || profileImage;
            }

            // Return the post data with the profile image
            return { ...postData, profileImage };
          }
          return null; // Return null if the user is not a member
        })
      );

      // Filter out null entries (posts the user is not a member of)
      const filteredPostsData = joinedPostsData.filter(post => post !== null);
      setPosts(filteredPostsData);
    } catch (error) {
      console.error('Error fetching posts: ', error);
    } finally {
      // Stop loading
      setIsLoading(false);
    }
  };

  const renderPost = ({ item }) => <PostCard post={item} />;

  return (
    <View style={styles.feedContainer}>
      {isLoading ? (
        // Show loading spinner while fetching posts
        <ActivityIndicator size="large" color="#FF8C00" style={styles.loader} />
      ) : posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
        />
      ) : (
        <Text style={styles.noPostsText}>No joined CollabSpaces available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  feedContainer: {
    padding: 10,
    backgroundColor: '#fff',
    flex: 1,
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
