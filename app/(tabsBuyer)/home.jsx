import {
  View,
  Text,
  ScrollView,
  Button,
  StyleSheet,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import Header from "../../components/Home/Header";
import Slider from "../../components/Home/Slider";
import Category from "../../components/Home/Category";
import PopularBusiness from "../../components/Home/PopularBusiness";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/authContext";
import RecommendPost from "../../components/Home/RecommendPost";
import { router } from "expo-router";

export default function Home() {
  const { signout, user } = useAuth(); // Get signout function from Auth context
  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  const handleLogout = async () => {
    await signout(); // Call the signout function
  };

  // Function to handle refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate a network request or data fetching
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating a 2 seconds delay
    setRefreshing(false);
    // Fetch or refresh your data here if necessary
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <Header />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Slider */}
        <Slider />
        {/* Category */}
        <Category />
        {/* Popular Business List */}
        <PopularBusiness />
        {/* <PopularBusiness />
        <PopularBusiness /> */}
        <RecommendPost />

        {/* Logout Button */}

        <View>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Ensures header is above other content
  },
  scrollContent: {
    marginTop: 100,
    paddingTop: 80, // Adjust this based on your header height to prevent overlapping
    paddingBottom: 120,
    backgroundColor: Colors.primaryColor,
  },
});
