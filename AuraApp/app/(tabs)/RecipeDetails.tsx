// This is the first helper script for the recipes.tsx page:
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RecipeDetail({ route, navigation }) {
  const { recipe } = route.params;

  // parsing ingredients from string to array
  const ingredientsList = recipe.Ingredients
    ? recipe.Ingredients.split(",").map((item) => item.trim())
    : [];

  // parse method steps from the actual Method field
  const preparationSteps = recipe.Method
    ? recipe.Method.split(".")
        .filter((step) => step.trim().length > 0)
        .map((step) => step.trim())
    : ["No preparation steps available"];

  // get serving size from the data
  const servingSize = recipe.Serves ? recipe.Serves : "-";

  return (
    <ScrollView style={styles.container}>
      {/* recipe names */}
      <View style={styles.titleContainer}>
        <Text style={styles.recipeName}>{recipe.Name}</Text>
        <View style={styles.numOfMatchesBadge}>
          <Text style={styles.numOfMatches}>
            {recipe.Matches} match{recipe.Matches !== 1 ? "es" : ""}
          </Text>
        </View>
      </View>

      {/* recipe info */}
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Ionicons name="restaurant-outline" size={22} color="#665" />
          <Text style={styles.infoText}>{servingSize} servings</Text>
        </View>
        {recipe.Energy_kcal && (
          <View style={styles.infoItem}>
            <Ionicons name="flame-outline" size={22} color="#666" />
            <Text style={styles.infoText}>{recipe.Energy_kcal}</Text>
          </View>
        )}
      </View>

      {/* ingredients section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.ingredientsList}>
          {ingredientsList.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Ionicons name="ellipse" size={18} color="#4caf50" />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* this part manages/displays the preparation steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Method</Text>
        <View style={styles.stepsList}>
          {preparationSteps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* nutritional information */}
      {recipe.Nutritional_Information_Per_Serving && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutritional Information</Text>
          <View style={styles.nutritionCard}>
            <Text style={styles.nutritionText}>
              {recipe.Nutritional_Information_Per_Serving}
            </Text>
          </View>
        </View>
      )}

      {/* bottom spacing */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f6f8",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  recipeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  numOfMatchesBadge: {
    backgroundColor: "#ff6b6b",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  numOfMatches: {
    color: "#fff",
    fontWeight: "bold",
  },
  infoCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  infoItem: {
    alignItems: "center",
  },
  infoText: {
    marginTop: 5,
    color: "#666",
    fontSize: 14,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eaeaea",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  ingredientsList: {
    marginBottom: 10,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ingredientText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#555",
  },
  stepsList: {
    marginBottom: 10,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
  nutritionCard: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  nutritionText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  shareButton: {
    backgroundColor: "#4a90e2",
  },
  saveButton: {
    backgroundColor: "#5cb85c",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
