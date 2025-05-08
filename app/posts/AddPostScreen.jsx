import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  FlatList,
  Alert,
  SafeAreaView,
} from "react-native";
import { Colors } from "../../constants/Colors";
import RNPickerSelect from "react-native-picker-select";
import { db, storage } from "../../config/FirebaseConfig";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import Header from "../../components/Header";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "expo-router";
import Loading from "../../components/Loading";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../context/authContext";
import { Feather } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";

export default function AddPost({ onPostAdded }) {
  const [categoryList, setCategoryList] = useState([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCategoryList();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need access to your photos to share images.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const fetchCategoryList = async () => {
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
      Alert.alert("Error", "Could not load categories");
    }
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        // aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 9,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => asset.uri);
        setImages((currentImages) => {
          const updatedImages = [...currentImages, ...newImages];
          return updatedImages.slice(0, 9);
        });
      }
    } catch (error) {
      console.error("Error picking images: ", error);
      Alert.alert("Error", "Could not select images");
    }
  };

  const removeImage = (index) => {
    setImages((currentImages) => currentImages.filter((_, i) => i !== index));
  };

  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageItemContainer}>
      <Image source={{ uri: item }} style={styles.imagePreview} />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const uploadImages = async (imageUris) => {
    const uploadPromises = imageUris.map(async (uri) => {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `posts/${user.uid}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.jpg`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);
      return getDownloadURL(storageRef);
    });
    return Promise.all(uploadPromises);
  };

  const validateInputs = () => {
    if (!category.trim()) {
      Alert.alert("Error", "Please select a category");
      return false;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return false;
    }

    return true;
  };

  const onPost = async () => {
    if (!user) {
      Alert.alert("Error", "Please sign in to create a post");
      return;
    }

    if (loading) return;

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      await addDoc(collection(db, "BusinessList"), {
        content: content.trim(),
        category,
        images: imageUrls,
        userId: user.uid,
        userEmail: user.email,
        address: user.address?.city || "",
        // userName: user.displayName || "Anonymous",
        // userAvatar: user.photoURL,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        likeCount: 0,
        commentCount: 0,
      });

      if (onPostAdded) onPostAdded();
      router.push("/(tabsEntrepeneur)/profile");

      // Clear form
      setContent("");
      setCategory("");
      setImages([]);
    } catch (error) {
      console.error("Error creating post: ", error);
      Alert.alert("Error", "Could not create your post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderFooter = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={pickImages}>
        <Feather name="image" size={24} color="#666" />
        <Text style={styles.actionText}>Add photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <Feather name="video" size={24} color="#666" />
        <Text style={styles.actionText}>Take video</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.postButton,
          !content.trim() && !images.length && styles.postButtonDisabled,
        ]}
        onPress={onPost}
        disabled={loading || (!content.trim() && !images.length)}
      >
        <Text
          style={[
            styles.postButtonText,
            !content.trim() && !images.length && styles.postButtonTextDisabled,
          ]}
        >
          {loading ? "Posting..." : "Post"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title={"Create a post"} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentContainer}>
              <TextInput
                placeholder="What do you want to talk about?"
                onChangeText={setContent}
                value={content}
                style={styles.input}
                multiline
                numberOfLines={100}
                maxLength={6000}
              />
            </View>
          </ScrollView>
          <View style={styles.ViewContent}>
            <View style={styles.categoryContainer}>
              <Text style={styles.label}> Select Post Category:</Text>

              <RNPickerSelect
                onValueChange={setCategory}
                items={categoryList}
                value={category}
                placeholder={{ label: "Select a category", value: null }}
                style={pickerSelectStyles}
              />
            </View>
            <View style={styles.imagesContainer}>
              <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                scrollEnabled={false}
              />
            </View>
            {renderFooter()}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    // paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    height: 60,
    marginTop: 20,
    zIndex: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "poppins-semibold",
    color: "#000000",
    flex: 1,
    textAlign: "center",
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.secondaryColor,
    minWidth: 80,
    alignItems: "center",
  },
  postButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  postButtonText: {
    color: "#fff",
    fontFamily: "roboto-bold",
    fontSize: 16,
  },
  postButtonTextDisabled: {
    color: "#666",
  },
  keyboardAvoidingView: {
    flexGrow: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  ViewContent: {
    // padding: 16,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  input: {
    fontSize: 16,
    color: "#000",
    minHeight: 120,
    textAlignVertical: "top",
    // marginBottom: 16,
    fontFamily: "roboto",
  },
  categoryContainer: {
    marginTop: 3,
  },
  imagesContainer: {
    // marginTop: 16,
  },
  imageItemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 4,
  },
  imagePreview: {
    flex: 1,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    // alignContent:"flex-end",
    justifyContent: "flex-end",
    paddingVertical: 7,
    // paaddingTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  actionText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
    fontFamily: "roboto",
  },
  label: {
    color: "#000",
    fontSize: RFValue(11),
    letterSpacing: 0.4,
    fontFamily: "poppins-semibold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    color: "#000",
    fontFamily: "roboto",
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    color: "#000",
    fontFamily: "roboto",
  },
});
