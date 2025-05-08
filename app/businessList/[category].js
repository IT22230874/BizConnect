import { View, FlatList, ActivityIndicator, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import Header from "../../components/Header";
import { db } from "../../config/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import LoadingScreen from "../../components/LoadingScreen";
import RecommendPostCards from "../../components/Home/RecommendPostCards";

export default function BusinessListByCategory() {
  const { category } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [businessList, setBusinessList] = useState([]);

  useEffect(() => {
    getBusinessList();
  }, []);

  const getBusinessList = async () => {
    setBusinessList([]);
    setLoading(true);
    const q = query(
      collection(db, "BusinessList"),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setBusinessList((prev) => [...prev, { id: doc?.id, ...doc.data() }]);
    });
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <LoadingScreen/>
      ) : (
        <>
          <Header title={category} />
          {businessList?.length > 0 ? (
            <FlatList
              data={businessList}
              onRefresh={getBusinessList}
              refreshing={loading}
              renderItem={({ item, index }) => (
                <RecommendPostCards business={item} key={index} />
              )}
            />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "roboto",
                  textAlign: "center",
                  color: Colors,
                }}
              >
                No Businesses Found
              </Text>
            </View>
          )}
        </>
      )}
    </>
  );
}
