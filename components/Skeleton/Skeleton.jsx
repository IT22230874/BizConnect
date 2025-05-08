// components/Skeleton.js
import React, { useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const Skeleton = ({ width, height, style }) => {
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
  Icon: ({ size = 24, style }) => (
    <Skeleton
      width={size}
      height={size}
      style={[
        {
          borderRadius: size / 2,
        },
        style,
      ]}
    />
  ),
  // For profile headers
  ProfileHeader: () => (
    <View style={styles.container}>
      <Skeleton width="100%" height={160} style={styles.coverImage} />
      <View style={styles.profileContent}>
        <Skeleton width={105} height={105} style={styles.profileImage} />
        <View style={styles.textContent}>
          <Skeleton width={200} height={24} style={styles.nameText} />
          <Skeleton width={150} height={16} style={styles.titleText} />
        </View>
      </View>
    </View>
  ),

  // For list items
  ListItem: () => (
    <View style={styles.listItem}>
      <Skeleton width={50} height={50} style={styles.avatar} />
      <View style={styles.listItemContent}>
        <Skeleton width={200} height={20} style={styles.titleLine} />
        <Skeleton width={150} height={16} style={styles.subtitleLine} />
      </View>
    </View>
  ),

  // For cards
  Card: () => (
    <View style={styles.card}>
      <Skeleton width="100%" height={200} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Skeleton width="90%" height={24} style={styles.cardTitle} />
        <Skeleton width="70%" height={16} style={styles.cardSubtitle} />
        <Skeleton width="60%" height={16} style={styles.cardText} />
      </View>
    </View>
  ),

  // For text content
  TextBlock: () => (
    <View style={styles.container}>
      <View style={styles.aboutSection}>
        {/* Title skeleton */}
        <Skeleton width={100} height={16} style={styles.titleSkeleton} />

        {/* Content skeleton - multiple lines */}
        <View style={styles.contentSkeleton}>
          <Skeleton width={"100%"} height={16} style={styles.textLine} />
          <Skeleton width={"90%"} height={16} style={styles.textLine} />
          {/* <Skeleton width={"95%"} height={16} style={styles.textLine} /> */}
        </View>
      </View>
    </View>
  ),

  ContactDetails: () => (
    <View style={styles.container}>
      {/* Title skeleton */}
      <Skeleton width={200} height={16} style={styles.titleSkeleton} />

      {/* Contact items - showing 3 items as placeholder */}
      {[1, 2].map((_, index) => (
        <View key={index} style={styles.contactItemSkeleton}>
          {/* Icon placeholder */}
          <Skeleton width={24} height={24} style={styles.iconSkeleton} />

          {/* Label placeholder */}
          <Skeleton width={70} height={16} style={styles.labelSkeleton} />

          {/* Value placeholder */}
          <Skeleton width={150} height={16} style={styles.valueSkeleton} />
        </View>
      ))}
    </View>
  ),

  // Main business card skeleton
  BusinessCard: () => (
    <View style={styles.cardSkeleton}>
      {/* Header Section */}
      <View style={styles.profileHeaderSkeleton}>
        <View style={styles.headerInfoContainerSkeleton}>
          {/* Profile Image */}
          <Skeleton
            width={45}
            height={45}
            style={styles.profileImageSkeleton}
          />

          {/* Profile Info */}
          <View style={styles.profileInfoSkeleton}>
            <Skeleton width={150} height={16} style={styles.userNameSkeleton} />
            <Skeleton width={200} height={12} style={styles.jobRoleSkeleton} />
            <Skeleton width={80} height={10} style={styles.timeSkeleton} />
          </View>

          {/* Menu Icon */}
          <SkeletonLayouts.Icon size={20} style={styles.menuIconSkeleton} />
        </View>

        {/* Content Text */}
        <View style={styles.infoContainerSkeleton}>
          <Skeleton width={"90%"} height={14} style={styles.contentSkeleton} />
        </View>
      </View>

      {/* Image Carousel Skeleton */}
      <Skeleton
        width={"100%"}
        height={400}
        style={styles.imageCarouselSkeleton}
      />

      {/* Dots Indicator */}
      <View style={styles.dotsContainerSkeleton}>
        {[1, 2, 3].map((_, index) => (
          <Skeleton
            key={index}
            width={12}
            height={6}
            style={styles.dotSkeleton}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainerSkeleton}>
        {[1, 2, 3].map((_, index) => (
          <SkeletonLayouts.Icon
            key={index}
            size={24}
            style={styles.actionIconSkeleton}
          />
        ))}
      </View>
    </View>
  ),

  ButtonRowSkeleton: () => (
    <View style={styles.skeletonContainer}>
      {/* Add Post Button Skeleton */}
      <View style={styles.skeletonButton}>
        <Skeleton width={16} height={16} style={styles.skeletonIcon} />
        <Skeleton width={80} height={16} style={styles.skeletonText} />
      </View>

      {/* Edit Profile Button Skeleton */}
      <View style={styles.skeletonButton}>
        <Skeleton width={16} height={16} style={styles.skeletonIcon} />
        <Skeleton width={80} height={16} style={styles.skeletonText} />
      </View>

      {/* More Options Button Skeleton */}
      <View style={styles.skeletonButtonSmall}>
        <Skeleton width={16} height={16} style={styles.skeletonIcon} />
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E1E9EE",
    borderRadius: 4,
  },
  container: {
    width: "100%",
  },
  coverImage: {
    marginBottom: -45,
  },
  profileContent: {
    flexDirection: "row",
    padding: 16,
  },
  profileImage: {
    borderRadius: 60,
  },
  textContent: {
    marginLeft: 16,
    marginTop: 22,

    justifyContent: "center",
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  avatar: {
    borderRadius: 25,
  },
  listItemContent: {
    marginLeft: 16,
    gap: 8,
  },
  card: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 8,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  textBlock: {
    padding: 16,
    gap: 1,
  },
  textLine: {
    marginVertical: 4,
    borderRadius: 4,

  },
  titleSkeleton: {
    marginBottom: 8,
    borderRadius: 4,
  },
  contentSkeleton: {
    gap: 8,
    marginBottom: 8,
  },

  contactItemSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconSkeleton: {
    marginRight: 12,
    borderRadius: 12, // Make icon skeleton circular
  },
  labelSkeleton: {
    marginRight: 8,
    borderRadius: 4,
    minWidth: 70, // Matches your contactLabel minWidth
  },
  valueSkeleton: {
    flex: 1,
    borderRadius: 4,
  },
  cardSkeleton: {
    borderRadius: 9,
    borderColor: "#EFEFF0",
    borderWidth: 1,
    width: "100%",
    marginBottom: 15,
    backgroundColor: Colors.primaryColor,
  },
  profileHeaderSkeleton: {
    flexDirection: "column",
  },
  headerInfoContainerSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    flex: 1,
  },
  profileImageSkeleton: {
    borderRadius: 60,
    marginRight: 10,
  },
  profileInfoSkeleton: {
    flex: 1,
    gap: 8,
  },
  userNameSkeleton: {
    borderRadius: 4,
  },
  jobRoleSkeleton: {
    borderRadius: 4,
  },
  timeSkeleton: {
    borderRadius: 4,
    marginTop: 2,
  },
  menuIconSkeleton: {
    marginLeft: "auto",
  },
  infoContainerSkeleton: {
    paddingHorizontal: 9,
    marginVertical: 5,
  },
  contentSkeleton: {
    borderRadius: 4,
  },
  imageCarouselSkeleton: {
    borderRadius: 0,
  },
  dotsContainerSkeleton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: -16,
    marginRight: 20,
    marginBottom: 10,
    gap: 4,
  },
  dotSkeleton: {
    borderRadius: 4,
  },
  actionsContainerSkeleton: {
    flexDirection: "row",
    padding: 10,
    gap: 16,
  },
  actionIconSkeleton: {
    marginRight: 8,
  },

  skeletonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  skeletonButton: {
    flex: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    marginHorizontal: 4,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },

  skeletonButtonSmall: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    marginHorizontal: 4,
    padding: 10,
  },

  skeletonIcon: {
    borderRadius: 8,
  },

  skeletonText: {
    marginLeft: 10,
    borderRadius: 4,
  },
});

export default Skeleton;
