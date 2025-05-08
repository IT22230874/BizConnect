import React, {  useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text, // Import RefreshControl
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "../constants/Colors";


const TabBar = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.tabBarContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onTabPress(tab)}
          style={styles.tab}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {tab}
          </Text>
          {activeTab === tab && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
    tabBarContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    tab: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    tabText: {
      fontSize: RFValue(13),
      fontFamily: "roboto",
      color: '#888',
    },
    activeTabText: {
      color:Colors.secondaryColor,
      fontFamily: "roboto-bold",
    },
    activeTabIndicator: {
      marginTop: 4,
      height: 3,
      width: '100%',
      backgroundColor: Colors.secondaryColor,
    },
  });

  export default TabBar;