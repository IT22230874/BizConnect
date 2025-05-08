import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  ToastAndroid,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; // Access route params
import { db } from "../../config/FirebaseConfig"; // Firebase config
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import Header from "../../components/Header";
import { Colors } from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { Feather } from "@expo/vector-icons";

export default function CollabSpace() {
  const { postId, userName, location } = useLocalSearchParams(); // Get params correctly
  const [post, setPost] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [activeTab, setActiveTab] = useState("about"); // State for tab switching
  const { user } = useAuth(); // Assuming you have a hook that provides the logged-in user
  const [isMember, setIsMember] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId);
    }
  }, [postId]);

  const fetchPostDetails = async (id) => {
    try {
      const postRef = doc(db, "CollabSpaces", id);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const data = postSnap.data();
        setPost(data);

        // Fetch the profile image of the user who created the collab space
        const userRef = doc(db, "entrepreneurs", data.userId); // Assuming userId exists in post data
        const userSnap = await getDoc(userRef);
        // console.log(userSnap.data());

        if (userSnap.exists()) {
          setProfileImage(userSnap.data().profileImage);
          setPhoneNumber(userSnap.data().phoneNumber);
        } else {
          console.log("No entrepreneur document found!");
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching post details: ", error);
    }
  };

  useEffect(() => {
    if (post && user) {
      setIsMember(post.members?.includes(user.uid));
    }
  }, [post, user]);

  const joinCollabSpace = async () => {
    if (!user || !postId) return;
    try {
      const postRef = doc(db, "CollabSpaces", postId);
      // Add user to CollabSpace
      await updateDoc(postRef, {
        members: arrayUnion(user.uid),
      });

      // Add user to the relevant chat room
      const chatRoomRef = doc(db, "ChatRooms", post.chatRoomId); // Assuming the chat room has the same ID as the CollabSpace
      await updateDoc(chatRoomRef, {
        members: arrayUnion(user.uid),
      });

      setIsMember(true); // Update UI
      ToastAndroid.show(
        "You have joined the collaboration space!",
        ToastAndroid.BOTTOM
      );
    } catch (error) {
      // console.log(postId);
      console.error("Error joining CollabSpace: ", error);
    }
  };

  const leaveCollabSpace = async () => {
    if (!user || !postId) return;
    try {
      const postRef = doc(db, "CollabSpaces", postId);
      await updateDoc(postRef, {
        members: arrayRemove(user.uid),
      });

      // Remove user from the relevant chat room
      const chatRoomRef = doc(db, "ChatRooms", post.chatRoomId);
      await updateDoc(chatRoomRef, {
        members: arrayRemove(user.uid),
      });

      setIsMember(false); // Update UI
      ToastAndroid.show(
        "You have leaved the collaboration space!",
        ToastAndroid.BOTTOM
      );
    } catch (error) {
      console.error("Error leaving CollabSpace: ", error);
    }
  };

  const navigateToUpdateScreen = () => {
    router.push({
      pathname: "/community/UpdateCollabSpace",
      params: { postId }, // Pass the postId to the update screen
    });
  };

  const navigateToChatRoom = () => {
    router.push({
      pathname: "/community/ChatRoom",
      params: { chatRoomId: post.chatRoomId }, // Pass only the post ID
    });
  };

  const navigateToCall = async () => {
    if (phoneNumber) {
      const phoneUrl = Platform.select({
        ios: `tel:${phoneNumber}`,
        android: `tel:${phoneNumber}`,
      });

      try {
        const supported = await Linking.canOpenURL(phoneUrl);

        if (supported) {
          await Linking.openURL(phoneUrl);
        } else {
          console.log("Phone call not supported");
          // You might want to show an alert to the user here
        }
      } catch (error) {
        console.error("Error making phone call:", error);
      }
    } else {
      console.log("Phone number is not available");
      // You might want to show an alert to the user here
    }
  };

  if (!post) {
    return <Text>Loading post details...</Text>;
  }

  return (
    <View style={styles.mainContainer}>
      <Header title="CollabSpace" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Featured Image with Overlay */}
        <View style={styles.featuredImageContainer}>
          <Image
            source={{ uri: post.featuredImage }}
            style={styles.featuredImage}
          />

          <View style={styles.overlayContainer}>
            {/* Overlay for title and publisher info */}
            <View style={styles.overlay}>
              <View style={styles.blurContainer} />
              <Text style={styles.title}>{post.title}</Text>
              {/* Publisher Info */}
              <View style={styles.publisherInfo}>
                {profileImage && (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                )}
                <View>
                  <Text style={styles.publisherName}>{userName}</Text>
                  <Text style={styles.publisherLocation}>{location}</Text>
                </View>
              </View>
            </View>
            <View style={styles.joinButtonOverlayContainer}>
              {user && user.uid === post.userId ? (
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={navigateToUpdateScreen}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={isMember ? leaveCollabSpace : joinCollabSpace}
                >
                  <Text style={styles.buttonText}>
                    {isMember ? "Leave" : "Join"}
                  </Text>
                  <Feather
                    name={isMember ? "log-out" : "users"}
                    size={16}
                    color={"#fff"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Tab Section */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "about" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("about")}
            >
              <Text
                style={
                  activeTab === "about"
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                About CollabSpace
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "goals" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("goals")}
            >
              <Text
                style={
                  activeTab === "goals"
                    ? styles.activeTabText
                    : styles.inactiveTabText
                }
              >
                Goals
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "about" ? (
            <>
              <Text style={styles.sectionTitle}>Welcome to my CollabSpace</Text>
              <Text style={styles.description}>{post.description}</Text>

              {/* More Images */}
              <View style={styles.moreImagesContainer}>
                {post.moreImages?.map((imageUri, index) => (
                  <Image
                    key={index}
                    source={{ uri: imageUri }}
                    style={styles.moreImage}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.goalsContainer}>
              <Text style={styles.sectionTitle}>Goals</Text>
              {post.goals?.map((goal, index) => (
                <Text key={index} style={styles.goalItem}>{`${
                  index + 1
                }. ${goal}`}</Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {!(user && user.uid === post.userId) && (
        <TouchableOpacity style={styles.fab} onPress={navigateToCall}>
          <Feather name="phone" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {/* <TouchableOpacity style={styles.fab} onPress={navigateToChatRoom}>
        <Image
          source={require("../../assets/icons/Chat.png")} // Update the path to your icon
          style={styles.fabIcon}
        />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  container: {
    flexGrow: 1,
  },
  featuredImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  featuredImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  overlayContainer: {
    flex: 1,
    position: "relative", // Make the overlay container relative so we can position the button inside it
  },
  joinButtonOverlayContainer: {
    position: "absolute",
    bottom: 20, // Adjust the bottom position as needed
    right: 20, // Align the button to the right
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: Add semi-transparent background to distinguish the button
    padding: 10,
    borderRadius: 10,
  },
  overlay: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 16,
    overflow: "hidden",
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(177, 176, 176, 0.2)",
    blurRadius: 50,
  },
  title: {
    fontSize: RFValue(14),
    fontFamily: "lato-bold",
    color: "#fff",
    marginBottom: 6,
  },
  publisherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  publisherName: {
    fontSize: RFValue(12),
    color: "#fff",
    fontFamily: "lato-bold",
  },
  publisherLocation: {
    fontSize: RFValue(9),
    color: "#fff",
    fontFamily: "lato",
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  joinButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
  },
  joinButton: {
    backgroundColor: Colors.secondaryColor,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 10,
  },
  updateButton: {
    backgroundColor: Colors.secondaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: RFValue(13),
    fontFamily: "lato-bold",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#ccc",
  },
  activeTab: {
    borderBottomColor: Colors.secondaryColor,
  },
  activeTabText: {
    color: "#000",
    fontFamily: "roboto-bold",
    textAlign: "center",
    fontSize: RFValue(13),
  },
  inactiveTabText: {
    fontSize: RFValue(13),
    fontFamily: "roboto",
    color: "#888",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  moreImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  moreImage: {
    width: "48%",
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  goalsContainer: {
    marginTop: 20,
  },
  goalItem: {
    fontSize: 16,
    marginBottom: 10,
  },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.secondaryColor,
    borderRadius: 19,
    width: 50,
    height: 50,
    borderColor: Colors.secondaryColor,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.secondaryColor,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
    // elevation: 5,
  },
  // fabIcon: {
  //   width: 20, // Set the width of your icon
  //   height: 20, // Set the height of your icon
  // },
});
