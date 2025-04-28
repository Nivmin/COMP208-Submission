// Hello, this page is for managing user's workout plans for individual days (maximum of 7), storing the data to user's local device storage.
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

const DayPlanPage = () => {
  const router = useRouter();
  // getting the day parameter from the route
  const params = useLocalSearchParams();
  const day = (params.day as string || "UNKNOWN").toUpperCase();

  // state for editing mode (this is used in case user pressees the discard button)
  const [isEditing, setIsEditing] = useState(false);

  // state for the day title
  const [title, setTitle] = useState(day ? day : "UNKNOWN DAY");
  const [backupTitle, setBackupTitle] = useState(title);
  const maxTitleLength = 25;

  // state for gradient colors
  const [dayColors, setDayColors] = useState(["#2C5364", "#203A43"]);

  // initial default dummy workout data, used to populate the workout log in the begining (can be changed)
  const [workouts, setWorkouts] = useState([
    {
      exercise: "Flat bench press",
      sets: ["Set 1: 80 kg 12 reps", "Set 2: 100 kg 8 reps"],
    },
    {
      exercise: "Incline bench press",
      sets: ["Set 1: 70 kg 12 reps", "Set 2: 90 kg 8 reps"],
    },
    {
      exercise: "Seated machine flies",
      sets: ["Set 1: 60 kg 12 reps", "Set 2: 70 kg 8 reps"],
    },
  ]);

  // the backup data for in case of user pressing cancel button reverting edits
  const [backupWorkouts, setBackupWorkouts] = useState([]);

  // loading the saved data when the component is called
  useEffect(() => {
    loadData();
  }, [day]);

  const loadData = async () => {
      // loading title datafroms torage
      const savedTitle = await AsyncStorage.getItem(`planTitle-${day}`);
      if (savedTitle) {
        setTitle(savedTitle);
        setBackupTitle(savedTitle);
      }

      // this is me loading the actual workouts from user storage
      const savedWorkouts = await AsyncStorage.getItem(`planWorkouts-${day}`);
      if (savedWorkouts) {
        const parsedWorkouts = JSON.parse(savedWorkouts);
        setWorkouts(parsedWorkouts);
        setBackupWorkouts(JSON.parse(JSON.stringify(parsedWorkouts))); // copying
      } else {
        // if no workouts saved, backin up the initial state
        setBackupWorkouts(JSON.parse(JSON.stringify(workouts))); 
      }

      // loading the day colours
      const savedColors = await AsyncStorage.getItem(`dayColors-${day}`);
      if (savedColors) setDayColors(JSON.parse(savedColors));

  };

  // this is for sharing the workout plan by saving the data onto the clipboard
  const onShare = async () => {
      const message =
        ` ${title} Yoo, Check out My Workout Plan:\n\n` +
        workouts.map((w) => `${w.exercise}\n${w.sets.join("\n")}`).join("\n\n");
      await Share.share({ message });
  };

  // this is called when the user enters edit mode
  const handleEdit = () => {
    // creating copies of current data to use in case user cancels
    setBackupTitle(title);
    setBackupWorkouts(JSON.parse(JSON.stringify(workouts)));
    setIsEditing(true);
  };

  // this is where i save changes
  const handleSave = async () => {
    try {
      // saving title logic (which will update the button on the index page)
      await AsyncStorage.setItem(`planTitle-${day}`, title);
      
      // saving workouts logic
      await AsyncStorage.setItem(
        `planWorkouts-${day}`,
        JSON.stringify(workouts)
      );
      
      // saving the newly saved data to the backup data
      setBackupTitle(title);
      setBackupWorkouts(JSON.parse(JSON.stringify(workouts)));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  // these are logics for...:
  // cancelling changes
  const handleCancel = () => {
    // revert to backup data
    setTitle(backupTitle);
    setWorkouts(JSON.parse(JSON.stringify(backupWorkouts)));
    setIsEditing(false);
  };

  // updating title
  const handleTitleChange = (text) => {
    if (text.length <= maxTitleLength && text.split("\n").length <= 2) {
      setTitle(text);
    }
  };

  //   updating workout set text
  const handleWorkoutChange = (text, workoutIndex, setIndex) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[workoutIndex].sets[setIndex] = text;
    setWorkouts(updatedWorkouts);
  };

  //   adding new set to a workout
  const addSet = (workoutIndex) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[workoutIndex].sets.push("New set...");
    setWorkouts(updatedWorkouts);
  };

  // adding new exercise
  const addExercise = () => {
    const updatedWorkouts = [
      ...workouts,
      { exercise: "New exercise", sets: ["Set 1..."] },
    ];
    setWorkouts(updatedWorkouts);
  };

  // removing exisitng set:
  const removeSet = (workoutIndex, setIndex) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[workoutIndex].sets.splice(setIndex, 1);
    // handling the logic of user removing all sets, in which case we remove the exercise
    if (updatedWorkouts[workoutIndex].sets.length === 0) {
      updatedWorkouts.splice(workoutIndex, 1);
    }
    setWorkouts(updatedWorkouts);
  };

  // removing exercise:
  const removeExercise = (workoutIndex) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts.splice(workoutIndex, 1);
    setWorkouts(updatedWorkouts);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* this is the header with the same gradient background as in the index.tsx page*/}
        <LinearGradient
          colors={dayColors}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContainer}>
            {/* back button leading back to the index.tsx page*/}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <Feather name="arrow-left" size={28} color="white" />
            </TouchableOpacity>

            {/* day title (editable by user, which is saved and displayed onto the button that corresponds to the day on index.tsx) */}
            <TextInput
              style={styles.dayTitle}
              value={title}
              onChangeText={handleTitleChange}
              multiline
              textAlign="center"
              editable={isEditing}
            />

            {/* right side buttons (save & cancell when editing, or edit & share when viewing) */}
            <View style={styles.rightIcons}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleCancel}
                  >
                    <Feather name="x-circle" size={28} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleSave}
                  >
                    <Feather name="check-circle" size={28} color="white" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.iconButton} onPress={onShare}>
                    <Feather name="share-2" size={28} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleEdit}
                  >
                    <Feather name="edit-3" size={28} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* this is the actual workout list */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {workouts.map((workout, workoutIndex) => (
            <View key={workoutIndex} style={styles.workoutContainer}>
              <View style={styles.exerciseHeader}>
                <TextInput
                  style={styles.exerciseTitle}
                  value={workout.exercise}
                  editable={isEditing}
                  onChangeText={(text) => {
                    const updatedWorkouts = [...workouts];
                    updatedWorkouts[workoutIndex].exercise = text;
                    setWorkouts(updatedWorkouts);
                  }}
                />
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => removeExercise(workoutIndex)}
                    style={styles.removeButton}
                  >
                    <Feather name="trash-2" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                )}
              </View>

              {/* these are the sets for this workout */}
              {workout.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setContainer}>
                  <TextInput
                    style={styles.setText}
                    value={set}
                    editable={isEditing}
                    onChangeText={(text) =>
                      handleWorkoutChange(text, workoutIndex, setIndex)
                    }
                  />
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => removeSet(workoutIndex, setIndex)}
                      style={styles.removeSetButton}
                    >
                      <Feather name="x" size={16} color="#ff6b6b" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* adding set button (only when editing) */}
              {isEditing && (
                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => addSet(workoutIndex)}
                >
                  <Text style={styles.addSetText}>+ Add Set</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* this is the "add exercise" button */}
          {isEditing && (
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={addExercise}
            >
              <Text style={styles.addExerciseText}>+ Add Exercise</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 10 : 30, // this accounts for status bar space
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  iconButton: {
    padding: 5,
  },
  rightIcons: {
    flexDirection: "row",
    gap: 10,
  },
  dayTitle: {
    flex: 1,
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    textAlignVertical: "center",
    paddingHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  workoutContainer: {
    backgroundColor: "#dcdcdc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseTitle: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  removeButton: {
    padding: 5,
  },
  setContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setText: {
    color: "black",
    fontSize: 16,
    backgroundColor: "#e8e9eb",
    padding: 8,
    borderRadius: 5,
    flex: 1,
  },
  removeSetButton: {
    marginLeft: 8,
    padding: 5,
  },
  addSetButton: {
    marginTop: 5,
  },
  addSetText: {
    color: "#24a0ed",
    fontSize: 14,
  },
  addExerciseButton: {
    backgroundColor: "#e8e9eb",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  addExerciseText: {
    color: "#24a0ed",  // button colour hex (ignore this, its for me to encorporate this app wide and not have to search every time)
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 80, 
  },
});

export default DayPlanPage;