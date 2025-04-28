import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomePage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Calorie Logger is under development...</Text>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});
