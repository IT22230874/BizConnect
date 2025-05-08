import {
  FlatList,
  Image,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { useAuth } from "../../context/authContext"; // Import useAuth to access user data
import { useRouter } from "expo-router"; // Import useRouter for navigation

export default function Slider() {
  const { user } = useAuth(); // Get the current user and their role
  const flatListRef = useRef(null);
  const [sliderList, setSliderList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false); // State to track registration status

  // Define your local images and their corresponding screen links
  const assetImages = {
    entrepreneurSlider: [
      {
        image: require("../../assets/images/sliders/slider1.jpg"),
        screenLink: isRegistered ? "/fund/status" : "/fund/fundExplain", // Use isRegistered for dynamic link
      },
      {
        image: require("../../assets/images/sliders/slider2.jpg"),
        screenLink: "/(tabsEntrepeneur)/community",
      },
    ],
  };

  useEffect(() => {
    const fetchSliderData = async () => {
      if (user?.role === "entrepreneur") {
        // Check if the entrepreneur is registered
        await checkRegistrationStatus();
        // Load sliders from assets if the user is an entrepreneur
        setSliderList(assetImages.entrepreneurSlider);
      } else if (user?.role === "buyer") {
        // Fetch sliders from Firestore for buyers
        await GetSliderList();
      }
    };

    fetchSliderData();
  }, [user]); // Depend only on user

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderList.length > 0) {
        scrollToNextItem();
      }
    }, 5000); // Auto-scroll every 5 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [sliderList, currentIndex]);

  // Check registration status
  const checkRegistrationStatus = async () => {
    const q = query(collection(db, "fundReg"), where("registrationStatus", "==", true && "userId", "==", user?.uid)); // Ensure correct structure
    const querySnapshot = await getDocs(q);
    setIsRegistered(!querySnapshot.empty); // Set registered status based on query results
  };

  // Fetch sliders from Firestore for buyers
  const GetSliderList = async () => {
    const q = query(collection(db, "sliders")); // Query Firestore collection for sliders
    const querySnapshot = await getDocs(q);
    const sliderItems = [];

    querySnapshot.forEach((doc) => {
      sliderItems.push({
        imageUrl: doc.data().imageUrl, // Assuming Firestore has a field 'imageUrl'
        screenLink: doc.data().screenLink, // Assuming Firestore has a field 'screenLink'
      });
    });

    setSliderList(sliderItems); // Update the state with Firestore data
  };

  const scrollToNextItem = () => {
    if (flatListRef.current && sliderList.length > 0) {
      const nextIndex = (currentIndex + 1) % sliderList.length; // Looping logic
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  };

  // Function to handle image press
  const handleImagePress = (screenLink) => {
    if (user?.role === "entrepreneur") {
      router.push(screenLink); // Navigate to the corresponding screen
    } 
    // else {
    //   // Show an alert if the user is a buyer
    //   // Alert.alert(
    //   //   "Access Denied",
    //   //   "You cannot access this section as a buyer.",
    //   //   [{ text: "OK" }] // Button to dismiss the alert
    //   // );
    // }
  };

  return (
    <View style={{ backgroundColor: Colors.background }}>
      <Text
        style={{
          fontSize: RFValue(17),
          fontFamily: "roboto-bold",
          paddingLeft: 20,
          paddingTop: 20,
          color: Colors.text,
        }}
      >
        Special For You
      </Text>
      <FlatList
        ref={flatListRef}
        data={sliderList}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleImagePress(item.screenLink)}>
            <Image
              source={
                user?.role === "entrepreneur"
                  ? item.image // Local asset for entrepreneurs
                  : { uri: item.imageUrl } // Use Firestore image URL for buyers
              }
              style={{
                width: 366,
                height: 186,
                borderRadius: 15,
                marginRight: 30,
              }}
            />
          </TouchableOpacity>
        )}
        style={{
          paddingLeft: 20,
          marginTop: 20,
        }}
        keyExtractor={(item, index) => index.toString()}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
}
