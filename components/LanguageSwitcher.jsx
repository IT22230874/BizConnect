import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Animation state
  const [animation] = useState(
    new Animated.Value(currentLanguage === "en" ? 0 : 1)
  );

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "si" : "en";
    i18n.changeLanguage(newLanguage);

    Animated.spring(animation, {
      toValue: newLanguage === "en" ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  // Flag translation animation
  const flagTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [11, -74],
  });

  // Resize style for Sri Lanka flag
  const resizeStyle =
    currentLanguage === "si"
      ? { width: 24, height: 24 }
      : { width: 24, height: 24 };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.touchableContainer}>
        <LinearGradient
          colors={["#EFEFF0", "#E4EFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.toggleContainer}
        >
          <Animated.View
            style={[
              styles.animatedFlagContainer,
              { transform: [{ translateX: flagTranslateX }] },
            ]}
          >
            {/* English Flag */}
            <View style={styles.flagWrapper}>
              <View style={styles.flagBackground}>
                <Image
                  source={require("../assets/flag-en.png")}
                  style={styles.flagImage}
                />
              </View>
            </View>

            {/* Sinhala Flag with resizeStyle */}
            <View style={styles.flagWrapper}>
              <View style={styles.flagBackground}>
                <Image
                  source={require("../assets/flag-si.png")}
                  style={[styles.flagImage, resizeStyle]}
                />
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  touchableContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  toggleContainer: {
    height: 28,
    width: 55,
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
  },
  animatedFlagContainer: {
    flexDirection: "row",
    position: "absolute",
    width: 120,
    height: "100%",
  },
  flagWrapper: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  flagBackground: {
    backgroundColor: "#FFF",
    padding: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  flagImage: {
    width: 22,
    height: 22,
    resizeMode: "cover",
    borderRadius: 12,
  },
});
