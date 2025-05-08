import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Colors } from "../../constants/Colors";

export default function CategoryItem({ category, onCategoryPress }) {
  return (
    <TouchableOpacity onPress={() => onCategoryPress(category)}>
      <View style={styles.categoryContainer}>
        <View style={styles.iconContainer}>
          <Image source={{ uri: category.icon }} style={styles.iconImage} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: "column",
    alignItems: "center",
    // marginBottom: 15,
  },
  iconContainer: {
    width: 75, // Set width
    height: 75, // Set height (adjust to your needs)
    backgroundColor: "#F8F9FA",
    borderRadius:20, // To make it circular
    borderColor: Colors.GRAY, // Black border
    borderWidth: 0.5,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center", 
  },
  iconImage: {
    width: "100%",
    height: "100%", 
    resizeMode: "cover",
    borderRadius:20, 
  },
  categoryName: {
    fontSize: 13,
    fontFamily: "roboto-bold",
    textTransform: "capitalize",
    textAlign: "left",
    marginTop: 5,
    marginLeft: -15,
  },
});
