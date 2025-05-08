import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  Image,
} from "react-native";
import { useAuth } from "../../../context/authContext";
import { Colors } from "../../../constants/Colors";
import Header from "../../../components/Header";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../config/FirebaseConfig";

const EditProfileScreen = () => {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(user?.profileImage);

  if (!user) return null;

  const handleImagePick = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!granted) {
      ToastAndroid.show("Permission denied", ToastAndroid.SHORT);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);

        const downloadURL = await uploadImageToFirebase(imageUri);
        await updateProfile({ profileImage: downloadURL });
        ToastAndroid.show("Profile updated", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      ToastAndroid.show("Update failed", ToastAndroid.SHORT);
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `profile-images/${user.uid}-${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const navigateToEdit = (field, value) => {
    // If value is an object (like address), stringify it
    const processedValue = typeof value === 'object' && value !== null
      ? JSON.stringify(value)
      : value || '';
  
    router.push({
      pathname: "../EditFieldScreen",
      params: {
        field,
        initialValue: processedValue
      }
    });
  };
  
  const renderProfileImage = () =>
    profileImage ? (
      <Image source={{ uri: profileImage }} style={styles.profileImage} />
    ) : (
      <View style={styles.placeholderImage}>
        <Text style={styles.placeholderText}>Add Image</Text>
      </View>
    );

  const EditField = ({ label, value, field }) => {
    // If the value is an address object, format it for display only
    let displayValue = value;
    if (field === "address" && value && typeof value === "object") {
      const { streetNumber, streetName, city } = value;
      displayValue = [streetNumber, streetName, city]
        .filter(Boolean) // Remove empty values
        .join(", ");
    }

    return (
      <TouchableOpacity
        style={styles.editRow}
        onPress={() => navigateToEdit(field, value)}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue || `Add ${label}`}</Text>
      </TouchableOpacity>
    );
  };

  const userFields = [
    { label: "First Name", field: "firstName", value: user.firstName },
    { label: "Last Name", field: "lastName", value: user.lastName },
    { label: "Username", field: "username", value: user.username },
    { label: "Email", field: "email", value: user.email },
    { label: "Phone", field: "phoneNumber", value: user.phoneNumber },
    { label: "Address", field: "address", value: user.address },
    { label: "Bio", field: "bio", value: user.bio },
  ];

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.editRow} onPress={handleImagePick}>
          <Text style={styles.label}>Edit Profile Picture</Text>
          {renderProfileImage()}
        </TouchableOpacity>

        {userFields.map((field) => (
          <EditField
            key={field.field}
            label={field.label}
            value={field.value}
            field={field.field}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  scrollContainer: {
    padding: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 16,
  },
  editRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#000",
    fontFamily: "poppins-semibold",
    flex: 1,
  },
  value: {
    color: "#888",
    fontSize: 16,
    flexShrink: 1,
    textAlign: "left",
    flex: 4,
  },
});

export default EditProfileScreen;
