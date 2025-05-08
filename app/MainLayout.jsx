import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/authContext";

import LoadingScreen from "../components/LoadingScreen";
import { Stack } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initialization

  // Function to check if the user has completed onboarding
  const checkOnboardingStatus = async () => {
    try {
      const onboarded = await AsyncStorage.getItem("hasOnboarded");
      setHasOnboarded(onboarded === "true");
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
    } finally {
      setIsLoading(false); // Loading is done after checking onboarding status
    }
  };

  // Check onboarding status once authentication status is resolved
  useEffect(() => {
    if (typeof isAuthenticated !== "undefined") {
      checkOnboardingStatus();
    }
  }, [isAuthenticated]);

  // Handle navigation based on authentication and onboarding
  useEffect(() => {
    if (isLoading || isAuthenticated === undefined || hasOnboarded === null) {
      return; // Wait until loading is done
    }

    // Navigation logic after loading is complete
    if (isAuthenticated && !hasOnboarded) {
      router.replace("/onboarding"); // Navigate to onboarding screen
    } else if (isAuthenticated) {
      router.replace("/onboarding"); // Navigate to home screen (use appropriate home screen path)
    } else {
      router.replace("/onboarding"); // Navigate to login if not authenticated
    }
  }, [isAuthenticated, hasOnboarded, isLoading]);

  // Prevent rendering until loading is complete
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
      <NavigationContainer>
        <Stack
          screenOptions={{
            headerShown: false, // Hide headers globally
            animation: "none",

          }}
        />
      </NavigationContainer>
  );
};

export default MainLayout;
