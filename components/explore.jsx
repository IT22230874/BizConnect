import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import SearchBar from "./SearchBar";
import RecommendPost from "./Home/RecommendPost";
import { Colors } from "../constants/Colors";

export default function Explore() {
  const [refreshing, setRefreshing] = useState(false);

  // Function to handle refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network request
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <SearchBar />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={100} // Offset to ensure it appears below the header
          />
        }
      >
        <View style={styles.content}>
          <RecommendPost />
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
    zIndex: 1, // Ensure header is above all other content
  },
  scrollContent: {
    paddingTop: 80, // Add enough padding to push the content below the header
    backgroundColor: Colors.primaryColor,
  },
  content: {
    flex: 1,
  },
});
