// this is the main/home page (the user's workout planner page)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Modal,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

const { width, height } = Dimensions.get("window");

// this is me define days of the week to be able to use [day].tsx and store device ui properties to local storage (i use a loop to do this later on)
const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const IndexPage = () => {
  const router = useRouter();

  // this is me setting the default titles for each day of the week (can be changed by the user later):
  const [dayTitles, setDayTitles] = useState({
    MONDAY: "MONDAY",
    TUESDAY: "TUESDAY",
    WEDNESDAY: "WEDNESDAY",
    THURSDAY: "THURSDAY",
    FRIDAY: "FRIDAY",
    SATURDAY: "SATURDAY",
    SUNDAY: "SUNDAY",
  });

  // these are the states that will control whatr the user can do (e.g., edit text or colours), will change what can be done afterwards too (e.g., revert or save the changes)
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [colorMenuVisible, setColorMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // these are the default gradient colours for each day (can be changed byt he user too)
  const [dayColors, setDayColors] = useState({
    MONDAY: ["#FF7AA2", "#FFB17A"],
    TUESDAY: ["#9C7BFF", "#D87BFF"],
    WEDNESDAY: ["#FFB17A", "#FFDD6E"],
    THURSDAY: ["#FF5E7E", "#FF9966"],
    FRIDAY: ["#FFAFBD", "#FFC3A0"],
    SATURDAY: ["#00B09B", "#96C93D"],
    SUNDAY: ["#48C6EF", "#6F86D6"],
  });

  // this array is to store the temporary selected colour by the user, (before saving in case they want to revert the change)
  const [tempColors, setTempColors] = useState({});

  // colour options that user can pick from (when in edit mode, the reason for 9 buttons and not less or more is so that theres an aesthetic 3 by 3 grid):
  const colourOptionForUser = [
    ["#4568DC", "#B06AB3"],
    ["#654ea3", "#eaafc8"],
    ["#5EFCE8", "#736EFE"],
    ["#FF8177", "#B12A5B"],
    ["#3494E6", "#EC6EAD"],
    ["#FF8008", "#FFC837"],
    ["#4568DC", "#B06AB3"],
    ["#43C6AC", "#191654"],
    ["#BFF098", "#6FD6FF"],
  ];

  // this runs only once,triggers the initial data loading function to populate the day titles and colours
  useEffect(() => {
    loadSavedData(); // call function that fetches data from AsyncStorage
  }, []);

  // useFocusEffect is an Expo Router hook that runs whenever this screen comes into focus (unlike useEffect, this will run every time the user returns to this screen)
  // this ensures our data refreshes when navigating back from other screens
  useFocusEffect(
    // U
    React.useCallback(() => {
      loadSavedData();
      return () => {};
    }, [])
  );

  // retrieving all saved day titles and colour schemes from user device's storage, then updating the state vars with this data, or using defaults if custom user data doesnt esxist:
  const loadSavedData = async () => {
    // creating copies of the current state to modify with loaded data
    let newTitles = { ...dayTitles };
    let newColors = { ...dayColors };

    // looping through each day of the week (mon, tue, etc.)
    for (let day of DAYS) {
      // retrieving the saved title and colour for this day (key format used is "planTitle-MONDAY" & "dayColors-MONDAY", etc.):
      const title = await AsyncStorage.getItem(`planTitle-${day}`);
      if (title) newTitles[day] = title; // only update if we found something

      const colors = await AsyncStorage.getItem(`dayColors-${day}`);
      if (colors) newColors[day] = JSON.parse(colors); // convert json string back to array
    }

    // updating our state with all the loaded data
    setDayTitles(newTitles);
    setDayColors(newColors);
    setRefreshing(false); // this is important for the case when usr swipes down to bring up the loading animation
  };

  // handling the pull to refresh gesture, showing the spinner and calling data load function
  const onRefresh = () => {
    setRefreshing(true); // shows loading spinner
    loadSavedData(); // reloads all data
  };

  // this part is important, handling what happens when a user taps on a day button like Tuesday:
  const handleNavigation = (day) => {
    if (!isEditing) {
      // if normal mode then navigate to the page of that day:
      router.push(`/(tabs)/myplan_indivPage/${day.toLowerCase()}`);
    } else {
      // if in edit mode then don't navigate, instead show the color picker for this day
      handleColorPicker(day);
    }
  };

  // profile page button logic, sends user to the profile page (userProfile.tsx)
  const navigateToProfile = () => {
    router.push("/(tabs)/loginLogic/userProfile");
  };

  // edit button logic (activating edit mode):
  const handleEdit = () => {
    setIsEditing(true);
  };

  // save button logic (saving colour change), merging the temp change into the main state and saves to storage
  const handleSave = async () => {
    // starting with the current colors
    let finalColors = { ...dayColors };

    // looping through any temporary colours the user selected and applying them to the buttons
    for (let day in tempColors) {
      if (tempColors[day]) {
        finalColors[day] = tempColors[day];
      }
    }

    // this saves each day's colors to AsyncStorage (saving each individually, so using a for loop):
    for (let day of DAYS) {
      await AsyncStorage.setItem(
        `dayColors-${day}`,
        JSON.stringify(finalColors[day])
      );
    }

    // fianlly, updating the state with the final colours
    setDayColors(finalColors);

    // resetting temporary colours since we've applied them
    setTempColors({});

    // exiting edit mode
    setIsEditing(false);

    // making sure colour picker is hidden
    setColorMenuVisible(false);
  };

  // this discards any changes made (for the cancel button)
  const handleCancel = () => {
    setTempColors({}); // clear all temp selections and exit edit mode
    setIsEditing(false);
    setColorMenuVisible(false);
  };

  // this shows the colour picker modal for a specific day
  const handleColorPicker = (day) => {
    setSelectedDay(day);
    setColorMenuVisible(true);
  };

  //applying selected colour to selected day updating temp colours array:
  const applyColor = (colors) => {
    if (selectedDay) {
      setTempColors((prev) => ({
        ...prev,
        [selectedDay]: colors,
      }));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* header bar with the title and action buttons: */}
      <View style={styles.workOutPlanHeaderContainer}>
        <Text style={styles.myPlansTitleText}>My Plans</Text>

        <View style={styles.headerButtons}>
          {isEditing ? (
            // when in edit mode, show cancel and save buttons (x and check)
            <View style={styles.editControlsSmallChanger}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={handleCancel}
              >
                <Feather name="x" size={24} color="#f44336" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={handleSave}
              >
                <Feather name="check" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ) : (
            // when in normal mode, show edit and profile buttons
            <>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={handleEdit}
              >
                <Feather name="edit-2" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={navigateToProfile}
              >
                <Feather name="user" size={24} color="black" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* this is the main scrollable area containing all the day buttons */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* mapping through each day and creating a rectnagle for each one: */}
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={styles.eachDayOfTheWeekButton}
            onPress={() => handleNavigation(day)}
          >
            {/* sorting out the gradient for each button background (rectangle) with either the temp or saved colors */}
            <LinearGradient
              colors={tempColors[day] || dayColors[day]}
              style={styles.gradientBoxesOfIndivDays}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.dayTitleText}>{dayTitles[day]}</Text>
              {/* showing the edit indicator (icon) when in edit mode */}
              {isEditing && (
                <View style={styles.editIndicatorIcon}>
                  <Feather name="edit-3" size={18} color="white" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* simple extra space adder to the bottom of the day pages, to prevent it from being unpressable due to being under the nav bar*/}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* colour picker menu */}
      <Modal
        visible={colorMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setColorMenuVisible(false)}
      >
        {/* full screen overlay that hides the colour picker menu when tapped on */}
        <TouchableOpacity
          style={styles.overlayFull}
          activeOpacity={1}
          onPress={() => setColorMenuVisible(false)}
        >
          <View style={styles.colourMenuPopup}>
            {/* the actual grid of colour gradient options: */}
            <View style={styles.colourOptionsContainer}>
              {colourOptionForUser.map((colors, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.colourOptionForUser}
                  onPress={() => {
                    applyColor(colors);
                    setColorMenuVisible(false);
                  }}
                >
                  {/* displaying each colour option as a gradient */}
                  <LinearGradient
                    colors={colors}
                    style={styles.colourGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// CSS styles ------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8", // this is the background colour fo the whole screen
  },

  // this is the styling for the header container (incl. its colour, padding, etc.)
  workOutPlanHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 25,
    paddingBottom: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)", //  partially transparent black
  },

  // settingthe screen title
  myPlansTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },

  // these are the edit buttons and the profile button
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 12,
  },
  editControlsSmallChanger: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: Platform.OS === "ios" ? 180 : 160, // this allows me to scroll app on the index page past the navbar (without this the Sunday button is unpressable since its under the nav bar)
  },

  // these are the css for individual day buttons (their corner raidus, size, text, spaces in between, etc.)
  eachDayOfTheWeekButton: {
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 20,
  },
  gradientBoxesOfIndivDays: {
    paddingVertical: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  dayTitleText: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },

  // this is the eiditng icon for each colour (padding from the top and right side of screen):
  editIndicatorIcon: {
    position: "absolute",
    top: 30,
    right: 30,
  },

  // these are the styles for the colours option menu (ie what user sees after clicking on the edit button to change the colour of the button):
  overlayFull: {
    // this is for dimming the screen and clearly showing the user that they are in the colour selection menu
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  colourMenuPopup: {
    width: width * 0.7, // changes dynamically depending on the width of the phone
    backgroundColor: "rgba(0, 0, 0, 0.5)", //  partially transparent black
    borderRadius: 37,
    padding: 20,
    alignItems: "center", // these are for the colour showing rectnagles themselves
  },
  colourOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  colourOptionForUser: {
    // styling of the colour displaying rectangles
    width: "30%",
    height: 55,
    marginBottom: 15,
    borderRadius: 25,
    overflow: "hidden",
  },
  colourGradient: { // apologies for inconsistent spelling of colour & color, i wanted to make sure that the code worked (since css js and tsx use amercian spelling)
    flex: 1,
  },
});

export default IndexPage;
