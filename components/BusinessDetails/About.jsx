import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { RFValue } from "react-native-responsive-fontsize";

export default function About({ business }) {
  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        {business?.about}
      </Text>
      <View style={styles.hr} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    height: "30%",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: RFValue(14),
    fontFamily: "lato-bold",
  },
  description: {
    fontSize: RFValue(11),
    fontFamily: "lato",
    color: "#262626",
    lineHeight: 24,
  },
  hr: {
    height: 1, // Height of the horizontal line
    backgroundColor: "#e0e0e0", // Color of the line
    marginVertical: 10, // Space above and below the line
  },
});
