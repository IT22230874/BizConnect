import { FlatList, View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "../../constants/Colors";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import CategoryItem from "./CategoryItem";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    GetCategoryList();
  }, []);

  const GetCategoryList = async () => {
    setCategories([]);
    const q = query(collection(db, "Category"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setCategories((prev) => [...prev, doc.data()]);
    });
  };

  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Category</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>
      <FlatList
        data={categories}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        renderItem={({ item }) => (
          <CategoryItem
            category={item}
            key={item.id} // Use unique key based on item.id
            onCategoryPress={(Category) =>
              router.push(`/businessList/${encodeURIComponent(Category.name)}`)
            }
          />
        )}
        style={styles.categoryList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  title: {
    fontSize: RFValue(17),
    fontFamily: "roboto-bold",
    color: Colors.text,
  },
  viewAll: {
    color: Colors.primaryColor,
    fontFamily: "roboto",
  },
  categoryList: {
    marginLeft: 20,
  },
});
