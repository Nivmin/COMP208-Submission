import { Feather } from "@expo/vector-icons";

// this script helps me run my navigation bar (TabBar) since it manages the icons
export const icon: Record<
  "index" | "leaderboard" | "calorie_log" | "recipes",
  (props: { color: string }) => JSX.Element
> = {
  index: (props: any) => <Feather name="home" size={24} {...props} />, // homepage
  leaderboard: (props: any) => <Feather name="award" size={24} {...props} />, // leaderboard
  calorie_log: (props: any) => (
    <Feather name="clipboard" size={24} {...props} />
  ), // calories
  recipes: (props: any) => <Feather name="book-open" size={24} {...props} />, // recipes
};
