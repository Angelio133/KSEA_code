import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import MapScreen from "../screens/MapScreen";
import DrivingModeScreen from "../screens/DrivingModeScreen";
import ReportScreen from "../screens/ReportScreen";
import { colors } from "../theme/Theme";

// import ProfileScreen from "../screens/ProfileScreen";
// import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function getTabIcon(routeName) {
  switch (routeName) {
    case "Accueil":
      return "🏠";
    case "Carte":
      return "🗺️";
    case "Signaler":
      return "⚠️";
    default:
      return "•";
  }
}

function CustomTabButton({ route, isFocused, onPress }) {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0,
      friction: 6,
      tension: 70,
      useNativeDriver: false,
    }).start();
  }, [isFocused, scaleAnim]);

  const iconScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.22],
  });

  const activeWidth = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, 116],
  });

  const activeOpacity = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const labelOpacity = scaleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.2, 1],
  });

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.9,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 4,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.customTabTouchable}
    >
      <Animated.View
        style={[
          styles.customTabButton,
          {
            width: activeWidth,
            transform: [{ scale: pressAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.activeGlow,
            {
              opacity: activeOpacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.iconCircle,
            isFocused && styles.iconCircleActive,
            {
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <Text style={styles.tabIcon}>{getTabIcon(route.name)}</Text>
        </Animated.View>

        {isFocused && (
          <Animated.Text
            numberOfLines={1}
            style={[
              styles.activeLabel,
              {
                opacity: labelOpacity,
              },
            ]}
          >
            {route.name}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <CustomTabButton
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              options={options}
            />
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Carte" component={MapScreen} />
      <Tab.Screen name="Signaler" component={ReportScreen} />
      {/* <Tab.Screen name="Profil" component={ProfileScreen} /> */}
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="DrivingMode" component={DrivingModeScreen} />
        {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    alignItems: "center",
    zIndex: 999,
  },

  tabBar: {
    width: "100%",
    height: 78,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.96)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === "ios" ? 10 : 4,
    paddingTop: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 18,
  },

  customTabTouchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  customTabButton: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    overflow: "hidden",
  },

  activeGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary || "#5856D6",
    borderRadius: 26,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(88,86,214,0.09)",
  },

  iconCircleActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  tabIcon: {
    fontSize: 22,
  },

  activeLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
    maxWidth: 62,
  },
});
