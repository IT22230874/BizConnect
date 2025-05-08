// components/Skeleton.js
import React, { useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const HomeSkeleton = ({ width, height, style }) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton layouts
export const SkeletonLayouts = {
  BusinessCard: () => (
    <View style={styles.container}>
      {/* Profile Image Skeleton */}
      <SkeletonPlaceholder>
        <View style={styles.headerSkeleton}>
          {/* Profile Image */}
          <View style={styles.avatarSkeleton} />

          {/* Search Bar */}
          <View style={styles.searchSkeleton} />

          {/* Notification Icon */}
          <View style={styles.notificationSkeleton} />
        </View>
      </SkeletonPlaceholder>
    </View>
  ),
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E1E9EE",
    borderRadius: 4,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 52,
    backgroundColor: "#fff",
  },
  headerSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarSkeleton: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },
  searchSkeleton: {
    flex: 1,
    height: 32,
    borderRadius: 13,
    marginHorizontal: 10,
  },
  notificationSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default Skeleton;
