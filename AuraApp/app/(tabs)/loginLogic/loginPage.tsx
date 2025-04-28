// this is the login page
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";

type RootStackParamList = {
  Login: undefined;
  AccountCreator: undefined;
  Dashboard: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const router = useRouter();

  const handleBackButton = () => {
    router.back();
  };

  const handleLogin = async () => {
    // basic validation
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting login with:", { username, password });

      // making api call to login endpoint
      const response = await fetch(
        "http://ec2-54-226-212-222.compute-1.amazonaws.com:3000/Login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok && data.userId) {
        try {
          // storeing just the numeric raw ID without any prefixes (of type int), this is incredibly sensitive so pls do not change
          await FileSystem.writeAsStringAsync(
            FileSystem.documentDirectory + "UserId.txt",
            String(data.userId)
          );
          console.log("User ID saved successfully:", data.userId);

          // verifying the file was created correctly
          const fileInfo = await FileSystem.getInfoAsync(
            FileSystem.documentDirectory + "UserId.txt"
          );
          console.log("File created:", fileInfo);

          if (fileInfo.exists) {
            const content = await FileSystem.readAsStringAsync(
              FileSystem.documentDirectory + "UserId.txt"
            );
            console.log("File content verification:", content);
          }

          Alert.alert("Success", "You have successfully logged in!");

          // Redirect user to index.tsx page
          router.replace("/(tabs)");
        } catch (fileError) {
          console.error("Error writing user ID to file:", fileError);
          Alert.alert(
            "Error",
            "Login successful but failed to save session. Please try again."
          );
        }
      } else {
        Alert.alert(
          "Login Failed",
          data.message || "Invalid username or password"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push("/(tabs)/loginLogic/signUpPage");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ready for those Gains!💪</Text>

      <View style={styles.inputBox}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleCreateAccount}
      >
        <Text style={styles.secondaryButtonText}>Create a New Account</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 35,
    color: "#333",
  },
  inputBox: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4285F4",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: "#A5C2F7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    width: "100%",
    height: 50,
    backgroundColor: "transparent",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  secondaryButtonText: {
    color: "#4285F4",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 30,
    left: 30,
    padding: 10,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 22,
    color: "#4285F4",
    fontWeight: "bold",
  },
});
