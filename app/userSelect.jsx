import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import RegistrationOptions from "../components/UserSelectOnboard/RegistrationOptions";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

const UserSelect = () => {
  const [role, setRole] = useState(null); // Store selected role
  const router = useRouter();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    router.push({
      pathname: "/auth/signUp",
      params: { role: selectedRole }, // Pass role to SignUp screen
    });
  };

  return (
    <>
      <StatusBar  translucent />

      <View style={styles.container}>
        <ImageBackground
          resizeMode="cover"
          source={require("../assets/images/user_select.jpg")}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />

          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                Empowering Your Journey to Business Success
              </Text>
            </View>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>Register as a,</Text>
            </View>
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                Join our platform to find the best opportunities for growing
                your business or sourcing high-quality products.
              </Text>
            </View>
            {/* Pass the handleRoleSelect callback to RegistrationOptions */}
            <RegistrationOptions onSelectRole={handleRoleSelect} />
          </View>
        </ImageBackground>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    overflow: "hidden",
  },
  // Overlay with opacity
  overlay: {
    ...StyleSheet.absoluteFillObject, // This will fill the entire ImageBackground
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust the opacity here (0.5 = 50%)
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 27,
    paddingTop: 74,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 65,
  },
  title: {
    color: "white",
    fontSize: RFValue(18),
    // fontWeight: "700",
    textAlign: "center",
    fontFamily: "poppins-bold",
  },
  subtitleContainer: {
    marginTop: 424,
  },
  subtitle: {
    color: "white",
    fontSize: RFValue(16),
    fontFamily: "poppins-bold",
  },
  descriptionContainer: {
    alignItems: "left",
    marginTop: 6,
  },
  description: {
    color: "white",
    fontSize: RFValue(12),
    textAlign: "left",
    fontFamily: "poppins",
    paddingRight: 5,
  },
});

export default UserSelect;
