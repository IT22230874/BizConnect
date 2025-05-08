import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/authContext";
import { router, useLocalSearchParams } from "expo-router";

const EditFieldScreen = () => {
  const { updateProfile } = useAuth();
  const params = useLocalSearchParams();
  const field = params.field || "";

  const parseAddress = (address) => {
    if (!address || typeof address !== "string") {
      return { streetNumber: "", streetName: "", city: "" };
    }

    const streetParts = address.split(" ").filter(Boolean);

    if (streetParts.length > 1) {
      return {
        streetNumber: streetParts[0] || "",
        streetName: streetParts.slice(1, streetParts.length - 1).join(" ") || "",
        city: streetParts[streetParts.length - 1] || "",
      };
    }

    return { streetNumber: "", streetName: "", city: address || "" };
  };

  const getInitialAddressValue = () => {
    try {
      if (params.initialValue && typeof params.initialValue === "string") {
        try {
          const parsed = JSON.parse(params.initialValue);
          if (parsed && typeof parsed === "object") {
            return parsed;
          }
        } catch {
          return parseAddress(params.initialValue);
        }
      }
    } catch (error) {
      console.error("Error parsing initial value:", error);
    }
    return {};
  };

  const [formData, setFormData] = useState({
    value: params.initialValue || "",
    ...getInitialAddressValue(),
  });

  const isAddressField = field === "address";

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        [field]: isAddressField
          ? {
              streetNumber: formData.streetNumber?.trim() || "",
              streetName: formData.streetName?.trim() || "",
              city: formData.city?.trim() || "",
            }
          : formData.value.trim(),
      };

      const result = await updateProfile(updatedData);

      if (result.success) {
        ToastAndroid.show("Field updated successfully!", ToastAndroid.SHORT);
        router.back();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating field:", error);
      ToastAndroid.show(
        "Error updating field. Please try again.",
        ToastAndroid.SHORT
      );
    }
  };

  const capitalizeField = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const renderAddressInputs = () => (
    ["streetNumber", "streetName", "city"].map((key) => (
      <TextInput
        key={key}
        style={styles.input}
        value={formData[key] || ""}
        onChangeText={(value) => handleInputChange(key, value)}
        placeholder={capitalizeField(key.replace(/([A-Z])/g, " $1"))}
        placeholderTextColor="#888"
      />
    ))
  );

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit {capitalizeField(field)}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="checkmark" size={24} color={Colors.secondaryColor} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>{capitalizeField(field)}</Text>

        {isAddressField ? (
          renderAddressInputs()
        ) : (
          <TextInput
            style={styles.input}
            value={formData.value}
            onChangeText={(value) => handleInputChange("value", value)}
            placeholder={`Enter your ${field}`}
            placeholderTextColor="#888"
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.primaryColor,
    marginTop: -24,
  },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "left",
    fontFamily: "poppins-semibold",
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    color: "#000",
    fontFamily: "poppins-semibold",
  },
  input: {
    padding: 15,
    paddingVertical: 12,
    borderRadius: 18,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: 18,
    color: "#000",
    fontFamily: "roboto",
    marginBottom: 10,
  },
});

export default EditFieldScreen;
