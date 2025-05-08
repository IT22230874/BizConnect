import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";
import Header from "../../components/Home/Header";
import BidPosts from "../bids/bidPosts";
import { RFValue } from "react-native-responsive-fontsize";
import OngoingBids from "../bids/ongoingBids";
import TabBar from "../../components/TabBar";

export default function Bids() {
  const [activeTab, setActiveTab] = useState("Jobs");

  const renderContent = () => {
    if (activeTab === "Jobs") {
      return <BidPosts />;
    } else if (activeTab === "Ongoing Jobs") {
      return <OngoingBids />;
    } else if (activeTab === "Jobs Received") {
      return <OfferBids />;
    }
  };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <TabBar
          tabs={["Jobs","Jobs Recieved","Ongoing Jobs"]}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
        {renderContent()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
});
