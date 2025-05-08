import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../config/FirebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../context/authContext';
import * as ImagePicker from 'expo-image-picker'; // For image picking
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // For icons
import { Colors } from '../../constants/Colors'; // Use similar colors from the CollabSpaceForm

export default function UpdateCollabSpace() {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [moreImages, setMoreImages] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (postId) {
      fetchPostDetails(postId);
    }
  }, [postId]);

  const fetchPostDetails = async (id) => {
    try {
      const postRef = doc(db, 'CollabSpaces', id);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const data = postSnap.data();
        setPost(data);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setLocation(data.location || '');
        setGoals(data.goals || []);
        setFeaturedImage(data.featuredImage || null);
        setMoreImages(data.moreImages || []);
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching post details: ', error);
    }
  };

  const handleGoalChange = (text, index) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = text;
    setGoals(updatedGoals);
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals((prevGoals) => [...prevGoals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (index) => {
    setGoals((prevGoals) => {
      const updatedGoals = [...prevGoals];
      updatedGoals.splice(index, 1);
      return updatedGoals;
    });
  };

  const pickImage = async (setImage) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } else {
      Alert.alert('Permission to access camera roll is required!');
    }
  };

  const removeImage = (index) => {
    setMoreImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const updateCollabSpace = async () => {
    if (!postId) return;

    if (!featuredImage) {
      Alert.alert('Please select a featured image.');
      return;
    }
    if (moreImages.length === 0) {
      Alert.alert('Please add at least one more image.');
      return;
    }

    try {
      const postRef = doc(db, 'CollabSpaces', postId);
      await updateDoc(postRef, {
        title,
        description,
        location,
        featuredImage,
        moreImages,
        goals,
      });
      Alert.alert('Success', 'CollabSpace updated successfully');
      router.push(`/community/CollabSpace?postId=${postId}`);
    } catch (error) {
      console.error('Error updating CollabSpace: ', error);
    }
  };

  const confirmDeleteCollabSpace = () => {
    Alert.alert(
      'Delete CollabSpace',
      'Are you sure you want to delete this CollabSpace?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: deleteCollabSpace,
        },
      ],
      { cancelable: false }
    );
  };

  const deleteCollabSpace = async () => {
    try {
      const postRef = doc(db, 'CollabSpaces', postId);
      await deleteDoc(postRef);
      Alert.alert('Success', 'CollabSpace deleted successfully');
      router.push('/community');
    } catch (error) {
      console.error('Error deleting CollabSpace: ', error);
    }
  };

  if (!post) {
    return <Text>Loading post details...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Header remains the same */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update CollabSpace</Text>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <MaterialIcons name="more-vert" size={24} color="black" />
        </TouchableOpacity>
        {menuVisible && (
          <View style={styles.menu}>
            <TouchableOpacity onPress={confirmDeleteCollabSpace}>
              <Text style={styles.menuItem}>Delete CollabSpace</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title Input */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description Input */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Location Input */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          value={location}
          onChangeText={setLocation}
        />

        {/* Featured Image */}
        <Text style={styles.label}>Featured Image</Text>
        <TouchableOpacity onPress={() => pickImage(setFeaturedImage)} style={styles.imagePicker}>
          {featuredImage ? (
            <Image source={{ uri: featuredImage }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePlaceholder}>Choose File</Text>
          )}
        </TouchableOpacity>

        {/* More Images */}
        <Text style={styles.label}>More Images</Text>
        {moreImages.map((imageUri, index) => (
          <View key={index} style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeImageButton}>
              <Text style={styles.removeImageButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={() => pickImage((uri) => setMoreImages((prev) => [...prev, uri]))} style={styles.imagePicker}>
          <Text style={styles.imagePlaceholder}>Choose File</Text>
        </TouchableOpacity>

        {/* Goals Section */}
        <Text style={styles.label}>Goals</Text>
        {goals.map((goal, index) => (
          <View key={index} style={styles.goalContainer}>
            <TextInput
              style={styles.goalInput}
              value={goal}
              onChangeText={(text) => handleGoalChange(text, index)}
            />
            <TouchableOpacity onPress={() => removeGoal(index)} style={styles.removeGoalButton}>
              <Text style={styles.removeGoalButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addGoalContainer}>
          <TextInput
            style={styles.goalInput}
            placeholder="Add a new goal"
            value={newGoal}
            onChangeText={setNewGoal}
          />
          <TouchableOpacity style={styles.addGoalButton} onPress={addGoal}>
            <Ionicons name="add-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Update Button */}
        <TouchableOpacity style={styles.submitButton} onPress={updateCollabSpace}>
          <Text style={styles.submitButtonText}>Update CollabSpace</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    marginBottom: 0,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerTitle: {
    flex: 1,
    textAlign: "left",
    marginLeft: 30,
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    marginTop: 20,
    fontFamily: "poppins-semibold",
  },
  input: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.GRAY,
    marginTop: 10,
  },
  textArea: {
    height: 100,
  },
  imagePicker: {
    padding: 15,
    backgroundColor: Colors.GRAY,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  imagePreviewContainer: {
    marginTop: 10,
    position: "relative",
  },
  imagePlaceholder: {
    color: "#888",
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 5,
  },
  removeImageButtonText: {
    color: "#fff",
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  goalInput: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.GRAY,
  },
  removeGoalButton: {
    marginLeft: 10,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 5,
  },
  removeGoalButtonText: {
    color: "#fff",
  },
  addGoalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addGoalButton: {
    marginLeft: 10,
    backgroundColor: Colors.secondaryColor,
    borderRadius: 10,
    padding: 15,
  },
  submitButton: {
    padding: 20,
    backgroundColor: Colors.secondaryColor,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  menu: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  menuItem: {
    padding: 10,
  },
});

