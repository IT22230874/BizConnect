import { View, Text, FlatList, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import PopularBusinessCards from "./PopularBusinessCards";
import { RFValue } from "react-native-responsive-fontsize";
import { useTranslation } from "react-i18next";

export default function PopularBusiness() {
  const [businessList, setBusinessList] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    GetBusinessList();
  }, []);

  const GetBusinessList = async () => {
    setBusinessList([]);
    const q = query(collection(db, "BusinessList"), limit(10));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setBusinessList((prev) => [...prev, { id: doc.id, ...doc.data() }]);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('business.popular')}</Text>
        <Text style={styles.viewAll}>{t('business.viewAll')}</Text>
      </View>

      <FlatList
        data={businessList}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        renderItem={({ item, index }) => (
          <PopularBusinessCards business={item} key={index} />
        )}
        style={styles.flatList}
        contentContainerStyle={{ paddingRight: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginBottom: 20,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontFamily: "roboto-bold",
    color: Colors.text,
  },
  viewAll: {
    color: "#6D4C41",
    fontFamily: "lato-bold",
    fontSize: RFValue(11),
  },
  flatList: {
    marginLeft: 0,
  },
});