import React, { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ToastAndroid,
} from "react-native";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/authContext";
import { Colors } from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the eye icon

export default function SignUp() {
  const router = useRouter();
  const { role } = useLocalSearchParams(); // Retrieve the 'role' from the route params
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(""); // Declare email state
  const [password, setPassword] = useState(""); // Declare password state
  const [username, setUsername] = useState(""); // New username state
  const [phoneNumber, setPhoneNumber] = useState(""); // New phone number state
  const [isPasswordVisible, setPasswordVisibility] = useState(false); // New state for password visibility
  const { signup } = useAuth();

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
    if (!username) {
      showToast("Username is required");
      return false;
    }
    if (!phoneNumber) {
      showToast("Phone number is required");
      return false;
    }
    if (!password) {
      showToast("Password is required");
      return false;
    }
    // Add additional validations as needed
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return; // Exit if validation fails
    }

    setLoading(true);
    let response = await signup(email, password, username, phoneNumber, role); // Include new fields in signup function
    console.log(response);
    setLoading(false);

    if (!response.success) {
      showToast(response.data);
      return;
    }

    // Navigate based on user role
    if (role === "buyer") {
      router.push("/(tabsBuyer)/home");
    } else if (role === "entrepreneur") {
      router.push("/(tabsEntrepeneur)/home");
    } else {
      showToast("Invalid role");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior for iOS and Android
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust offset as needed
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // Dismiss the keyboard when tapping outside
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
      >
        <StatusBar barStyle="dark-content" />
        <Text style={styles.title}>Sign Up</Text>
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
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          placeholderTextColor="#61677d"
          keyboardType="email-address" // Set keyboard type to email address
          autoCapitalize="none" // Disable auto-capitalization for email addresses
        />
        {/* Username Input */}
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          style={styles.input}
          placeholderTextColor="#61677d"
        />
        {/* Phone Number Input */}
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor="#61677d"
        />
        {/* Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible} // Toggle visibility based on state
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
        {/* Sign Up Button */}
        <View style={styles.buttonContainer}>
          {loading ? (
            <Loading />
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
              <Text style={styles.loginButtonText}>Create Account</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Sign In Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Have an account? </Text>
          {/* Pass role as a parameter to the Sign In screen */}
          <TouchableOpacity onPress={() => router.push(`/auth/signIn?role=${role}`)}>
            <Text style={styles.signUpLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: RFValue(36),
    fontFamily: "poppins-semibold",
    color: "#AA6A1C",
    textAlign: "left",
    marginTop: 80,
    marginBottom: 80,
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
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 13,
  },
  loadingContainer: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
