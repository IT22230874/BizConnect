import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Create context
export const NotificationContext = createContext();

// Create provider component
export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null); // Store the user's role

  // Get the current user and their role
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        // Assuming you have stored the user role in Firestore or local storage
        // Here you can fetch the user's role from Firestore or AsyncStorage (for example)
        const getUserRole = async () => {
          try {
            // Fetch user role from Firestore or any method you use
            const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
            const userData = userDoc.docs[0]?.data();

            if (userData && userData.role) {
              setUserRole(userData.role); // Set the user role (buyer or entrepreneur)
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        };

        getUserRole();
      } else {
        console.log('No user is signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch notifications and calculate unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!userId || !userRole) {
          console.log('UserId or UserRole is not provided');
          return;
        }

        // Determine the collection to query based on user role
        const notificationsCollectionName = userRole === 'buyer' ? 'BuyerNotifications' : 'EntrepreneurNotifications';
        const notificationsCollection = collection(db, notificationsCollectionName);
        const q = query(notificationsCollection, where('ownerId', '==', userId));
        const notificationsSnapshot = await getDocs(q);
        const notificationsList = notificationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter unread notifications (assuming 'isRead' field exists)
        const unreadNotifications = notificationsList.filter((notification) => !notification.isRead);
        setUnreadCount(unreadNotifications.length); // Set the unread notification count
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (userId && userRole) {
      fetchUnreadCount();
    }
  }, [userId, userRole]);

  return (
    <NotificationContext.Provider value={{ unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
