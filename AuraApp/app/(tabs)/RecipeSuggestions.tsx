// Second of 2 helper scripts for the recipes.tsx page:
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";

// interfaces to solve compatibility errors
type RootStackParamList = {
  RecipeSuggestions: undefined;
  RecipeDetail: { recipe: { Name: string } };
};

type RecipeSuggestionsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RecipeSuggestions"
>;

interface Props {
  navigation: RecipeSuggestionsNavigationProp;
}

interface Recipe {
  Name: string;
  Matches: number;
  Ingredients: string;
}

export default function RecipeSuggestions({ navigation }: Props) {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // fetching recipes when search button is clicked
  const fetchRecipes = async () => {
    if (!ingredients.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await axios.post(
        "http://ec2-54-226-212-222.compute-1.amazonaws.com:3000/Suggest",
        {
          ingredients: ingredients
            .split(",")
            .map((i) => i.trim().toLowerCase()),
        }
      );
      setRecipes(res.data.recipes);
      setFilteredRecipes(res.data.recipes);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to fetch recipes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // filter recipes based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter((recipe) =>
        recipe.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const renderRecipeTile = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeTile}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.Name}
        </Text>
        <View style={styles.matchContainer}>
          <Text style={styles.matchText}>
            {item.Matches} ingredient {item.Matches === 1 ? "match" : "matches"}
          </Text>
        </View>
        <Text style={styles.recipeIngredients} numberOfLines={3}>
          {item.Ingredients
            ? item.Ingredients.substring(0, 100) + "..."
            : "No ingredients listed"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined} // small detail, seting to "undefined" and not null since the latter would not work on Android
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      {/* ingredients input Section:*/}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Enter Ingredients</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="e.g. egg, bread, cheese"
            value={ingredients}
            onChangeText={setIngredients}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={fetchRecipes}
            disabled={isLoading || !ingredients.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Find</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* results section */}
      {recipes.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultCount}>
            {filteredRecipes.length}{" "}
            {filteredRecipes.length === 1 ? "Recipe" : "Recipes"} Found
          </Text>
        </View>
      )}

      {/* error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* no results message, this is only shown after search button is clicked */}
      {!isLoading && hasSearched && recipes.length === 0 && !error && (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={50} color="#ccc" />
          <Text style={styles.noResultsText}>
            No recipes found with these ingredients
          </Text>
          <Text style={styles.noResultsSubtext}>
            Try adding more ingredients or checking your spelling
          </Text>
        </View>
      )}

      {/* these are the recipe tiles */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderRecipeTile}
        numColumns={1}
        contentContainerStyle={styles.recipeList}
        ListEmptyComponent={() =>
          !isLoading &&
          hasSearched &&
          recipes.length > 0 &&
          filteredRecipes.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No matches found</Text>
              <Text style={styles.noResultsSubtext}>
                Try a different search term
              </Text>
            </View>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  searchSection: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  searchButton: {
    backgroundColor: "#FFC30B",
    height: 45,
    borderRadius: 8,
    marginLeft: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  resultsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 35,
    width: "60%",
  },
  filterIcon: {
    marginRight: 5,
  },
  filterInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
  },
  recipeList: {
    padding: 10,
  },
  recipeTile: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recipeContent: {
    width: "100%",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  matchContainer: {
    marginBottom: 8,
  },
  matchText: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "500",
  },
  recipeIngredients: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
  },
  errorContainer: {
    padding: 15,
    backgroundColor: "#ffebee",
    margin: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "#c62828",
    textAlign: "center",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    flex: 1,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 10,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
});
