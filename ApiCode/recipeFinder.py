import sys
import json
import pandas as pd
import re
import os

# Load dataset once at startup
file = os.path.join(os.path.dirname(__file__), 'recipeDataset.csv')
df = pd.read_csv(file, encoding='ISO-8859-1')

def suggest_recipes(available_ingredients):
    if df is None:
        return []

    available_ingredients = set(map(str.lower, available_ingredients))  # lowercase input

    def count_matches(ingredients_text):
        if pd.isna(ingredients_text):
            return 0
        ingredients_set = set(map(str.lower, re.findall(r"\b\w+\b", ingredients_text)))
        return len(ingredients_set.intersection(available_ingredients))
    
    df_copy = df.copy()
    df_copy["Matches"] = df_copy["Ingredients"].apply(count_matches)

    if available_ingredients:
        df_copy = df_copy[df_copy["Matches"] > 0]

    top_recipes = df_copy.sort_values(by="Matches", ascending=False).head(10)
    return top_recipes[[
        "Name", "Ingredients", "Matches", "Method",
        "Energy_kcal", "Nutritional_Information_Per_Serving", "Serves"
    ]].to_dict(orient="records")

def main():
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        ingredients = data.get('ingredients', [])

        recipes = suggest_recipes(ingredients)
        print(json.dumps({"recipes": recipes}))  # Output as JSON
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
