import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Image,
  KeyboardAvoidingView,
  ToastAndroid,
  Animated,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { db } from "../../config/FirebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import { Colors } from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { StatusBar } from "expo-status-bar";
import Header from "../Header";
// import Clipboard from "@react-native-clipboard/clipboard";

const CommentsModal = ({ visible, onClose, postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [animation] = useState(new Animated.Value(0));
  const [editText, setEditText] = useState(""); // State for the new comment text

  // console.log(user.username);
  // Fetch comments for the post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsRef = collection(db, "BusinessList", postId, "comments");
        const snapshot = await getDocs(commentsRef);
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments: ", error);
      }
    };

    if (postId && visible) {
      fetchComments();
    }
  }, [postId, visible]);

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      ToastAndroid.show("Comment cannot be empty!", ToastAndroid.BOTTOM);
      return;
    }

    setLoading(true);
    try {
      const commentsRef = collection(db, "BusinessList", postId, "comments");
      await addDoc(commentsRef, {
        userId: user.uid,
        userImage: user.profileImage || "https://via.placeholder.com/150",
        userName:
          user.firstName || user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username,
        comment: newComment.trim(),
        createdAt: serverTimestamp(),
      });
      setComments((prev) => [
        ...prev,
        {
          userId: user.uid,
          userImage: user.profileImage || "https://via.placeholder.com/150",
          userName:
            user.firstName || user.lastName
              ? `${user.firstName}${user.lastName}`
              : user.username,
          comment: newComment.trim(),
          createdAt: new Date(),
        },
      ]);
      setNewComment("");
      //   ToastAndroid.show("Comment added!", ToastAndroid.BOTTOM);
    } catch (error) {
      console.error("Error adding comment: ", error);
      ToastAndroid.show(
        "Error adding comment. Try again.",
        ToastAndroid.BOTTOM
      );
    }
    setLoading(false);
  };

  const handleLongPressComment = (comment) => {
    if (comment.userId === user.uid) {
      // Only show options for the comment owner
      setSelectedComment(comment);
      showModal(comment);
    }
  };

  const showModal = (comment) => {
    setSelectedComment(comment);
    setActionModalVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActionModalVisible(false);
      setSelectedComment(null);
    });
  };

  const slideAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const handleAction = async (action) => {
    try {
      switch (action) {
        // case "copy":
        //   if (!selectedComment) return;

        //   // Copy the comment's text to the clipboard
        //   Clipboard.setString(selectedComment.text);

        //   // Notify the user
        //   ToastAndroid.show(
        //     "Comment copied to clipboard!",
        //     ToastAndroid.BOTTOM
        //   );
        //   break;

        case "delete":
          if (!selectedComment) return;

          const commentDocRef = doc(
            db,
            "BusinessList",
            postId,
            "comments",
            selectedComment.id
          );

          // Delete the comment from Firestore
          await deleteDoc(commentDocRef);

          // Remove the comment locally
          setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== selectedComment.id)
          );

          // Notify the user
          ToastAndroid.show("Comment deleted!", ToastAndroid.BOTTOM);
          break;

        case "edit":
          if (!selectedComment || !editText) return;

          const editDocRef = doc(
            db,
            "BusinessList",
            postId,
            "comments",
            selectedComment.id
          );

          // Update the comment in Firestore
          await updateDoc(editDocRef, { text: editText });

          // Update the comment locally
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === selectedComment.id
                ? { ...comment, text: editText }
                : comment
            )
          );

          // Notify the user
          ToastAndroid.show(
            "Comment edited successfully!",
            ToastAndroid.BOTTOM
          );

          // Clear editing state
          setEditText("");
          break;

        default:
          ToastAndroid.show("Unknown action!", ToastAndroid.BOTTOM);
      }
    } catch (error) {
      console.error(`Error during action ${action}:`, error);
      ToastAndroid.show(
        `Error performing action: ${action}. Try again.`,
        ToastAndroid.BOTTOM
      );
    }

    // Close the modal
    hideModal();
  };

  return (
   <>   
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalContainer} behavior="padding">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={20} color="#333" />
          </TouchableOpacity>
          {/* <View style={{ width: 24 }} /> */}
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => `${item.id}-${item.createdAt}`} // Combining id and timestamp to ensure uniqueness
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() => handleLongPressComment(item)}
              style={styles.commentItem}
            >
              <Image
                source={{ uri: item.userImage }}
                style={styles.userImage}
              />
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>{item.userName}</Text>
                <Text style={styles.commentText}>{item.comment}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={
            <Text style={styles.noCommentsText}>No comments yet.</Text>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity
            onPress={handleAddComment}
            style={styles.sendButton}
            disabled={loading}
          >
            <FontAwesome name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Actions Modal */}
        <Modal
          transparent={true}
          visible={actionModalVisible}
          onRequestClose={hideModal}
          animationType="none"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={hideModal}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: slideAnimation }],
                },
              ]}
            >
              {/* Edit Option */}
              <TouchableOpacity
                key="editOption" // Unique key for this option
                style={styles.modalOption}
                onPress={() => {
                  handleAction("edit");
                  hideModal();
                }}
              >
                <Feather name="edit" size={24} color="#333" />
                <Text style={styles.modalOptionText}>Edit Comment</Text>
              </TouchableOpacity>

              {/* Delete Option */}
              <TouchableOpacity
                key="deleteOption" // Unique key for this option
                style={styles.modalOption}
                onPress={() => {
                  handleAction("delete");
                  hideModal();
                }}
              >
                <Feather name="trash-2" size={24} color="#333" />
                <Text style={styles.modalOptionText}>Delete Comment</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  hideModal();
                  handleAction("reply");
                }}
              >
                <Feather name="message-circle" size={24} color="#333" />
                <Text style={styles.modalOptionText}>Reply</Text>
              </TouchableOpacity> */}
              {/* Copy Option */}
              <TouchableOpacity
                key="copyOption" // Unique key for this option
                style={styles.modalOption}
                onPress={() => {
                  handleAction("copy");
                  hideModal();
                }}
              >
                <Feather name="copy" size={24} color="#333" />
                <Text style={styles.modalOptionText}>Copy</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
   </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop: 10, // Adds space at the top (adjust as necessary)
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontFamily: "poppins-semibold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    padding: 15,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#F7F7F8",
    borderRadius: 8,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  commentText: {
    color: "#555",
  },
  noCommentsText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFF0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F7F7F8",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: Colors.secondaryColor,
    borderRadius: 8,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 5, // Adds a subtle shadow for depth
  },

  modalOption: {
    flexDirection: "row", // Align icon and text in a row
    alignItems: "center", // Center align icon and text vertically
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF0",
    paddingHorizontal: 16, // Adds spacing to the sides for better visuals
  },

  modalOptionText: {
    fontSize: RFValue(14),
    fontFamily: "lato",
    color: "#333",
    marginLeft: 16, // Space between icon and text
    textAlign: "center",
  },

  cancelButton: {
    borderBottomWidth: 0,
    marginTop: 8,
    alignItems: "center", // Center-align the "Cancel" button content
  },

  cancelText: {
    color: "#FF3B30",
    fontFamily: "lato",
  },

  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  deleteText: {
    color: "#FFF",
    fontSize: RFValue(12),
    fontFamily: "lato-bold",
  },
});

export default CommentsModal;
