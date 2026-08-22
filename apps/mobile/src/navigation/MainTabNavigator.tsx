import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeScreen } from "../screens/student/HomeScreen";
import { ExploreScreen } from "../screens/student/ExploreScreen";
import { LibraryScreen } from "../screens/student/LibraryScreen";
import { ProfileScreen } from "../screens/student/ProfileScreen";
import { MiniPlayer } from "../components/player/MiniPlayer";
import { Colors, Spacing, Typography, Layout } from "../theme";
import { usePlayerStore } from "../stores/playerStore";

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: "🏠", Explore: "🔍", Library: "📚", Profile: "👤",
  };
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name]}</Text>
    </View>
  );
};

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { episode } = usePlayerStore();
  const extraBottom = episode ? Layout.miniPlayerHeight : 0;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: Layout.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: Spacing.sm,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: {
            fontSize: Typography.size.xs,
            fontWeight: Typography.weight.medium,
            marginTop: 2,
          },
          tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        })}
        {...({ sceneContainerStyle: { marginBottom: extraBottom } } as any)}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Mini player floats above tab bar */}
      <MiniPlayer />
    </View>
  );
}
