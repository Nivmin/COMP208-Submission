// importing dependecnies needed for the navigation to operate
import React from "react";
import { Tabs } from "expo-router"; // defining a bottom tab layout with diff. pages
import { TabBar } from "@/components/TabBar"; // using my custom tabbar that i created in TabBar.tsx

// --------------------------------------------

const debug = true;

/* defining resuable component "MyTabLayout",
  which wraps around & controlls how the navbar (TabBar)
  at the bottom of the app works: */
const MyTabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // this hides the default top navigation for each screen
      }}
      // this tells the app to use my custom TabBar and pass it all required props:
      tabBar={(props) => {
        return <TabBar {...props} />;
      }}
    >
      <Tabs.Screen name="index" options={{ title: "My Plans" }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Scores" }} />
      <Tabs.Screen name="calorie_log" options={{ title: "Macros" }} />
      <Tabs.Screen name="recipes" options={{ title: "Recipes" }} />
    </Tabs> // 4 lines above are for creating the 4pages on the TabBar, and giving them names (arent displayed under icons)
  );
};

//testing
console.log("tab bar loaded");

export default MyTabLayout;
