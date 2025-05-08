import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import RNPickerSelect from "react-native-picker-select";
import { db, storage } from "../../config/FirebaseConfig";
import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  updateDoc,
  doc,
} from "firebase/firestore"; // Ensure you import doc from firestore
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { getAuth } from "firebase/auth";
import Loading from "../../components/Loading";

export default function AddBidEdit() {
  const router = useRouter();
  const { bidId } = useLocalSearchParams();
  const auth = getAuth();
  const user = auth.currentUser;

  const [categoryList, setCategoryList] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [image, setImage] = useState(null);
  const [bidClosingTime, setBidClosingTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [title, setTitle] = useState(bidId ? "Edit Bid" : "Add Bid");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoryList();
    if (bidId) {
      fetchBidDetails();
    }
    requestMediaLibraryPermission(); // Request media library permission when component mounts
  }, [bidId]);

  const fetchCategoryList = async () => {
    setCategoryList([]);
    try {
      const q = query(collection(db, "Category"));
      const querySnapshot = await getDocs(q);
      const categories = querySnapshot.docs.map((doc) => ({
        label: doc.data().name,
        value: doc.data().name,
      }));
      setCategoryList(categories);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }
  };

  const fetchBidDetails = async () => {
    try {
      const bidDoc = await getDoc(doc(db, "Bids", bidId)); // Make sure you import doc
      if (bidDoc.exists()) {
        const data = bidDoc.data();
        setName(data.name);
        setAddress(data.address);
        setDescription(data.description);
        setCategories(data.categories);
        setImage(data.image);
        setBidClosingTime(data.bidClosingTime.toDate());
      } else {
        ToastAndroid.show("Bid not found!", ToastAndroid.BOTTOM);
        router.back();
      }
    } catch (error) {
      console.error("Error fetching bid details: ", error);
      ToastAndroid.show("Error fetching bid details", ToastAndroid.BOTTOM);
    }
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
    }
  };

  const pickImage = async () => {
    // Ensure that permission has been granted before picking an image
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("You need to grant permission to access the image library!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Set the picked image URI
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === "set") {
      setSelectedDate(selectedDate || selectedDate);
      setBidClosingTime(
        new Date(
          selectedDate.setHours(
            selectedTime.getHours(),
            selectedTime.getMinutes()
          )
        )
      );
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (event.type === "set") {
      setSelectedTime(selectedTime || selectedTime);
      setBidClosingTime(
        new Date(
          selectedDate.setHours(
            selectedTime.getHours(),
            selectedTime.getMinutes()
          )
        )
      );
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `bid-images/${user.uid}-${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);

    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const onSubmitPost = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      if (name && address && description && categories && bidClosingTime) {
        let imageUrl = null;

        if (image) {
          imageUrl = await uploadImage(image);
        }

        if (bidId) {
          // Edit existing bid
          await updateDoc(doc(db, "Bids", bidId), {
            name,
            address,
            description,
            categories,
            image: imageUrl || image, // Update image URL if a new image is uploaded
            bidClosingTime,
            userId: user ? user.uid : null,
            userEmail: user ? user.email : null,
          });
          ToastAndroid.show("Bid Updated Successfully", ToastAndroid.BOTTOM);
        } else {
          // Add new bid
          const bidDocRef = await addDoc(collection(db, "Bids"), {
            name,
            address,
            description,
            categories,
            image: imageUrl,
            bidClosingTime,
            userId: user ? user.uid : null,
            userEmail: user ? user.email : null,
          });
          await updateDoc(bidDocRef, { bidId: bidDocRef.id });
          ToastAndroid.show("Post Added Successfully", ToastAndroid.BOTTOM);
        }

        // Refresh the page by navigating back
        router.back();
      } else {
        ToastAndroid.show("Please fill all the fields.", ToastAndroid.BOTTOM);
      }
    } catch (error) {
      console.error("Error adding/updating document: ", error);
      ToastAndroid.show("Error processing bid", ToastAndroid.BOTTOM);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Header title={title} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Image</Text>
        <TouchableOpacity
          onPress={pickImage} // This should always allow picking an image
          style={styles.imagePreviewContainer}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholderContainer}>
              <Text style={styles.imagePlaceholder}>Tap to Add Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Bid Label</Text>
        <TextInput
          placeholder="Title"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <Text style={styles.label}>Address</Text>
        <TextInput
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={setCategories}
            items={categoryList}
            value={categories}
          />
        </View>

        <Text style={styles.label}>Bid Closing Time</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.secondaryColor}
              style={styles.icon}
            />
            <Text style={styles.datePickerText}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={styles.datePickerButton}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.secondaryColor}
              style={styles.icon}
            />
            <Text style={styles.datePickerText}>
              {selectedTime.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          {loading ? (
            <Loading />
          ) : (
            <TouchableOpacity onPress={onSubmitPost} style={styles.button}>
              <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  scrollContainer: {
    padding: 20,
    marginTop: -20,
  },
  imagePreviewContainer: {
    borderRadius: 10,
    backgroundColor: Colors.GRAY,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    overflow: "hidden", // Ensures padding does not affect image size
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  imagePlaceholderContainer: {
    padding: 20, // Apply padding only when showing the placeholder
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    color: "#888",
    fontFamily: "roboto",
  },
  input: {
    padding: 11,
    paddingStart: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    // backgroundColor: "rgba(211, 113, 69, 0.03)",
    fontFamily: "roboto",
  },
  textarea: {
    height: 100,
  },
  pickerContainer: {
    padding: 0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    // backgroundColor: "rgba(211, 113, 69, 0.03)",
    fontFamily: "roboto",
  },
  label: {
    color: "#000",
    fontSize: 14,
    marginTop: 20,
    letterSpacing: 0.4,
    fontFamily: "poppins-semibold",
  },

  datePickerContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Align items to the left
    justifyContent: "space-between", // Align content to the left
    gap: 10,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center", // Center vertically
    paddingHorizontal: 10, // Adjust padding as necessary
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    // backgroundColor: "rgba(211, 113, 69, 0.03)",

    justifyContent: "space-between", // Align content to the left
    flex: 1, // Allow button to grow and fill the space
  },
  datePickerText: {
    fontFamily: "roboto",
    color: "#000",
    fontSize: 16,
  },
  icon: {
    marginLeft: 10, // Space between text and icon
  },

  buttonContainer: {
    marginTop: 20,
    alignItems: "center", // Centering the button or loading spinner
  },
  button: {
    padding: 20,
    width: "100%",
    backgroundColor: Colors.secondaryColor,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.75,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "roboto-bold",
    textTransform: "uppercase",
    fontSize: 16,
  },
});
