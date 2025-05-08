import React from "react";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import AnimatedTabBar from "../../components/AnimatedTabBar";
import { StatusBar } from "expo-status-bar";

export default function EntrepreneurTabLayout() {
  return (
    <>
      <StatusBar style="dark" translucent />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIconStyle: { width: 36, height: 36 },
        }}
        tabBar={(props) => <AnimatedTabBar {...props} />}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />

        {/* <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarLabel: "Explore",
            tabBarIcon: ({ color }) => (
              <Ionicons name="search" size={24} color={color} />
            ),
          }}
        /> */}
        <Tabs.Screen
          name="community"
          options={{
            tabBarLabel: "Community",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Ionicons name="people-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bids"
          options={{
            title: "bids",
            headerShown: false, 
            title: "Bids",
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
