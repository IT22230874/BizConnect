import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import RecommendPostCards from "../../components/Home/RecommendPostCards";
import { db } from "../../config/FirebaseConfig";
import { RFValue } from "react-native-responsive-fontsize";
import Header from "../../components/Header";
import { Colors } from "../../constants/Colors";

const SearchPostsScreen = () => {
  const params = useLocalSearchParams();
  const searchQuery = String(params?.query || "")
    .trim()
    .toLowerCase();
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "BusinessList"));
        const posts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // console.log("Fetched Posts:", posts.length);
        // console.log("Search Query:", `"${searchQuery}"`);

        const searchFiltered = posts.filter((post) => {
          const about = String(post?.about || "").toLowerCase();
          const content = String(post?.content || "").toLowerCase();
          return (
            searchQuery &&
            (about.includes(searchQuery) || content.includes(searchQuery))
          );
        });

        // console.log("Filtered Posts:", searchFiltered.length);
        setFilteredPosts(searchFiltered);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    if (searchQuery) {
      fetchPosts();
    }
  }, [searchQuery]);

  return (
    <>
      <Header title="Search Results" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <RecommendPostCards key={post.id} business={post} />
            ))
          ) : (
            <Text style={styles.emptyText}>No posts found.</Text>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 2,
    // paddingTop: 10,
    backgroundColor: Colors.primaryColor,
  },
  scrollViewContainer: {
    paddingBottom: 10,
  },
  emptyText: {
    fontSize: RFValue(14),
    textAlign: "center",
    color: "#777",
    flex: 1,
    justifyContent: "center",

    alignItems: "center",
    padding: 20,
  },
});

export default SearchPostsScreen;
