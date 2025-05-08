// LoadingScreen.js
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, StyleSheet, ActivityIndicator, Image } from "react-native";

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent />
      <Image
        source={require("../assets/Bizconnect_Logo.png")} // Replace with your logo's path
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Change to your desired background color
  },
  logo: {
    width: 100, // Adjust the size according to your logo dimensions
    height: 100, // Adjust the size according to your logo dimensions
    marginBottom: 20, // Space between the logo and spinner
  },
  spinner: {
    marginTop: 20,
  },
});

export default LoadingScreen;
