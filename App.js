import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import VigilanceScreen from "./src/screens/VigilanceScreen";
import ReportScreen from "./src/screens/ReportScreen";
import { Colors } from "./src/theme/colors";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: "rgba(255, 255, 255, 0.05)",
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarIcon: ({ color, size }) => {
            let iconName =
              route.name === "Vigilance" ? "shield-radar" : "bullhorn";
            return <Icon name={iconName} size={size + 2} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Vigilance" component={VigilanceScreen} />
        <Tab.Screen name="Signaler" component={ReportScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
