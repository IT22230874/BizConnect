// components/AnimatedTabBar.js

import React, { useEffect, useReducer, useRef } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const AnimatedTabBar = ({ state, descriptors, navigation }) => {
  const { bottom } = useSafeAreaInsets();
  const activeIndex = state.index;
  const routes = state.routes;

  const [layout, setLayout] = React.useState([]); // Use state for layout

  const handleLayout = (event, index) => {
    const { x } = event.nativeEvent.layout;
    setLayout((prev) => {
      const newLayout = [...prev];
      newLayout[index] = { x, index };
      return newLayout;
    });
  };

  const xOffset = useDerivedValue(() => {
    if (layout.length !== routes.length) return 0;
    const activeLayout = layout[activeIndex];
    return activeLayout ? activeLayout.x - 25 : 0; // Adjust the offset slightly
  }, [activeIndex, layout]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(xOffset.value, { duration: 250 }) }],
    };
  });

  return (
    <View style={[styles.tabBar, { paddingBottom: bottom }]}>
      <AnimatedSvg
        width={110}
        height={60}
        fill="none"
        viewBox="0 0 110 60"
        style={[styles.activeBackground, animatedStyles]}
      >
        <Path
          fill="#fff" // Fully transparent fill
          d="M20 0H0c11.046 0 20 8.953 20 20v5c0 19.33 15.67 35 35 35s35-15.67 35-35v-5c0-11.045 8.954-20 20-20H20z"
        />
      </AnimatedSvg>

      <View style={styles.tabBarContainer}>
        {routes.map((route, index) => {
          const active = index === activeIndex;
          const { options } = descriptors[route.key];

           // Pass the active status to the tabBarIcon component
           const color = active
           ? Colors.light.tabIconSelected // Use the selected color for active tab
           : Colors.light.tabIconDefault; // Use the default color for inactive tabs

          return (
            <TabBarComponent
              key={route.key}
              active={active}
              options={options}
              color={color}
              onLayout={(e) => handleLayout(e, index)}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabBarComponent = ({ active, options, onLayout, onPress, color  }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (active && ref.current) {
      ref.current.play();
    }
  }, [active]);

  const animatedComponentCircleStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(active ? 1 : 0, { duration: 250 }) }],
    };
  });

  const animatedIconContainerStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active ? 1 : 0.5, { duration: 250 }),
    };
  });

  return (
    <Pressable onPress={onPress} onLayout={onLayout} style={styles.component}>
      <Animated.View
        style={[styles.componentCircle, animatedComponentCircleStyles]}
      />
      <Animated.View
        style={[styles.iconContainer, animatedIconContainerStyles]}
      >
        {options.tabBarIcon ? options.tabBarIcon({ ref, color  }) : <Text>?</Text>}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#f2f2f2",
    height: 75,

  },
  activeBackground: {
    position: "absolute",
  },
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  component: {
    height: 60,
    width: 60,
    marginTop: -5,
  },
  componentCircle: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: "#f2f2f2",
  },
  iconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AnimatedTabBar;
