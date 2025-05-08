import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Header from "../../components/Home/Header";
import { Colors } from "../../constants/Colors";
import TabBar from "../../components/TabBar"; 
import CommunityFeed from "../community/CommunityFeed";
import MyCollabSpaces from "../community/MyCollabSpaces";
import JoinedFeed from "../community/JoinedFeed";
import FloatingActionButton from "../community/FloatingActionButton";

export default function community() {
  const [activeTab, setActiveTab] = useState("Community Feed");
  const router = useRouter();

  const renderContent = () => {
    if (activeTab === "Community Feed") {
      return <CommunityFeed />;
    } else if (activeTab === "My CollabSpaces") {
      return <MyCollabSpaces />;
    } else if (activeTab === "Joined") {
      return <JoinedFeed />;
    }
  };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <TabBar
          tabs={["Community Feed", "My CollabSpaces", "Joined"]}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
        {renderContent()}
        <FloatingActionButton onPress={() => router.push("/community/CollabSpaceForm")} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
});
