import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  Vibration, // Import Vibration for feedback
} from "react-native";
import { db } from "../../config/FirebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import NotificationItem from "../../components/Notifications/NotificationItem";
import Header from "../../components/Header";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";
import LoadingScreen from "../../components/LoadingScreen";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showDeleteButton, setShowDeleteButton] = useState(false); // State to control delete button visibility
  const [longPressTimer, setLongPressTimer] = useState(null); // Timer for long press
  const router = useRouter();

  // Fetch notifications when the component mounts
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchNotifications(user.uid);
      } else {
        console.log("No user is signed in");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch notifications for the logged-in user
  const fetchNotifications = async (userId) => {
    try {
      const notificationsSnapshot = await getDocs(
        query(
          collection(db, "BuyerNotifications"),
          where("ownerId", "==", userId)
        )
      );

      const notificationsList = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const notificationsWithImages = await Promise.all(
        notificationsList.map(async (notification) => ({
          ...notification,
          profileImage: await fetchEntrepreneurImage(
            notification.entrepreneurId
          ),
        }))
      );

      setNotifications(notificationsWithImages);
    } catch (error) {
      console.error("Error fetching notifications: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch entrepreneur's profile image by entrepreneurId
  const fetchEntrepreneurImage = async (entrepreneurId) => {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "entrepreneurs"),
          where("uid", "==", entrepreneurId)
        )
      );

      if (!snapshot.empty) {
        return snapshot.docs[0].data().profileImage;
      }
    } catch (error) {
      console.error("Error fetching entrepreneur image: ", error);
    }
    return null;
  };

  // Handle long press start
  const handleLongPressStart = (notificationId) => {
    Vibration.vibrate(100); // Vibrate for 100 milliseconds
    setLongPressTimer(
      setTimeout(() => {
        toggleNotificationSelection(notificationId); // Show delete button after 1 second
      }, 100)
    ); // Adjust time here if you want a longer or shorter delay
  };

  // Handle long press end
  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer);
    setLongPressTimer(null);
  };

  // Toggle selection of a notification
  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications((prevSelected) => {
      if (prevSelected.includes(notificationId)) {
        // If already selected, remove it
        return prevSelected.filter((id) => id !== notificationId);
      } else {
        // If not selected, add it
        return [...prevSelected, notificationId];
      }
    });
    setShowDeleteButton(true); // Show delete button when a notification is selected
  };

  // Confirm and delete selected notifications
  const handleDeleteNotifications = async () => {
    Alert.alert(
      "Delete Notifications",
      "Are you sure you want to delete the selected notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await Promise.all(selectedNotifications.map(deleteNotification));
            setSelectedNotifications([]); // Clear selection after deletion
            setShowDeleteButton(false); // Hide delete button after deletion
          },
        },
      ]
    );
  };

  // Delete a specific notification
  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "BuyerNotifications", notificationId));
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error deleting notification: ", error);
    }
  };

  const handleNotificationPress = (entrepreneurId) => {
    router.push(`/profile/entrepreneurProfile/${entrepreneurId}`);
  };

  // Render each notification item
  const renderNotificationItem = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item.entrepreneurId)} // Navigate to profile on press
      onLongPress={() => handleLongPressStart(item.id)} // Start long press
      onPressOut={handleLongPressEnd} // End long press
      isSelected={selectedNotifications.includes(item.id)} // Pass selection state to NotificationItem
      showDeleteIcon={
        showDeleteButton && selectedNotifications.includes(item.id)
      } // Show delete icon if selected
    />
  );

  return (
    <View style={styles.screen}>
      {isLoading ? (
        <LoadingScreen /> // Show loading screen while fetching data
      ) : (
        <>
          <Header
            title="Notifications"
            onDeletePress={handleDeleteNotifications}
            showDelete={showDeleteButton && selectedNotifications.length > 0}
          />
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No notifications available.</Text> // This can be removed
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  list: {
    paddingVertical: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
});

export default NotificationScreen;
