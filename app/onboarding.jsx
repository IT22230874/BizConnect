import React, { useEffect, useState } from "react";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { router } from "expo-router"; // Import router for navigation
import { useAuth } from "../context/authContext";
import { StatusBar } from "expo-status-bar";

const Index = () => {
  const { user, isAuthenticated } = useAuth(); // Fetch user and auth status from context
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated); // Set authenticated based on auth status
  }, [isAuthenticated]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authenticated && user?.role) {
        if (user.role === "buyer") {
          router.push("(tabsBuyer)/home"); // Navigate to buyer's home if role is 'buyer'
        } else if (user.role === "entrepreneur") {
          router.push("(tabsEntrepeneur)/home"); // Navigate to entrepreneur's home if role is 'entrepreneur'
        }
      }
    }, 4000); // 4 seconds timeout for authenticated users

    return () => clearTimeout(timeout); // Cleanup on unmount
  }, [authenticated, user?.role]);

  // Handle "Get Started" button press for unauthenticated users
  const handleGetStarted = () => {
    router.push("/userSelect"); // Navigate to user selection
  };

  return (
    <>
      <StatusBar translucent />

      <View style={styles.container}>
        <ImageBackground
          resizeMode="cover"
          source={require("../assets/images/onboardscreen.jpg")}
          style={styles.backgroundImage}
        >
          {/* Overlay to add opacity to the background */}
          <View style={styles.overlay} />

          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>
                Welcome to{"\n"}
                <Text style={styles.bizconnectText}>Bizconnect</Text>
              </Text>
            </View>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleText}>
                Connecting artisans and buyers for unique, handcrafted products
              </Text>
            </View>
            {/* Show button only if the user is not authenticated */}
            {!authenticated && (
              <TouchableOpacity
                style={styles.getStartedButton}
                accessibilityRole="button"
                onPress={handleGetStarted}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  backgroundImage: {
    aspectRatio: 0.45,
    width: "100%",
    maxWidth: 480,
    overflow: "hidden",
    alignItems: "stretch",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contentContainer: {
    marginTop: 400,
    width: "100%",
    paddingHorizontal: 28,
  },
  titleContainer: {
    alignSelf: "stretch",
  },
  titleText: {
    color: "#ffffff",
    fontSize: RFValue(24),
    fontWeight: "600",
    fontFamily: "poppins-semibold",
    lineHeight: RFValue(55),
  },
  bizconnectText: {
    fontSize: RFValue(56),
    fontFamily: "poppins-semibold",
    letterSpacing: 0,
  },
  subtitleContainer: {
    marginTop: -5,
    paddingRight: 20,
  },
  subtitleText: {
    color: "#ffffff",
    fontSize: RFValue(14),
    fontWeight: "400",
    lineHeight: 30,
    fontFamily: "roboto",
  },
  getStartedButton: {
    alignSelf: "stretch",
    width: "70%",
    borderRadius: 34,
    backgroundColor: "rgba(170, 106, 28, 0.9)",
    marginTop: 186,
    padding: 15,
    paddingLeft: 25,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  getStartedText: {
    color: "#F8F7FA",
    textAlign: "left",
    fontSize: RFValue(17),
    fontFamily: "roboto-bold",
  },
});

export default Index;
