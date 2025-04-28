// Hi, this is the tab bar component that shows up at the bottom of the screen. Importing dependencies:
import { View, Image } from "react-native"; // this lets me use basic react native things like View and Image
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"; // this is for animations
import { useState } from "react"; // so i can use state
import { StyleSheet, LayoutChangeEvent } from "react-native"; // style stuff and layout things
import TabBarButton from "@/components/TabBarButton"; // this is the custom tab bar button i made earlier
import { BlurView } from "expo-blur"; // blurry glass effect
import { usePathname } from "expo-router"; // helps get current path
import LinearGradient from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view"; // this is for masekd view
import { Feather } from "@expo/vector-icons"; // this is for vector icons

// finally, declaring the actual TabBar component which i will need to power my navigation bar since its custom (i will pass this into _layout.tsx linking my pages to it):
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  console.log(" tabbar was pressed, action registered succesfuly !!! "); // for testing purposes

  // setting up the state to track dimensions of the tabbar container
  const [
    dimensionsOfTheWholeBottomTabBarContainer,
    setDimensionsOfTheWholeBottomTabBarContainer, // as its name states, used to update the state later
  ] = useState({
    // some default values to start with (will be changed later )
    height: 25,
    width: 120,
  });

  // calculating width of each button based on number of pages (i used to have 5 but now have 4 after removing the ai_camera due to time constraints)
  const fixedCalculatedButtonWidthBasedOnTabbar =
    dimensionsOfTheWholeBottomTabBarContainer.width / 4; // since theres 4 buttons, divide the width

  // this is to hide the tab bar when i am on specifci pages like the workout plan of the specific day (on index.tsx and [day].tsx)
  const thePathImOnRightNow = usePathname(); // this tells me what screen im on right now
  const shouldIHideTheTabBarOrNot =
    thePathImOnRightNow.startsWith("/myplan_indivPage/") || thePathImOnRightNow.startsWith("/loginLogic/") ; // i am explicitely checking if the page i am currently on is the day workout plan or on the login and profile pages, in which case i hide the tab bar !

  // this function is called when the layout of the tabbar changes forcably (e.g., when the device is rotated), this allows for dynamic repositioning of items in the tabbar along with the tabbar itself:
  const whenTheLayoutOfTabBarChangesThenDoThis = (
    someLayoutEvent: LayoutChangeEvent
  ) => {
    setDimensionsOfTheWholeBottomTabBarContainer({
      height: someLayoutEvent.nativeEvent.layout.height,
      width: someLayoutEvent.nativeEvent.layout.width,
    });
  };

  // animation stuff starts here, this shared value is how far the highlighting circle should move
  const animatedXPositionOfTheSelectedTabThingy = useSharedValue(0);

  // this part makes the animated style that will actually be applied
  const thisIsTheStyleThatMakesTheGlowMove = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: animatedXPositionOfTheSelectedTabThingy.value },
      ],
    };
  });

  // now the stuff that gets shown on the screen:
  return (
    <View
      style={
        styles.theOuterMostContainerThatWrapsEverythingIncludingBlurAndImage
      }
    >
      {/* this is the baclkground partially transparetn black png from /assets/ (radial-blur.png) that goes behind the tabbar to increase the aesthetics and readability of the text/icons */}
      {!shouldIHideTheTabBarOrNot && (
        <Image
          source={require("@/assets/radial-blur.png")}
          style={styles.partiallyTransparentImageUnderTheTabbar}
          resizeMode="contain"
        />
      )}

      {/* this part makes the tabbar have a frosty blurry glass effect */}
      <BlurView
        intensity={50}
        tint="dark"
        onLayout={whenTheLayoutOfTabBarChangesThenDoThis}
        style={[
          styles.thisIsTheMainTabbarStyle,
          shouldIHideTheTabBarOrNot
            ? { opacity: 0, pointerEvents: "none" }
            : {},
        ]}
      >
        {/* the little animated bubble that goes behind the selected tab to make it look selected */}
        <Animated.View
          style={[
            thisIsTheStyleThatMakesTheGlowMove,
            {
              position: "absolute",
              backgroundColor: "rgba(255, 255, 255, 0.1)", //partially transparent white
              borderRadius: 30,
              marginHorizontal: 8,
              height: dimensionsOfTheWholeBottomTabBarContainer.height - 17, // adjusting its diemnsions so it fits
              width: fixedCalculatedButtonWidthBasedOnTabbar - 17,
            },
          ]}
        />

        {/* this part shows each button in the navbar (tabbar) like home, leaderboard etc. I removed the Ai camera page since we run out of time and could not implement it*/}
        {[
          { name: "index", label: "Home" },
          { name: "leaderboard", label: "Leaderboard" },
          { name: "calorie_log", label: "My Log" }, // this page is inside another folder hence the path name 
          { name: "recipes", label: "Recipes" },
        ].map((theActualTabDataObjectThing, indexNumberOfThisTab) => {
          const isThisTabCurrentlySelected =
            state.index === indexNumberOfThisTab;

          // this is the logic for what happens when you click a button:
          const whenUserPressesThisTabThenDoThis = () => {
            animatedXPositionOfTheSelectedTabThingy.value = withSpring(
              fixedCalculatedButtonWidthBasedOnTabbar * indexNumberOfThisTab,
              { duration: 1500 }
            );

            const resultOfTryingToNavigate = navigation.emit({
              type: "tabPress",
              target: state.routes[indexNumberOfThisTab].key,
              canPreventDefault: true,
            });

            if (
              !isThisTabCurrentlySelected &&
              !resultOfTryingToNavigate.defaultPrevented
            ) {
              navigation.navigate(state.routes[indexNumberOfThisTab].name);
            }
          };

          return (
            <TabBarButton
              key={theActualTabDataObjectThing.name}
              onPress={whenUserPressesThisTabThenDoThis}
              isFocused={isThisTabCurrentlySelected}
              routeName={
                theActualTabDataObjectThing.name as
                  | "index"
                  | "leaderboard"
                  | "calorie_log"
                  | "recipes"
              }
              label={theActualTabDataObjectThing.label}
            />
          );
        })}
      </BlurView>
    </View>
  );
}

// styles section (all the css code for the tabbar (this excludes the actual text and icons, for that go to TabBarButton.tsx :] )) ------------
const styles = StyleSheet.create({
  theOuterMostContainerThatWrapsEverythingIncludingBlurAndImage: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
  // these are the CSS specifications for the tabbar oval itself (not the bttons), witht he highlighted shifting circle that goes above the selected button:
  thisIsTheMainTabbarStyle: {
    position: "absolute",
    bottom: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.27)", //  see through black
    marginHorizontal: 25,
    paddingVertical: 22,
    borderRadius: 37,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 12,
    shadowOpacity: 0.25,
  },
  // having this underlay is amazing since it means that i dont need to add a shadow with CSS (found this on the internet as a png, you can find it in /assets/)
  partiallyTransparentImageUnderTheTabbar: {
    position: "absolute",
    bottom: -277,
    left: "-75%", // adjusting the distance form the left and right sides of the screen
    right: "-50%",
    width: "250%", // this is to make it  wide
    height: 500, // height of the glow
    opacity: 0.9, // good enough visibility (i dont want this to bee too dark since the colour binning (aka the gradient is not smooth but has harsh lines)(on the png image itself is super obvious and does not look good)
  },
});
