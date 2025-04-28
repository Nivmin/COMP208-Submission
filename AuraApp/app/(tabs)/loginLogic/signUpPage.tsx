// this is the signup page, which creates new accoutns for users.
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter, useFocusEffect } from "expo-router";
import * as FileSystem from 'expo-file-system'; // importiung the expo router (expos own file system API), thasts used instead of RNFS library since the latter simply didnt work for us

type RootStackParamList = {
  Login: undefined;
  AccountCreator: undefined;
};

type AccountCreatorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AccountCreator'>;

export default function AccountCreator() {
  const [forename, setForename] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navigation = useNavigation<AccountCreatorScreenNavigationProp>();

  const validateForm = () => {
    // basic validation
    if (!forename || !surname || !email || !dateOfBirth || !username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    
    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    // validate date format (DD/MM/YYYY)
   const dobRegex = /^(19|20)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;

    if (!dobRegex.test(dateOfBirth)) {
      Alert.alert('Error', 'Please enter date in YYYY/MM/DD format');
      return false;
    }

    // check passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // making api call to the same endpoint used in authenticator.java
      const response = await fetch('http://ec2-54-226-212-222.compute-1.amazonaws.com:3000/AddUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forename: forename,
          surname: surname,
          email: email,
          dob: dateOfBirth,
          username: username,
          password: password
        }),
      });

      const data = await response.json();
      console.log('Account creation response:', data);

      if (response.ok) {
        Alert.alert(
          'Success',
          'Your account has been created successfully!',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        // sending the user back to the login page:
        router.back();

      } else {
        Alert.alert('Error', data.message || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Account creation error:', error);
      Alert.alert('Connection Error', 'Could not connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>Create Your Account</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Forename</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            value={forename}
            onChangeText={setForename}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Surname</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your last name"
            value={surname}
            onChangeText={setSurname}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleCreateAccount}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4285F4',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: '#A5C2F7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  secondaryButtonText: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
