import { useRouter } from "expo-router"; // Corrected use of useRouter
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Share, // Import Share API
  Alert, // Import Alert API for messaging functionality
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../../context/authContext"; // Import useAuth hook
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/FirebaseConfig"; // Firestore instance

const ProfileHeader = ({ buyerId }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { user, signout } = useAuth(); // Get the currently logged-in user
  const [profileData, setProfileData] = useState({
    firstName: "Loading...",
    lastName: "Loading...",
    title: "Loading...",
    profileImage: "https://via.placeholder.com/150", // Default placeholder image
  });
  const router = useRouter(); // Correct use of useRouter

  // Function to fetch profile data from Firestore
  const fetchProfileData = async () => {
    try {
      const idToFetch = buyerId || user?.uid; // Use buyerId or fallback to the current user
      if (idToFetch) {
        // Reference to the user's document in Firestore
        const userDocRef = doc(db, "buyers", idToFetch); // Corrected to use `idToFetch` (dynamic ID)
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfileData({
            firstName: userData.firstName || userData.username || "Guest User", // Use username if firstName is not available
            lastName: userData.lastName || "", // Leave last name blank if not provided
            title: userData.title || "No title available",
            profileImage:
              userData.profileImage || "https://via.placeholder.com/150", // Fallback to placeholder
          });
        } else {
          console.log("No such user document!");
        }
      }
    } catch (error) {
      console.error("Error fetching profile data: ", error);
    }
  };

  // Fetch profile data when the component mounts
  useEffect(() => {
    if (buyerId || user) {
      fetchProfileData();
    }
  }, [buyerId, user]); // Updated dependency to include both buyerId and user

  const handleEditProfile = () => {
    router.push("/profile/BuyerProfile/EditProfileScreen");
    setDropdownVisible(false); // Hide dropdown after selecting an option
  };

  const handleLogout = async () => {
    await signout(); // Call the signout function
    setDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const closeDropdown = () => {
    if (dropdownVisible) {
      setDropdownVisible(false); // Close the dropdown if it is visible
    }
  };

  // Function to share profile
  const handleShareProfile = async () => {
    const message = `Check out my profile! \nName: ${profileData.firstName} ${profileData.lastName}\nTitle: ${profileData.title}\nProfile Image: ${profileData.profileImage}`;
    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error("Error sharing profile: ", error);
    }
  };

  // New function to handle messaging
  const handleMessage = () => {
    
    // Implement your messaging logic here
  };

  const isBuyer = user?.role === "buyer"; // Check if the user is a buyer
  const isEntrepreneur = user?.role === "entrepreneur"; // Check if the user is an entrepreneur

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <View style={styles.container}>
        <Image
          resizeMode="contain"
          source={{
            uri: profileData.profileImage, // Use dynamic profile image from Firestore
          }}
          style={styles.profileImage}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {profileData.firstName} {profileData.lastName}
          </Text>
          <Text style={styles.title}>{profileData.title}</Text>

          <View style={styles.buttonContainer}>
            {/* Show edit button only if not a buyer or entrepreneur */}
            { !isEntrepreneur && (
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={handleEditProfile}
              >
                <Icon name="edit" size={17} color="#333" />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.shareProfileButton}
              onPress={handleShareProfile} // Call the share function
            >
              <Icon name="share" size={17} color="#333" />
              <Text style={styles.buttonText}>Share Profile</Text>
            </TouchableOpacity>
            {isEntrepreneur && ( // Show message button if user is a buyer
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage} // Call the message function
              >
                <Icon name="message" size={17} color="#333" />
                <Text style={styles.buttonText}>Message</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Three dots menu */}
        {!isBuyer && !isEntrepreneur && ( // Only show the menu button if not a buyer or entrepreneur
          <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}>
            <Icon name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        )}

        {/* Dropdown menu */}
        {dropdownVisible && ( // Show dropdown only if not a buyer or entrepreneur
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Icon
                name="logout"
                size={20}
                color="red"
                style={styles.dropdownIcon}
              />
              <Text style={[styles.dropdownText, styles.logoutText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
    padding: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    aspectRatio: 1,
    marginTop: 15,
    borderRadius: 55, // Make the image circular
    resizeMode: "cover",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontFamily: "poppins-semibold",
    color: "rgba(51, 51, 51, 1)",
    fontWeight: "400",
  },
  title: {
    fontSize: 12,
    fontFamily: "poppins-semibold",
    color: "rgba(51, 51, 51, 1)",
    fontWeight: "400",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    paddingVertical: 5,
    paddingHorizontal: 15,
    gap: 5,
    borderRadius: 5,
  },
  shareProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    paddingVertical: 5,
    paddingHorizontal: 15,
    gap: 5,
    borderRadius: 5,
  },
  messageButton: { // New styles for the message button
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    paddingVertical: 5,
    paddingHorizontal: 15,
    gap: 5,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "poppins",
    color: "#333",
  },
  menuButton: {
    padding: 10,
    position: "absolute",
    right: 10,
    top: 10,
  },
  dropdown: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "poppins",
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
});

export default ProfileHeader;
