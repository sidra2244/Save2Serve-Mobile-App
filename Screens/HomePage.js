// HomePage.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clearUser } from "./userStore"; // <-- adjust path if needed

const { width } = Dimensions.get("window");

export default function HomePage({ navigation }) {
  const [item, setItem] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const menuButtonRef = useRef(null);

  // safe access to current route name
  const navState = navigation.getState && navigation.getState();
  const currentRoute =
    navState && navState.routes && navState.index >= 0
      ? navState.routes[navState.index].name
      : "Home";

  const handlePlus = () => {
    const trimmed = item.trim();
    if (!trimmed) return; // ignore empty
    Keyboard.dismiss();
    navigation.navigate("Grocery", { itemName: trimmed });
    setItem(""); // clear input
  };

  const closeMenu = () => setMenuVisible(false);

  const handleProfile = () => {
    closeMenu();
    navigation.navigate("Profile");
  };

  const handleSettings = () => {
    closeMenu();
    navigation.navigate("Settings"); // Navigate to SettingsScreen
  };

  const handleLogout = async () => {
    // clear in-memory user
    try {
      clearUser();
    } catch (e) {
      console.warn("Error clearing user:", e);
    }
    closeMenu();

    // reset navigation stack and go to SignIn
    navigation.reset({
      index: 0,
      routes: [{ name: "SignIn" }], // you can change to "Welcome" if preferred
    });
  };

  return (
    <TouchableWithoutFeedback onPress={closeMenu}>
      <ImageBackground
        source={require("../assets/welcome.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        {/* Top-left menu */}
        <View style={styles.topLeft}>
          <TouchableOpacity
            ref={menuButtonRef}
            onPress={() => setMenuVisible((s) => !s)}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            activeOpacity={0.8}
          >
            <Ionicons name="menu" size={35} color="#f59e0b" />
          </TouchableOpacity>

          {/* Dropdown menu */}
          {menuVisible && (
            <View style={styles.menuDropdown}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleProfile}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color="#222"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.menuText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSettings}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="settings"
                  size={18}
                  color="#222"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="log-out"
                  size={18}
                  color="#b91c1c"
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.menuText, { color: "#b91c1c" }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Top-right profile */}
        <View style={styles.topRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person-circle" size={50} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.center}>
          <Text style={styles.heading}>Never waste food again</Text>

          <TextInput
            style={styles.input}
            placeholder="Add your item"
            placeholderTextColor="rgba(255,255,255,0.8)"
            value={item}
            onChangeText={setItem}
            returnKeyType="done"
            onSubmitEditing={handlePlus}
          />

          <TouchableOpacity style={styles.plusButton} onPress={handlePlus}>
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons
              name="home"
              size={28}
              color={currentRoute === "Home" ? "#f59e0b" : "#fff"}
            />
            <Text
              style={[
                styles.navText,
                { color: currentRoute === "Home" ? "#f59e0b" : "#fff" },
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Recipe")}
          >
            <Ionicons
              name="book"
              size={28}
              color={currentRoute === "Recipe" ? "#f59e0b" : "#fff"}
            />
            <Text
              style={[
                styles.navText,
                { color: currentRoute === "Recipe" ? "#f59e0b" : "#fff" },
              ]}
            >
              Recipe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Grocery")}
          >
            <Ionicons
              name="cart"
              size={28}
              color={currentRoute === "Grocery" ? "#f59e0b" : "#fff"}
            />
            <Text
              style={[
                styles.navText,
                { color: currentRoute === "Grocery" ? "#f59e0b" : "#fff" },
              ]}
            >
              Grocery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("About")}
          >
            <Ionicons
              name="information-circle"
              size={28}
              color={currentRoute === "About" ? "#f59e0b" : "#fff"}
            />
            <Text
              style={[
                styles.navText,
                { color: currentRoute === "About" ? "#f59e0b" : "#fff" },
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  topLeft: {
    position: "absolute",
    top: Platform.OS === "ios" ? 52 : 50,
    left: 20,
    zIndex: 200,
  },
  menuDropdown: {
    marginTop: 10,
    width: 170,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  menuText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginVertical: 6,
    borderRadius: 2,
  },
  topRight: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: width * 0.8,
    height: 50,
    backgroundColor: "rgba(245,158,11,0.25)",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
  },
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,40,0.7)",
    paddingVertical: 12,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 2,
  },
});
