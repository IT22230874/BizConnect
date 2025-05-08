import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const TabBar = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tab,
            activeTab === tab ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => onTabPress(tab)}
        >
          {/* Ensure the tab label is wrapped inside a Text component */}
          <Text style={styles.tabText}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  inactiveTab: {
    backgroundColor: '#e0e0e0',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TabBar;
