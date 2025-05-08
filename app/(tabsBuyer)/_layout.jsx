import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AnimatedTabBar from "../../components/AnimatedTabBar";
import Lottie from "lottie-react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";

export default function BuyerTabLayout() {


  return (
    <>
      <StatusBar style="dark" translucent />
      <Tabs
        screenOptions={{
          headerShown: false,
          headerStyle: {
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
            // fontFamily: "poppins-semibold", // Font family for consistency
          },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIconStyle: { width: 36, height: 36 },
        }}
        tabBar={(props) => <AnimatedTabBar {...props} />}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarLabel: "Explore",
            tabBarIcon: ({ color }) => (
              <Ionicons name="search-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bids"
          options={{
            title: "Bids",
            tabBarLabel: "Bids",
            tabBarIcon: ({ color }) => (
              <Ionicons name="briefcase-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = {
  lottieIcon: {
    width: 25, // Adjust the size according to your design
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
};
