import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Vibration,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Import Material Icons for the delete icon
import { Colors } from "../../../constants/Colors";

const WorkImage = ({ source, style, onPress, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);

  const handleLongPress = () => {
    Vibration.vibrate(100); // Trigger a short vibration
    setShowDelete(true); // Show the delete icon when long press is triggered
  };

  const handlePressOut = () => {
    setShowDelete(true); // Keep the delete icon visible after releasing long press
  };

  const hideDeleteIcon = () => {
    setShowDelete(false); // Hide the delete icon when tapping outside or on the image
  };

  return (
    <TouchableWithoutFeedback onPress={hideDeleteIcon}>
      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={onPress}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
        >
          <Image
            resizeMode="cover"
            source={{ uri: source }}
            style={[styles.workImage, style]}
            onError={(e) => console.error("Image loading error: ", e)}
          />
          {showDelete && (
            <TouchableOpacity
              style={styles.deleteIconContainer}
              onPress={onDelete}
            >
              <MaterialIcons
                name="delete"
                size={24}
                color={Colors.dangerColor}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative", // Position the container relative for absolute positioning the delete icon
  },
  workImage: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  deleteIconContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Slight background for better visibility
    borderRadius: 12,
    padding: 2,
  },
});

export default WorkImage;
