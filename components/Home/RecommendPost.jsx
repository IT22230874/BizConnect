import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore"; 
import { db } from "../../config/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import RecommendPostCards from "./RecommendPostCards";
import { RFValue } from "react-native-responsive-fontsize";

export default function RecommendPost() {
  const [businessList, setBusinessList] = useState([]);

  useEffect(() => {
    GetBusinessList();
  }, []);

  const GetBusinessList = async () => {
    setBusinessList([]);
    const q = query(collection(db, "BusinessList"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setBusinessList((prev) => [...prev, { id: doc.id, ...doc.data() }]);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover More</Text>
        {/* <Text style={styles.viewAll}>View All</Text> */}
      </View>

      {/* Use flexWrap to allow items to wrap into two columns */}
      <View style={styles.listContainer}>
        {businessList.map((item, index) => (
          <RecommendPostCards business={item} key={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginBottom: 20,
    width: "100%",
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontFamily: "roboto-bold",
    color: Colors.text,
  },
  viewAll: {
    color: Colors.primaryColor,
    fontFamily: "roboto",
  },
  listContainer: {
    flexDirection: "row",  // Align items in rows
    flexWrap: "wrap",      // Allow wrapping to create two columns
    justifyContent: "space-between", // Space between columns
    paddingHorizontal: 2, // Add horizontal padding for layout
  },
});
