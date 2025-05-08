import React, { useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { NotificationContext } from "../context/notificationContext"; // Adjust the path as necessary
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router"; // Import useRouter from Expo Router

const SearchBar = () => {
  const router = useRouter(); // Access the router
  const { unreadCount } = useContext(NotificationContext); // Access the notification count

  const handleNotificationPress = () => {
    // Handle the notification press action here
  };

  const handleSearchPress = () => {
    router.push("/productSearchScreen"); // Navigate to ProductSearchScreen
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.searchContainer}>
        {/* Search Bar */}
        <TouchableOpacity onPress={handleSearchPress} style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6D4C41" />
          <TextInput
            placeholder="What products you need?"
            style={styles.searchInput}
            editable={false} // Disable direct editing to enforce navigation
          />
        </TouchableOpacity>

        {/* Notifications Button */}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={handleNotificationPress}
          style={styles.notificationIconWrapper}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#6D4C41"
            style={styles.notificationIcon}
          />
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 105,
    paddingHorizontal: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.GRAY,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EFEFF0",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 90,
  },
  searchInput: {
    fontSize: RFValue(13),
    color: "#BCBCBC",
    flex: 1,
  },
  notificationIconWrapper: {
    position: "relative",
  },
  notificationIcon: {
    margin: 5,
  },
  notificationBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: Colors.secondaryColor,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default SearchBar;
