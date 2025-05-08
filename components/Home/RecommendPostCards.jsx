import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Share,
  Modal,
  Alert,
  ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { Colors } from "../../constants/Colors";
import PostActions from "../PostAction/PostActions";
import { Entypo, Feather } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { useAuth } from "../../context/authContext";
import { db } from "../../config/FirebaseConfig";
import { SkeletonLayouts } from "../Skeleton/Skeleton";

const MAX_IMAGE_HEIGHT = 500;
const DEFAULT_HEIGHT = 300;

const RecommendPostCards = ({
  business,
  isPublicView = true,
  entrepreneurId,
}) => {
  const { user } = useAuth();
  const auth = getAuth();
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const { width: screenWidth } = Dimensions.get("window");
  const [containerHeight, setContainerHeight] = useState(DEFAULT_HEIGHT);
  const flatListRef = useRef(null);

  const scrollX = useRef(new Animated.Value(0)).current;
  const [userDetails, setUserDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const animation = useRef(new Animated.Value(0)).current;
  const [localPosts, setLocalPosts] = useState();
  const [loading, setLoading] = useState(true); // Loading state

  const images =
    business?.images || (business?.imageUrl ? [business.imageUrl] : []);

  // Calculate and store image heights when images change
  useEffect(() => {
    const calculateMaxHeight = async () => {
      try {
        const heights = await Promise.all(
          images.map(
            (imageUrl) =>
              new Promise((resolve) => {
                Image.getSize(
                  imageUrl,
                  (width, height) => {
                    const aspectRatio = height / width;
                    const calculatedHeight = screenWidth * aspectRatio;
                    // Limit the height to MAX_IMAGE_HEIGHT
                    resolve(Math.min(calculatedHeight, MAX_IMAGE_HEIGHT));
                  },
                  () => resolve(DEFAULT_HEIGHT) // Default height on error
                );
              })
          )
        );

        // Set container height to the maximum height found
        const maxHeight = Math.max(...heights);
        setContainerHeight(Math.min(maxHeight, MAX_IMAGE_HEIGHT));
      } catch (error) {
        console.error("Error calculating image heights:", error);
        setContainerHeight(DEFAULT_HEIGHT);
      }
    };

    if (images?.length > 0) {
      calculateMaxHeight();
    }
  }, [images]);

  const renderImage = ({ item }) => {
    return (
      <View style={{ width: screenWidth, height: containerHeight }}>
        <Image
          source={{ uri: item }}
          style={{
            width: screenWidth,
            height: containerHeight,
            resizeMode: "cover",
          }}
        />
      </View>
    );
  };

  useEffect(() => {
    if (business?.userId) {
      fetchUserDetails();
    }
  }, [business?.userId]);

  const fetchUserDetails = async () => {
    try {
      const userSnap = await getDoc(doc(db, "entrepreneurs", business.userId));
      if (userSnap.exists()) {
        setUserDetails({ ...userSnap.data(), uid: business.userId });
      }
    } catch (error) {
      console.error("Error fetching entrepreneur details:", error);
    } finally {
      setLoading(false); // Set loading to false after data fetch
    }
  };

  const handleDeletePost = async () => {
    if (user?.role !== "entrepreneur") {
      Alert.alert(
        "Permission Denied",
        "You don't have permission to delete this post."
      );
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const idToFetch = entrepreneurId || auth.currentUser?.uid;

              // Instantly remove from the local state
              setLocalPosts((prevPosts) =>
                prevPosts.filter((post) => post.postId !== business.id)
              );

              // Remove from Firestore
              await deleteDoc(doc(db, "BusinessList", business.id));

              const entrepreneurDoc = await getDoc(
                doc(db, "entrepreneurs", idToFetch)
              );

              if (entrepreneurDoc.exists()) {
                const entrepreneurData = entrepreneurDoc.data();
                const posts = Array.isArray(entrepreneurData.posts)
                  ? entrepreneurData.posts
                  : [];

                const updatedPosts = posts.filter(
                  (post) => post.postId !== business.id
                );

                await updateDoc(doc(db, "entrepreneurs", idToFetch), {
                  posts: updatedPosts,
                });

                ToastAndroid.show(
                  "Post deleted successfully!",
                  ToastAndroid.SHORT
                );
              }
            } catch (error) {
              console.error("Error deleting post:", error);
              ToastAndroid.show("Error deleting post.", ToastAndroid.SHORT);

              // Optionally, restore the post in case of an error
              setLocalPosts((prevPosts) => [...prevPosts, business]);
            }
          },
        },
      ]
    );
  };

  const handleEditPost = async () => {
   
  };
  const toggleModal = (show, businessId = null) => {
    Animated.timing(animation, {
      toValue: show ? 1 : 0,
      duration: show ? 300 : 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(show);
      setSelectedItemId(businessId);
    });
  };

  const formatTimeDiff = (dateString) => {
    if (!dateString) return "N/A";
    const diff = (new Date() - new Date(dateString)) / 1000;
    const times = {
      y: diff / (60 * 60 * 24 * 365),
      d: diff / (60 * 60 * 24),
      h: diff / (60 * 60),
      m: diff / 60,
    };

    for (const [unit, value] of Object.entries(times)) {
      if (value >= 1) return `${Math.floor(value)}${unit}`;
    }
    return `${Math.floor(diff)}s`;
  };

  const ModalOption = ({ icon, text, color = "#333", onPress }) => (
    <TouchableOpacity style={styles.modalOption} onPress={onPress}>
      <Feather name={icon} size={24} color={color} />
      <Text style={[styles.modalOptionText, { color }]}>{text}</Text>
    </TouchableOpacity>
  );
 
  return loading ? (
    <SkeletonLayouts.BusinessCard />
  ) : (
    <View style={styles.card}>
      <View style={styles.profileHeader}>
        <View style={styles.headerInfoContainer}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/userProfile/entrepreneurProfile/[entrepreneurid]",
                params: { id: business.userId },
              })
            }
          >
            <Image
              source={{
                uri: userDetails?.profileImage
                  ? userDetails.profileImage
                  : "https://via.placeholder.com/150", // URL of the placeholder image
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {(userDetails?.firstName || userDetails?.username) +
                (userDetails?.lastName ? ` ${userDetails?.lastName}` : "")}
            </Text>
            <Text style={styles.jobRole}>
              {userDetails?.title || "Job Title Unknown"} |{" "}
              {business?.address || "Location Unknown"}
            </Text>
            <Text style={styles.time}>
              {formatTimeDiff(business?.createdAt)}
            </Text>
          </View>

          {!isPublicView && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => toggleModal(true, business.businessId)}
            >
              <Entypo name="dots-three-vertical" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{business?.content}</Text>
        </View>
      </View>

      <View style={{ height: containerHeight }}>
        <Animated.FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          decelerationRate="fast"
          snapToAlignment="center"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          renderItem={renderImage}
          keyExtractor={(_, index) => index.toString()}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: scrollX.interpolate({
                      inputRange: [
                        width * (index - 1),
                        width * index,
                        width * (index + 1),
                      ],
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: "clamp",
                    }),
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <PostActions
        postId={business.id}
        onCommentPress={() => console.log("Navigate to Comments")}
        onSharePress={() =>
          Share.share({ message: `Check out this business: ${business?.name}` })
        }
      />

      {!isPublicView && (
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => toggleModal(false)}
          animationType="none"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => toggleModal(false)}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <ModalOption
                icon="trash-2"
                text="Delete Post"
                onPress={() => {
                  toggleModal(false);
                  handleDeletePost();
                }}
              />
               <ModalOption
                icon="edit"
                text="Edit Post"
                onPress={() => {
                  toggleModal(false);
                  handleEditPost();
                }}
              />
              <ModalOption
                icon="info"
                text="View Details"
                onPress={() => {
                  toggleModal(false);
                  router.push("/businessdetails/" + selectedItemId);
                }}
              />
              <ModalOption
                icon="x"
                text="Cancel"
                color="#FF3B30"
                onPress={() => toggleModal(false)}
              />
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 9,
    borderColor: "#EFEFF0",
    borderWidth: 1,
    width: "100%",
    marginBottom: 15,
    backgroundColor: Colors.primaryColor,
  },
  profileHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  headerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    flex: 1,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 60,
    marginRight: 10,
  },
  profileInfo: {
    justifyContent: "center",
  },
  userName: {
    fontFamily: "lato-bold",
    fontSize: RFValue(14),
    textTransform: "capitalize",
    color: "#333",
  },
  jobRole: {
    fontFamily: "lato",
    fontSize: RFValue(10),
    color: "#6D4C41",
  },
  time: {
    fontFamily: "lato",
    fontSize: RFValue(8),
    color: "#6D4C41",
    marginTop: 2,
  },
  image: {
    height: 400,
    borderRadius: 0,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: -16,
    marginRight: 20,
    marginBottom: 10,
  },
  dot: {
    width: 12,
    height: 6,
    borderRadius: 4,
    backgroundColor: Colors.primaryColor,
    marginHorizontal: 4,
  },
  infoContainer: {
    paddingHorizontal: 9,
    marginVertical: 5,
  },
  name: {
    fontSize: RFValue(11),
  },
  menuButton: {
    padding: 8,
    marginLeft: "auto",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 5,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF0",
    paddingHorizontal: 16,
  },
  modalOptionText: {
    fontSize: RFValue(14),
    fontFamily: "lato",
    marginLeft: 16,
    textAlign: "center",
  },
});

export default RecommendPostCards;
