// this is the main layout for my app
// it handles font loading, splash screen hiding, and wraps the navigator in a gesture handler:

import { Stack } from "expo-router"; // navigation stack
import { useFonts } from "expo-font"; // for loading custom fonts
import * as SplashScreen from "expo-splash-screen"; // to manage splash screenb ehavior
import { useEffect } from "react";
import "react-native-reanimated"; // needed for reanimated animations
import { GestureHandlerRootView } from "react-native-gesture-handler"; //wrapping gesture-based interactions (i.e., pressing buttons or swiping, etc.)

// prevent the splash screen from auto-hiding until fonts are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // this is where custom font would be loaded, we didnt use any as of when i am writing this, however the possibility is here for the future iterations :)
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // hide splash screen once fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // if fonts not loaded , show nothing (avoid flashing)
  if (!loaded) {
    return null;
  }

  return (
    // wrapping app in gesturehandlerrootview to make gesture interactions work smoohtly
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* main stack navigator hiding headers for all screens */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* this loads the (tabs) layout folder as the base tab navigator */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
