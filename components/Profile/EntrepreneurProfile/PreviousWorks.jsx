import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { RFValue } from "react-native-responsive-fontsize";
import RecommendPostCards from "../../Home/RecommendPostCards";
import { SkeletonLayouts } from "../../Skeleton/Skeleton";

const PreviousWorks = ({ entrepreneurId, isPublicView = true }) => {
  // console.log("entrepreneurId", entrepreneurId);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);

        const querySnapshot = await getDocs(collection(db, "BusinessList"));
        const posts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter posts to show only the ones that belong to the current user (entrepreneurId)
        const filteredPosts = posts.filter(
          (post) => post.userId === entrepreneurId
        );
        setUserPosts(filteredPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [entrepreneurId]); // Depend on entrepreneurId to refetch when it changes

  return (
    <View style={styles.container}>
      {loading ? (
        // Show skeleton loading state
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {[1,2,3].map((item) => (
            <SkeletonLayouts.BusinessCard key={item} />
          ))}
        </ScrollView>
      ) : userPosts.length ? (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {userPosts.map((item) => (
            <RecommendPostCards
              key={item.id}
              business={item}
              isPublicView={isPublicView}
              entrepreneurId={entrepreneurId}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>No posts available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
  },
  scrollViewContainer: {
    paddingBottom: 10,
  },
  emptyText: {
    fontSize: RFValue(14),
    textAlign: "center",
    color: "#777",
  },
});

export default PreviousWorks;
