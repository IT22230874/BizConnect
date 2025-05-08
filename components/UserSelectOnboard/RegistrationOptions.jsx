
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const RegistrationOptions = ({ onSelectRole }) => {
  const options = [
    { id: "entrepreneur", label: "Entrepreneur" },
    { id: "buyer", label: "Buyer" },
  ];

  return (
    <View style={styles.optionsContainer}>
      {options.map((option) => (
         <TouchableOpacity
         key={option.id}
         style={styles.optionButton}
         onPress={() => onSelectRole(option.id)} // Trigger role selection
         accessibilityRole="button"
         accessibilityLabel={`Register as ${option.label}`}
       >
         <Text style={styles.optionText}>{option.label}</Text>
       </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    marginTop: 30,
    flexDirection: "row",
    gap: 14,
  },
  optionButton: {
    borderRadius: 34,
    width: "48%",
    backgroundColor: "rgba(170, 106, 28, 0.7)",
    minHeight: 55,
    justifyContent: "center",
    // alignItems: "center",
    borderWidth: 3,
    paddingLeft: 20,
    borderColor: "white",
  },
  optionText: {
    color: "#F8F7FA",
    fontFamily: "roboto-bold",
    fontSize: RFValue(16),
    textAlign: "left",
  },
});

export default RegistrationOptions;
