import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ToastAndroid, // Import ToastAndroid for Android
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons from expo
import Loading from "../../components/Loading";
import { useAuth } from "../../context/authContext";
import { RFValue } from "react-native-responsive-fontsize";

export default function SignIn() {
  const router = useRouter();
  const { role } = useLocalSearchParams(); // Retrieve the role parameter

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisibility] = useState(false); // New state for password visibility
  const { signin } = useAuth();

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!isPasswordVisible); // Toggles the visibility of the password
  };

  // Helper function to show Toast messages
  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const validateInputs = () => {
    if (!email) {
      showToast("Email is required");
      return false;
    }
    if (!password) {
      showToast("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return; // Exit if validation fails
    }

    setLoading(true);
    const response = await signin(email, password);
    setLoading(false);

    if (!response.success) {
      showToast(response.data); // Show error message as a Toast
      return;
    }

    // Log the response for debugging purposes
    console.log("Response:", response);

    const { role } = response;

    if (role === "buyer") {
      // Navigate to buyer's home only if role is fetched
      router.push("/(tabsBuyer)/home");
    } else if (role === "entrepreneur") {
      // Navigate to entrepreneur's home only if role is fetched
      router.push("/(tabsEntrepreneur)/home");
    } else {
      showToast("Invalid user role");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior for iOS and Android
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // Dismiss the keyboard when tapping outside
      >
        <StatusBar barStyle="dark-content" />
        <Text style={styles.title}>Sign In</Text>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/icons/facebook.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/icons/google.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orContainer}>
          <View style={styles.hr} />
          <Text style={styles.orText}>Or</Text>
          <View style={styles.hr} />
        </View>
        {/* Email Input */}
        <TextInput
          onChangeText={(value) => setEmail(value)}
          placeholder="arunperera@gmail.com"
          value={email}
          style={styles.input}
          placeholderTextColor="#61677d"
          keyboardType="email-address" // Set keyboard type to email address
          autoCapitalize="none" // Disable auto-capitalization for email addresses
        />

        {/* Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            onChangeText={(value) => setPassword(value)}
            placeholder="********"
            secureTextEntry={!isPasswordVisible} // Toggle visibility based on state
            value={password}
            style={styles.input}
            placeholderTextColor="#61677d"
          />
          <TouchableOpacity
            style={styles.eyeIcon} // Positioning for the eye icon
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"} // Conditional icon
              size={24}
              color="#61677d"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => router.push("/auth/forgotPassword")}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Log In Button */}
        <View style={styles.buttonContainer}>
          {loading ? (
            <Loading />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}> Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signUp")}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: RFValue(36),
    fontFamily: "poppins-semibold",
    color: "#AA6A1C",
    textAlign: "left",
    marginTop: 80,
    marginBottom: 85,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  socialButton: {
    width: "48%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 0.2,
    borderColor: "#e0e0e0",
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    marginLeft: 15,
  },
  socialButtonText: {
    fontSize: RFValue(13),
    color: "#000",
    fontFamily: "poppins",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20, // Adjust margin as needed
  },
  hr: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0", // Line color
    marginHorizontal: 10, // Space between line and text
  },
  orText: {
    color: "#61677d",
  },
  input: {
    height: 50,
    borderColor: "#e0e0e0",
    borderWidth: 0.4,
    borderRadius: 14,
    paddingLeft: 10,
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 13,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#AA6A1C",
    textAlign: "right",
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center", // Centering the button or loading spinner
  },
  loginButton: {
    backgroundColor: "#AA6A1C",
    height: 50,
    width: "100%",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: RFValue(14),
    fontFamily: "poppins-semibold",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "left",
    alignItems: "center",
    marginTop: 20,
  },
  signUpText: {
    color: "#61677d",
    fontSize: RFValue(11),
    fontFamily: "poppins",
  },
  signUpLink: {
    color: "#AA6A1C",
    fontSize: RFValue(11),
    fontFamily: "poppins",
  },
});
