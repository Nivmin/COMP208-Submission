// This script is for manipulating the actual buttosn within the tabbar (so this does not control the tabbar object itself, just the buttons logic; for that go to TabBar.tsx). Importing all the needed dependencies:
import React, { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate, //  this one does the animation size
} from "react-native-reanimated";
import { icon } from "@/constants/icon"; // this is where the little icons come from (aka custom icons without having to externaly import them in form of SVGs (can't use png icons since they can't be manipulated (e.g., their colour & size))
import LinearGradient from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view"; // needed for masekd view
import { Feather } from "@expo/vector-icons"; // need this for icons

const SuperLongNamedTabBarButtonComponentThatHandlesPressing = ({
  onPress, // when user clicks it this triggers
  onLongPress, // not using this functionally at the moment, however might need it later thus am keeping it here
  isFocused, // this says if this page is the one we're on
  routeName, // name of page
  label, // the text that shows below the icon
}: {
  onPress: (event: GestureResponderEvent) => void; // this is just to type the function that runs when tapped
  onLongPress?: (event: GestureResponderEvent) => void; // same thing but for long press
  isFocused: boolean; // checks if this is the selected one or not
  routeName:
    | "index"
    | "leaderboard"
    | "calorie_log"
    | "recipes"; // 4 pages that we use (not 5 anymore due to time constraints)
  label: string; // this is the text like "Log" or "Home"
}) => {
  const scaleThatChangesSizeOfTabIconWhenSelected = useSharedValue(0); // starts as 0 so its normal size

  useEffect(() => {
    // everytime it gets focused or unfocused, we animate the size change
    scaleThatChangesSizeOfTabIconWhenSelected.value = withSpring(
      isFocused ? 1 : 0,
      { duration: 350 } // bit slow however looks nice
    );
  }, [scaleThatChangesSizeOfTabIconWhenSelected, isFocused]);

  const makeIconChangeSizeWhenActiveOrInactive = useAnimatedStyle(() => {
    const sizeItShouldGrowToMaybe = interpolate(
      scaleThatChangesSizeOfTabIconWhenSelected.value,
      [0, 1],
      [1, 1.2] // 20% bigger if active
    );
    return {
      transform: [{ scale: sizeItShouldGrowToMaybe }],
    };
  });

  // this is the actual button logic in the tabbar with the icon and label text:
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.thingThatHoldsEachTab}
    >
      {/* this part is the animated icon that changes size if its selected, setting the colour to be honey yellow if selected, if not then regular pure white */}
      <Animated.View style={makeIconChangeSizeWhenActiveOrInactive}>
        {icon[routeName] &&
          icon[routeName]({
            color: isFocused ? "#FFC30B" : "#FFF",
          })}
      </Animated.View>

      {/* the little label under the icon, im setting its highlighted/selected colour to be yellow and white if not selected, same as the icon above it for consistency and aesthetics :) */}
      <Text style={{ color: isFocused ? "#FFC30B" : "#FFF", fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
};

// export this so i can use it in the tabbar
export default SuperLongNamedTabBarButtonComponentThatHandlesPressing;

const styles = StyleSheet.create({
  thingThatHoldsEachTab: {
    flex: 1, // fill space equally
    justifyContent: "center", // center everything vertically
    alignItems: "center", // center stuff horizontally
    gap: 5, // little space between icon and text
  },
});
