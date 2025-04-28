import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList } from "react-native";

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<
    { userId: string; name: string; points: number }[]
  >([]);

  // these are hard coded values for tesitng
  const userId = "user777";
  const name = "Dan Fredrickson";

  const sendAction = async (action: "login" | "track") => {
    const res = await fetch(`${API_BASE}/api/update-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, action }),
    });
    const data = await res.json();
    console.log(data);
    fetchLeaderboard();
  };

  const fetchLeaderboard = async () => {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    const data = await res.json();
    setLeaderboard(data);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // displaying the data, including the descending order of users based off of their points (highest is on the top), capping the number to 10:
  // THIS IS STILL IN PROGRESS:
  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => (
          <Text style={{ marginVertical: 5 }}>
            {index + 1}. {item.name} - {item.points} pts
          </Text>
        )}
      />

      <Button title="Login (+1 pt)" onPress={() => sendAction("login")} />
    </View>
  );
}
