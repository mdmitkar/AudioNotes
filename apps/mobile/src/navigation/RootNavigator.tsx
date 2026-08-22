import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuthStore } from "../stores/authStore";
import { MainTabNavigator } from "./MainTabNavigator";
import { AuthNavigator } from "./AuthNavigator";
import { EpisodeDetailScreen } from "../screens/student/EpisodeDetailScreen";
import { SubjectScreen } from "../screens/student/SubjectScreen";
import { TopicScreen } from "../screens/student/TopicScreen";
import { FullPlayerScreen } from "../screens/student/FullPlayerScreen";
import { CreatorDashboardScreen } from "../screens/creator/CreatorDashboardScreen";
import { UploadEpisodeScreen } from "../screens/creator/UploadEpisodeScreen";
import { AdminDashboardScreen } from "../screens/admin/AdminDashboardScreen";
import { Colors } from "../theme";
import { ActivityIndicator, View } from "react-native";

const Stack = createStackNavigator();

export function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="EpisodeDetail"
            component={EpisodeDetailScreen}
            options={{ presentation: "card", headerShown: false }}
          />
          <Stack.Screen
            name="SubjectScreen"
            component={SubjectScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TopicScreen"
            component={TopicScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FullPlayer"
            component={FullPlayerScreen}
            options={{ presentation: "modal", headerShown: false }}
          />
          {(user?.role === "creator" || user?.role === "admin") && (
            <>
              <Stack.Screen name="CreatorDashboard" component={CreatorDashboardScreen} options={{ headerShown: false }} />
              <Stack.Screen name="UploadEpisode" component={UploadEpisodeScreen} options={{ headerShown: false }} />
            </>
          )}
          {user?.role === "admin" && (
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}
