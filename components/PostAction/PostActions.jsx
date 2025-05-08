import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { db } from "../../config/FirebaseConfig";
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import CommentsModal from "./CommentsModal";

const PostActions = ({ postId, onCommentPress, onSharePress }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCommentsModalVisible, setCommentsModalVisible] = useState(false);

  const toggleCommentsModal = () => {
    setCommentsModalVisible((prev) => !prev);
  };

  // Fetch initial like and save data
  useEffect(() => {
    const fetchPostData = async () => {
      if (user) {
        const postRef = doc(db, "BusinessList", postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const postData = postSnap.data();
          const currentLikes = postData.likes || [];
          setLikes(currentLikes.length); // Set the number of likes
          setLiked(currentLikes.includes(user?.uid)); // Check if the current user already liked the post
        }

        // Fetch saved post status
        const savedPostRef = doc(db, "users", user.uid, "savedPosts", postId);
        const savedPostSnap = await getDoc(savedPostRef);
        setSaved(savedPostSnap.exists());
      }
    };

    fetchPostData();
  }, [postId, user]);

  // Handle Like Post Action
  const handleLike = async () => {
    const newLiked = !liked;
    const newLikesCount = newLiked ? likes + 1 : likes - 1;

    setLiked(newLiked);
    setLikes(newLikesCount);
    setLoading(true);

    try {
      const postRef = doc(db, "BusinessList", postId);

      if (newLiked) {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
        });
        await addLikeToEntrepreneur(postId);
      } else {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
        });
        await removeLikeFromEntrepreneur(postId);
      }

      setLoading(false);
    } catch (error) {
      setLiked(liked);
      setLikes(likes);
      console.error("Error updating like: ", error);
      setLoading(false);
      ToastAndroid.show(
        "Error updating like. Please try again.",
        ToastAndroid.BOTTOM
      );
    }
  };

  const addLikeToEntrepreneur = async (postId) => {
    try {
      const entrepreneurRef = doc(db, "entrepreneurs", user.uid);
      const entrepreneurPostRef = doc(entrepreneurRef, "posts", postId);
      await setDoc(
        entrepreneurPostRef,
        {
          liked: true,
          likedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error adding like to entrepreneur's post: ", error);
    }
  };

  const removeLikeFromEntrepreneur = async (postId) => {
    try {
      const entrepreneurRef = doc(db, "entrepreneurs", user.uid);
      const entrepreneurPostRef = doc(entrepreneurRef, "posts", postId);
      await setDoc(
        entrepreneurPostRef,
        {
          liked: false,
          unlikedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error removing like from entrepreneur's post: ", error);
    }
  };

  // Handle Save Post
  const handleSave = async () => {
    const newSaved = !saved;
    setSaved(newSaved);
  
    const postRef = doc(db, "BusinessList", postId);
    const userSavedPostsRef = doc(db, "users", user.uid, "savedPosts", postId);
  
    try {
      if (newSaved) {
        // Save the post to the user's savedPosts collection
        await setDoc(userSavedPostsRef, {
          postId: postId,
          savedAt: serverTimestamp(),
        });
        ToastAndroid.show("Post saved!", ToastAndroid.BOTTOM);
      } else {
        // Remove the post from the savedPosts collection
        await deleteDoc(userSavedPostsRef);
  
        // Remove the post from the local state
        setSavedPosts((prevSavedPosts) =>
          prevSavedPosts.filter((post) => post.id !== postId)
        );
  
        ToastAndroid.show("Post removed from saved!", ToastAndroid.BOTTOM);
      }
    } catch (error) {
      console.error("Error saving post: ", error);
      ToastAndroid.show("Error saving post. Please try again.", ToastAndroid.BOTTOM);
    }
  };
  
  return (
    <>
      <View style={styles.actionsContainer}>
        {/* Like Button */}
        <TouchableOpacity
          onPress={handleLike}
          style={styles.actionButton}
          disabled={loading}
        >
          <FontAwesome
            name={liked ? "heart" : "heart-o"}
            size={20}
            color={liked ? Colors.secondaryColor : "#333"}
          />
          <Text style={styles.actionText}>{likes}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity onPress={toggleCommentsModal} style={styles.actionButton}>
          <MaterialIcons name="comment" size={20} color="#333" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity onPress={onSharePress} style={styles.actionButton}>
          <MaterialIcons name="share" size={20} color="#333" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        {/* Save Post Button */}
        <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
          <FontAwesome
            name={saved ? "bookmark" : "bookmark-o"}
            size={20}
            color={saved ? Colors.secondaryColor : "#333"}
          />
          <Text style={styles.actionText}>{saved ? "Saved" : "Save"}</Text>
        </TouchableOpacity>
      </View>
      <CommentsModal
        visible={isCommentsModalVisible}
        onClose={toggleCommentsModal}
        postId={postId}
      />
      
    </>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFF0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#333",
    fontFamily: "lato",
  },
});

export default PostActions;
