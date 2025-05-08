import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ToastAndroid } from "react-native";
import { db } from "../../config/FirebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import RecommendPostCards from "../../components/Home/RecommendPostCards";
import Header from "../../components/Header";

const SavedPosts = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        // Get the saved post IDs
        const savedPostsRef = collection(db, "users", user.uid, "savedPosts");
        const savedPostsSnap = await getDocs(savedPostsRef);
        const postIDs = savedPostsSnap.docs.map((doc) => doc.id);

        // Fetch full post details from `businessList`
        const fullPosts = await Promise.all(
          postIDs.map(async (id) => {
            const postRef = doc(db, "BusinessList", id);
            const postSnap = await getDoc(postRef);
            if (postSnap.exists()) {
              return { id, ...postSnap.data() };
            }
            return null;
          })
        );

        // Filter out any null values (in case a document doesn't exist)
        setSavedPosts(fullPosts.filter((post) => post !== null) || []);
      } catch (error) {
        console.error("Error fetching saved posts: ", error);
        ToastAndroid.show("Error fetching saved posts.", ToastAndroid.BOTTOM);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSavedPosts();
    }
  }, [user]);


  // if (loading) {
  //   return <Text>Loading saved posts...</Text>;
  // }

  return (
    <>
      <Header title={"Saved Posts"} />

      <View style={styles.container}>
        {savedPosts.length > 0 ? (
          <FlatList
            data={savedPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RecommendPostCards business={item} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text>No saved posts found</Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 2, // Add horizontal padding for layout
    justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "white",
  },
});

export default SavedPosts;
