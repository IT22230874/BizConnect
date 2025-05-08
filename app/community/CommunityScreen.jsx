import React, { useState } from 'react';
import CommunityFeed from './CommunityFeed';
import JoinedFeed from './JoinedFeed';
import MyCollabSpaces from './MyCollabSpaces'; // MyCollabSpaces component
import FloatingActionButton from './FloatingActionButton';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../../components/Home/Header';
import { Colors } from '../../constants/Colors';
import { RFValue } from 'react-native-responsive-fontsize';


// SearchBar Component
const SearchBar = () => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor="#888"
      />
    </View>
  );
};

// TabBar Component
const TabBar = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.tabBarContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onTabPress(tab)}
          style={styles.tab}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
          {activeTab === tab && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Main Component (unchanged logic)
const CommunityScreen = () => {
  const [activeTab, setActiveTab] = useState('Community Feed');
  const router = useRouter();

  // Render content based on the active tab
  const renderContent = () => {
    if (activeTab === 'Community Feed') {
      return <CommunityFeed />;  // Feed for "My feed" tab
    } else if (activeTab === 'My CollabSpaces') {
      return <MyCollabSpaces />;  // Feed for "My CollabSpaces" tab
    } else if (activeTab === 'Joined') {
      return <JoinedFeed />;  // Feed for "Joined" tab
    }
  };

  return (
  <>
  <Header/>
    <View style={styles.container}>
      {/* <SearchBar /> */}
      <TabBar
        tabs={['Community Feed', 'My CollabSpaces', 'Joined']}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
      {renderContent()}
      <FloatingActionButton onPress={() => router.push('/community/CollabSpaceForm')} />
    </View>
  </>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    height: 40,
    paddingHorizontal: 16,
    fontSize: 16,
  },
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
    color: '#000',
    fontFamily: "roboto-bold",
  },
  activeTabIndicator: {
    marginTop: 4,
    height: 3,
    width: '100%',
    backgroundColor: Colors.secondaryColor,
  },
});

export default CommunityScreen;
