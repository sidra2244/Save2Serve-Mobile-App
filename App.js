import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast, { BaseToast } from "react-native-toast-message";

// Screens
import WelcomeScreen from "./screens/WelcomeScreen";
import SignUpScreen from "./screens/SignUpScreen";
import SignInScreen from "./screens/SignInScreen";
import HomePage from "./screens/HomePage";
import ProfileScreen from "./screens/ProfileScreen";
import AboutPage from "./screens/AboutPage";
import SettingsScreen from "./screens/SettingsScreen";
import RecipePage from "./screens/RecipePage";
import GroceryPage from "./screens/GroceryPage";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="About" component={AboutPage} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Recipe" component={RecipePage} />
          <Stack.Screen name="Grocery" component={GroceryPage} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Toast config for Snack */}
      <Toast
        config={{
          // fallback for any custom type
          expiry: (props) => (
            <BaseToast
              {...props}
              style={{
                borderLeftColor: "#f59e0b",
                backgroundColor: "#fff7ed",
                borderRadius: 14,
              }}
              text1Style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#b45309",
              }}
              text2Style={{
                fontSize: 14,
                color: "#78350f",
              }}
            />
          ),
          // default type fallback
          success: (props) => (
            <BaseToast
              {...props}
              style={{ borderLeftColor: "#16a34a", borderRadius: 14 }}
              text1Style={{ fontSize: 16, fontWeight: "bold", color: "#065f46" }}
              text2Style={{ fontSize: 14, color: "#064e3b" }}
            />
          ),
          error: (props) => (
            <BaseToast
              {...props}
              style={{ borderLeftColor: "#dc2626", borderRadius: 14 }}
              text1Style={{ fontSize: 16, fontWeight: "bold", color: "#b91c1c" }}
              text2Style={{ fontSize: 14, color: "#991b1b" }}
            />
          ),
        }}
      />
    </>
  );
}
