import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

// Helper function to format the timestamp
const formatTimestamp = (timestamp) => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000); // Difference in seconds

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(seconds / 86400);

  if (seconds < 60) {
    return `${seconds}s`;
  } else if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else {
    return `${days}d`;
  }
};

export default function NotificationItem({
  notification,
  onPress,
  onLongPress,
  onPressOut,
  isSelected,
  showDeleteIcon,
}) {
  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
    >
      <View style={[styles.item, isSelected ? styles.selected : {}]}>
        <View style={styles.container}>
          <View style={styles.iconAndMessageContainer}>
            <Image
              source={{
                uri: notification.profileImage,
              }}
              style={styles.profileImage}
              resizeMode="cover"
            />
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(notification.timestamp.seconds * 1000)}
              </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 0,
    marginHorizontal: 16,
    borderBottomColor: "#ccc",
    borderBottomWidth: 0.5,
  },
  selected: {
    backgroundColor: "#f0f0f0", // Highlight background for selected items
    
  },
  iconAndMessageContainer: {
    flexDirection: "row",
    alignItems: "top",
    justifyContent: "space-between",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  message: {
    flex: 1,
    fontSize: RFValue(12),
    color: "#333",
    fontFamily: "lato",
  },
  deleteIcon: {
    fontSize: RFValue(18),
    color: "red",
    marginLeft: 10,
  },
  timestamp: {
    fontSize: RFValue(10),
    color: "#61646B",
    marginLeft: 10,
    fontFamily: "lato",
  },
});
