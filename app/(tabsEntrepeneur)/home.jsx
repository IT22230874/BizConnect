import { View, Text, ScrollView, Button, StyleSheet, RefreshControl } from "react-native";
import React, { useState } from "react";
import Header from "../../components/Home/Header";
import Slider from "../../components/Home/Slider";
import Category from "../../components/Home/Category";
import PopularBusiness from "../../components/Home/PopularBusiness";
import RecommendPost from "../../components/Home/RecommendPost";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/authContext";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { StatusBar } from "expo-status-bar";

export default function Home() {
  const { signout, user } = useAuth(); // Get signout function from Auth context
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await signout(); // Call the signout function
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network request
    setRefreshing(false);
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={170} // Offset to ensure it appears below the header
          />
        }
      >
        {/* Slider */}
        <Slider />
        {/* Category */}
        <Category />
        {/* Popular Business List */}
        <PopularBusiness />

        <RecommendPost />
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
    zIndex: 1,
  },
  scrollContent: {
    width: "100%",
    marginTop: 100,
    paddingTop: 6,
    paddingBottom: 110,
    backgroundColor: Colors.primaryColor,
  },
});
