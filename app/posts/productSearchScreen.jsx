import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { AuthContext } from "../../context/authContext";
import { Colors } from "../../constants/Colors";

const ProductSearchScreen = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  // console.log("posts",posts)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = ["entrepreneurs", "buyers"];
        let allUsers = [];
        let allPosts = [];

        for (const collectionName of usersCollection) {
          const usersRef = collection(db, collectionName);
          const querySnapshot = await getDocs(usersRef);

          querySnapshot.forEach((doc) => {
            allUsers.push({ id: doc.id, ...doc.data() });
          });
        }

        // Fetch posts
        const postsRef = collection(db, "BusinessList");
        const postSnapshot = await getDocs(postsRef);
        postSnapshot.forEach((doc) => {
          allPosts.push({ id: doc.id, ...doc.data() });
        });

        setUsers(allUsers);
        setFilteredUsers(allUsers);
        setPosts(allPosts);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text === "") {
      setFilteredUsers([]);
      setFilteredPosts([]);
    } else {
      const filteredUsers = users.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(text.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(text.toLowerCase())
      );

      const filteredPosts = posts.filter(
        (post) =>
          post.about?.toLowerCase().includes(text.toLowerCase()) ||
          post.content?.toLowerCase().includes(text.toLowerCase())
      );

      setFilteredUsers(filteredUsers);
      setFilteredPosts(filteredPosts);
    }
  };

  const handleUserPress = (userId) => {
    router.push({
      pathname: "/userProfile/entrepreneurProfile/[entrepreneurid]",
      params: { id: userId },
    });
  };

  const handleViewPosts = () => {
    router.push({
      pathname: "./SearchPostsScreen",
      params: { query: searchQuery },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#6D4C41" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#6D4C41"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search" // Change keyboard button to "Search"
              onSubmitEditing={handleViewPosts} // Trigger search when pressing "Search"
            />
          </View>
        </View>
      </View>
      {searchQuery.length > 0 && filteredUsers.length > 0 && (
        <FlatList
          data={filteredUsers}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleUserPress(item.id)}
              style={styles.userItem}
            >
              <Ionicons
                name="search"
                size={20}
                color="#6D4C41"
                style={styles.userIcon}
              />
              <Text style={styles.info}>
                <Text
                  style={styles.userName}
                >{`${item.firstName} ${item.lastName} `}</Text>
                {item.title && (
                  <Text style={styles.title}>{`| ${item.title}`}</Text>
                )}
                {item.address?.city && (
                  <Text style={styles.title}>{`| ${item.address?.city}`}</Text>
                )}
              </Text>
              <Image
                source={{
                  uri: item.profileImage || "https://via.placeholder.com/150",
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 33,
    backgroundColor: Colors.primaryColor,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  backButton: {
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFF0",
    paddingVertical: 2.5,
    paddingHorizontal: 15,
    borderRadius: 14,
  },
  searchInput: {
    fontSize: RFValue(13),
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.GRAY,
  },
  userIcon: {
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  userName: {
    fontSize: RFValue(13),
    fontWeight: "bold",
    color: "#000",
  },
  title: {
    fontSize: RFValue(10),
    color: "#000",
    flex: 1,
  },
  profileImage: {
    width: 33,
    height: 33,
    borderRadius: 25,
  },
});

export default ProductSearchScreen;
