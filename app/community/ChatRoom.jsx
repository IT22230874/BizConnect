import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { collection, query, where, onSnapshot, addDoc, orderBy } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { useAuth } from "../../context/authContext";
import { useLocalSearchParams } from 'expo-router'; // Access route params
import Header from '../../components/Header';
import { Ionicons } from "@expo/vector-icons"; // For the back button

export default function ChatScreen() {
  const { chatRoomId } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef(null);

  // Fetch messages from Firestore for the relevant chat room
  useEffect(() => {
    const messagesRef = collection(db, "Messages");
    const q = query(messagesRef, where("chatRoomId", "==", chatRoomId), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Send a message to Firestore
  const sendMessage = async () => {
    if (newMessage.trim()) {
      await addDoc(collection(db, "Messages"), {
        chatRoomId,
        userId: user.uid,
        userName: user.username,
        message: newMessage,
        createdAt: new Date(),
      });
      setNewMessage("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80} // Adjusted to reduce gap with the input field
    >
      {/* Header with back button */}
      <Header title="Chat">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </Header>

      {/* Message list */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.userId === user.uid ? styles.sentMessage : styles.receivedMessage
          ]}>
            {item.userId !== user.uid && (
              <Text style={styles.usernameText}>{item.userName}</Text>
            )}
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
        ref={flatListRef}
        contentContainerStyle={styles.messageList}
      />

      {/* Input for sending new message */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  messageList: {
    padding: 15,
    flexGrow: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 20,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sentMessage: {
    backgroundColor: "#FF8C00", // Using accent color
    alignSelf: "flex-end",
    borderTopRightRadius: 5, // Add a slight corner difference for a modern look
  },
  receivedMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
    borderTopLeftRadius: 5, // Add a slight corner difference for a modern look
  },
  usernameText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 3,
  },
  messageText: {
    fontSize: 16,
    color: "#222",
  },
  timestamp: {
    fontSize: 11,
    color: "#888",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 30,
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 4,
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#FF8C00", // Using accent color
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
