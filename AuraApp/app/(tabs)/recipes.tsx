// This script manages the RecipeDetails.tsx and RecipeSuggestions.tsx to provide the user with a working recipes page:
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RecipeSuggestions from "./RecipeSuggestions";
import RecipeDetail from "./RecipeDetails";

type RootStackParamList = {
  RecipeSuggestions: undefined;
  RecipeDetail: { recipe: { Name: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Recipes() {
  return (
    <Stack.Navigator initialRouteName="RecipeSuggestions">
      <Stack.Screen
        name="RecipeSuggestions"
        component={RecipeSuggestions}
        options={{ title: "Find Recipes" }}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetail}
        options={({ route }) => ({ title: route.params.recipe.Name })}
      />
    </Stack.Navigator>
  );
}
