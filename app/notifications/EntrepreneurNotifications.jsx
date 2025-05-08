import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Alert,
  Vibration,
  ActivityIndicator,
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
import LoadingScreen from "../../components/LoadingScreen"; // Reuse LoadingScreen for consistency

export default function EntrepreneurNotifications() {
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [selectedNotifications, setSelectedNotifications] = useState([]); // Selected notifications for deletion
  const [showDeleteButton, setShowDeleteButton] = useState(false); // Control delete button visibility
  const [longPressTimer, setLongPressTimer] = useState(null); // Timer for long press detection
  const router = useRouter();
  const [userId, setUserId] = useState(null); // Store authenticated user ID

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchNotifications(user.uid); // Fetch notifications after getting the user ID
      } else {
        console.log("No user is signed in");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch entrepreneur notifications
  const fetchNotifications = async (entrepreneurId) => {
    try {
      const notificationsSnapshot = await getDocs(
        query(
          collection(db, "EntrepreneurNotifications"),
          where("entrepreneurId", "==", entrepreneurId)
        )
      );

      const notificationsList = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationsList);
    } catch (error) {
      console.error("Error fetching notifications: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle long press start to show delete option
  const handleLongPressStart = (notificationId) => {
    Vibration.vibrate(100); // Provide vibration feedback
    setLongPressTimer(
      setTimeout(() => {
        toggleNotificationSelection(notificationId);
      }, 100)
    );
  };

  // Clear long press timer
  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer);
    setLongPressTimer(null);
  };

  // Toggle notification selection for deletion
  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications((prevSelected) => {
      if (prevSelected.includes(notificationId)) {
        return prevSelected.filter((id) => id !== notificationId);
      } else {
        return [...prevSelected, notificationId];
      }
    });
    setShowDeleteButton(true); // Show delete button when an item is selected
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
      await deleteDoc(doc(db, "EntrepreneurNotifications", notificationId));
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification: ", error);
    }
  };

  // Navigate to the buyer's profile when a notification is clicked
  const handleNotificationPress = (buyerId) => {
    router.push(`/profile/buyerProfile/${buyerId}`);
  };

  // Render each notification item
  const renderNotificationItem = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item.buyerId)} // Navigate to buyer profile on press
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
}

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

