// Hi, this page is the profile page which also manages the logic of creating .txt file containing the userID pulled with an api request from the aws database that we created (read README.txt for more info):
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  ToastAndroid,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

//this part is the one that actually displays the user info and manages authentication state (i.e., logged in or not using a boolean and api requsests)
const ProfileScreen = () => {
  // using state to track various component conditions
  const [isLoggedIn, setIsLoggedIn] = useState(false); // tracking login status
  const [loading, setLoading] = useState(true); // showing loading indicator
  const [userData, setUserData] = useState<{ [key: string]: any } | null>(null); // Store user data from API
  const router = useRouter(); // this is the navigation helper

  // whenever this page is opened/directed to, first thing it does every time is to check fithe user is logged in:
  // (this helps catch situations when user navigates back to this screen):
  useFocusEffect(
    React.useCallback(() => {
      // for debugging
      console.log("Profile screen focused - checking if user still logged in");
      checkLoginStatus();
    }, [])
  );

  // this verifies if user is logged in by checking for the UserId.txt file locally on user's device
  // if logged in, fetching user data from the server; however if not then redirecting user to login page:
   
  const checkLoginStatus = async () => {
    try {
      // resting loading indicator when checking status, important since wihtout it the loading animations would play indefinitely
      setLoading(true);
      
      // looking for the user ID file in local storage
      const fileInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "UserId.txt"
      );
      console.log("Login file check result:", fileInfo);

      if (fileInfo.exists) {
        // first case, we found the file and reading the user id from it:
        const content = await FileSystem.readAsStringAsync(
          FileSystem.documentDirectory + "UserId.txt"
        );
        console.log("User ID from file:", content);

        // converting the file content to a user ID number (since the .txt file contents are stored in string format, but i need the userID to be of type int to be comparable with the user's userID on aws database)
        const userId = parseInt(content.trim());

        if (!isNaN(userId)) {
          // nice, this state is reached if a valid user ID found, getting user's data:
          setIsLoggedIn(true);
          fetchUserData(userId);
        } else {
          // this part is for a test case of a corrupted file,  only run if the file exists but ID isn't valid
          console.error("Found invalid user ID in file:", content);
          // showing error message and redirectin
          if (Platform.OS === "android") {
            ToastAndroid.show(
              "Login session corrupted sorry! Please login again :)",
              ToastAndroid.SHORT
            );
          }
          redirectToLogin();
        }
      } else {
        // this is run if we couldnt find any userid files at all, user needs to log in
        console.log("No login session found, heading to login screen");
        redirectToLogin();
      }
    } catch (error) {
      // something wentw rong with file operations
      console.error("Error when checking login status: ", error);
      redirectToLogin();
    }
  };

  // this is a helper function to navigate user to login page. Used in multiple places when authentication fails
  const redirectToLogin = () => {
    console.log("Sending user to login page");
    setIsLoggedIn(false);
    setLoading(false);
    
    // replacing current screen to prevent going back to profiel without auth
    router.replace("/(tabs)/loginLogic/loginPage");
  };

  // back button to go to the main screen when user presses back button
  const handleBackButton = () => {
    console.log("User pressed back button");
    router.back(); 
  };

  // this is an imporant part, fetchig user profile information from our backend API using the userID from the text file srtored localy:
  const fetchUserData = async (userId: number) => {
    try {
      console.log("Getting profile data for user:", userId);
      const response = await fetch(
        "http://ec2-54-226-212-222.compute-1.amazonaws.com:3000/GetUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID: userId }),
        }
      );

      const data = await response.json();
      console.log("API sent back:", data);

      if (data.message === "Successful!" && data.user) {
        // nice, this is run if we got user data successfully!
        setUserData(data.user);
        setLoading(false);
      } else {
        // api request worked but user data wasn't found
        console.error("API couldn't get user data:", data);
        if (Platform.OS === "android") {
          ToastAndroid.show("Couldn't load your profile", ToastAndroid.SHORT);
        }
        redirectToLogin();
      }
    } catch (err) {
      // network or server error
      console.error("Something went wrong fetching user data:", err);
      if (Platform.OS === "android") {
        ToastAndroid.show("Can't connect to server", ToastAndroid.SHORT);
      }
      redirectToLogin();
    }
  };

  // handling user logout by completely deleting the userID file (credentials) and redirecting, this also helps us comply with the accesibility standard of the cia triad to increase the security of our users :)
  const handleLogout = async () => {
    try {
      // checking if user is actually logged in first
      const fileInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "UserId.txt"
      );
      console.log("Checking login file before logout:", fileInfo);

      if (fileInfo.exists) {
        // this part does the file deleting to log out
        await FileSystem.deleteAsync(
          FileSystem.documentDirectory + "UserId.txt"
        );

        console.log("Deleted login session file");  // debugging


        // doubel checking the file is gone:
        const checkFileInfo = await FileSystem.getInfoAsync(
          FileSystem.documentDirectory + "UserId.txt"
        );
        console.log("Verified file is gone:", !checkFileInfo.exists);

        // showing success message
        Alert.alert("Success", "You have been logged out successfully!", [
          {
            text: "OK",
            onPress: () => {
              // updating our state and go to login screen
              setIsLoggedIn(false);
              setUserData(null);
              router.replace("/(tabs)/loginLogic/loginPage");
            },
          },
        ]);
      } 
      else {
        // file isnt here already, so sending user back to the loginpage
        console.log("Already logged out");
        router.replace("/(tabs)/loginLogic/loginPage");
      }
    } catch (error) {
      // this part is for catching the case of an error being thrown, in which case we send the user to login page:
      console.error("Problem during logout:", error);
      router.replace("/(tabs)/loginLogic/loginPage");
    }
  };

  // showing loading indicator while getting data
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // second helper function to format date strings for display
  const formatDOB = (dobString: string) => {
    try {
      const dob = new Date(dobString);
      // making sure its a real date
      if (isNaN(dob.getTime())) {
        return "Invalid Date";
      }
      return dob.toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  // main profile screen UI
  return (
    <ScrollView style={styles.container}>
      {/*back button*/}
      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      {/* user heaedr section */}
      <View style={styles.header}>
        <Text style={styles.name}>{`${userData?.Forename || ""} ${
          userData?.Surname || ""
        }`}</Text>
        <Text style={styles.userId}>User ID: {userData?.UserID || "N/A"}</Text>
        <Text style={styles.username}>
          Username: {userData?.Username || "N/A"}
        </Text>
      </View>

      {/* contact section*/}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <InfoRow label="Email" value={userData?.Email || "N/A"} />
      </View>

      {/*personal details section*/}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <InfoRow
          label="Date of Birth"
          value={formatDOB(userData?.DOB || "N/A")}
        />
        <InfoRow label="Points" value={String(userData?.Points || "0")} />
      </View>

      {/*logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// third helper component to display a labeled info row, used for consistent formatting ofp rofile details
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 50, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoLabel: {
    width: 120,
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: "#4285F4",
    fontWeight: "bold",
  },
});

export default ProfileScreen;