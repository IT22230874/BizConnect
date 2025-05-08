import { Text, View, TouchableOpacity, Modal, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../context/authContext"; // Importing useAuth
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SkeletonLayouts } from "../../Skeleton/Skeleton";

const Buttons = ({ entrepreneurId, isPublicView, loading }) => {
  const { signout, user } = useAuth(); // Get the currently logged-in user
  const [isModalVisible, setIsModalVisible] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  if (isPublicView) {
    // Render Call Button for public view
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.callButton}>
          <Feather name="phone" size={16} color="#fff" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLogout = async () => {
    await signout(); // Call the signout function
  };

  if (loading) {
    return <SkeletonLayouts.ButtonRowSkeleton />;
  }
  return (
    <View style={styles.container}>
      {/* Button Row */}
      <View style={styles.buttonRow}>
        {/* Add Post Button */}
        {user?.role === "entrepreneur" && user.uid === entrepreneurId && (
          <TouchableOpacity
            style={styles.button1}
            onPress={() => router.push("/posts/AddPostScreen")}
          >
            <Feather name="plus-square" size={16} color="#fff" />
            <Text style={styles.button1Text}>Add Work</Text>
          </TouchableOpacity>
        )}
        {/* Edit Profile Button */}
        {user?.role === "entrepreneur" && user.uid === entrepreneurId && (
          <TouchableOpacity
            style={styles.button2}
            onPress={() => {
              router.push("/userProfile/entrepreneurProfile/EditProfileScreen");
            }}
          >
            <Feather name="edit" size={16} color={Colors.secondaryColor} />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        {/* More Options Button */}
        <TouchableOpacity style={styles.button3} onPress={toggleModal}>
          <Feather
            name="more-horizontal"
            size={16}
            color={Colors.secondaryColor}
          />
        </TouchableOpacity>
      </View>

      {/* Full Screen Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More Options</Text>
              <TouchableOpacity
                onPress={toggleModal}
                style={styles.closeButton}
              >
                <Feather name="x" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Modal Options */}
            <TouchableOpacity style={styles.modalOption}>
              <Feather name="share-2" size={20} color="#333" />
              <Text style={styles.modalOptionText}>Share Profile</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.modalOption}>
              <Feather name="flag" size={24} color="#333" />
              <Text style={styles.modalOptionText}>Report Profile</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => router.push("/posts/SavedPosts")}
            >
              <Feather name="bookmark" size={20} color="#333" />
              <Text style={styles.modalOptionText}>Saved Posts</Text>
            </TouchableOpacity>
            <View style={styles.emptySpace}></View>

            <TouchableOpacity
              style={[styles.modalOption, styles.logoutButton]} // Add custom styling for logout
              onPress={() => {
                // Handle logout logic here
                handleLogout();
              }}
            >
              <Feather name="log-out" size={20} color="#E74C3C" />
              {/* Red color for logout */}
              <Text style={[styles.modalOptionText, styles.logoutText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button1: {
    flex: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondaryColor,
    borderWidth: 1,
    borderColor: Colors.secondaryColor,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  button2: {
    flex: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(131, 126, 125, 0)",
    borderColor: Colors.secondaryColor,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  button3: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(131, 126, 125, 0)",
    borderColor: Colors.secondaryColor,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  buttonText: {
    marginLeft: 4,
    color: Colors.secondaryColor,
    fontSize: RFValue(13),
    fontFamily: "lato-bold",
  },
  button1Text: {
    marginLeft: 4,
    color: "#fff",
    fontSize: RFValue(13),
    fontFamily: "lato-bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 10, // Adds space at the top (adjust as necessary)
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: RFValue(16),
    fontFamily: "poppins-semibold",
    color: "#333",
  },
  emptySpace: {
    flexGrow: 1, // Pushes the logout button to the bottom
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: RFValue(14),
    fontFamily: "lato",
    color: "#333",
    marginLeft: 16, // Space between icon and text
    textAlign: "center",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondaryColor,
    borderWidth: 1,
    borderColor: Colors.secondaryColor,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  callButtonText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: RFValue(13),
    fontFamily: "lato-bold",
  },
});

export default Buttons;
