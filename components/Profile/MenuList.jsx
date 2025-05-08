import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";

export default function MenuList() {
  const { signout } = useAuth(); // Get signout function from Auth context
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signout(); // Call the signout function
      router.push('/auth/signIn'); // Redirect to the login screen after logout
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  const menuList = [
    {
      id: 1,
      name: "My Profile",
      path: ''
    },
    {
      id: 2,
      name: "Jobs Details",
      path: '/bids/addBid'
    },
    {
      id: 3,
      name: "Notifications",
      path: '/notifications' // Update this with the actual path
    },
    {
      id: 4,
      name: "Logout",
      path: 'logout' // Use a distinct path or identifier for logout
    },
  ];

  const onMenuClick = (item) => {
    if (item.id === 4) {
      handleLogout(); // Call logout function if Logout item is clicked
    } else {
      router.push(item.path); // Navigate to the specified path for other items
    }
  };

  return (
    <View>
      <FlatList
        data={menuList}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onMenuClick(item)}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              padding: 10,
            }}
          >
            {/* Assuming icon is defined; you may want to handle this conditionally */}
            {item.icon && <Image source={item.icon} style={{ width: 40, height: 40 }} />}
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id.toString()} // Ensure unique keys for FlatList items
      />
    </View>
  );
}
