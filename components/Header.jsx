import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { NotificationContext } from "../context/notificationContext";
import { useAuth } from "../context/authContext";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "../constants/Colors";

export default function Header({
  title,
  onDeletePress,
  showDelete,
  showNotification,
  showBackButton = true,
  isOwner = false, // New prop to check if user is owner
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useContext(NotificationContext);

  const handleNotificationPress = () => {
    if (user?.role === "entrepreneur") {
      router.push("notifications/EntrepreneurNotifications");
    } else if (user?.role === "buyer") {
      router.push("notifications/BuyerNotifications");
    } else {
      console.warn("No notifications available for this role.");
    }
  };

  const handleMenuPress = () => {
    // Handle menu press action here
    // For example, open a dropdown menu or navigate to settings
    router.push("/settings"); // Or whatever navigation you want
  };

  return (
    <View style={styles.header}>
      <StatusBar style="dark" translucent backgroundColor="white" />
      {showBackButton && (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 24 }} />
      
      {isOwner ? (
        // Show menu icon for profile owner
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={handleMenuPress}
          style={styles.menuIconWrapper}
        >
          <Ionicons
            name="menu-outline"
            size={24}
            color={"#6D4C41"}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
      ) : showNotification && (
        // Show notification icon for others
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={handleNotificationPress}
          style={styles.notificationIconWrapper}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={"#6D4C41"}
            style={styles.notificationIcon}
          />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      
      {showDelete && (
        <TouchableOpacity onPress={onDeletePress} style={styles.deleteButton}>
          <MaterialIcons name="delete-outline" size={24} color="#6D4C41" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    paddingTop:15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY,
    backgroundColor: "#fff",
    zIndex: 100,
  },
  headerTitle: {
    flex: 1,
    textAlign: "left",
    marginLeft: 30,
    fontSize: RFValue(16),
    fontFamily: "poppins-semibold",
  },
  deleteButton: {
    padding: 10,
  },
  notificationIconWrapper: {
    position: "relative",
  },
  notificationIcon: {
    margin: 5,
  },
  menuIconWrapper: {
    padding: 5,
  },
  menuIcon: {
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