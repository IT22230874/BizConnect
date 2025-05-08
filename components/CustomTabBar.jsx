import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from "../constants/Colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <Svg
        width={500}
        height={80}
        viewBox="0 0 500 80"
        style={styles.svgStyle}
      >
        <Path
          d="M0 0 L150 0 Q 200 40 250 0 L500 0 L500 80 L0 80 Z"
          fill="white"
        />
      </Svg>

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Custom icon sizes and elevation for the central icon
          const iconSize = isFocused && route.name === 'centerTab' ? 35 : 25;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={{ transform: [{ translateY: isFocused && route.name === 'centerTab' ? -15 : 0 }] }}>
                {route.name === 'centerTab' ? (
                  <View style={styles.centerIcon}>
                    <Ionicons name="add-circle" size={iconSize} color={Colors.primaryColor} />
                  </View>
                ) : (
                  <Ionicons name={options.tabBarIconName || 'home'} size={iconSize} color={isFocused ? Colors.secondaryColor : 'gray'} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Transparent so we can see the SVG background
  },
  svgStyle: {
    position: 'absolute',
    bottom: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    position: 'absolute',
    top: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});

export default CustomTabBar;
