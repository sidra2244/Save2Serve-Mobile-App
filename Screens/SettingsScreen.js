// SettingsScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // <-- add this

import {
  getUser,
  updateEmail,
  updatePassword,
  getSettings,
  saveNotificationSettings,
  savePreferenceSettings,
} from "./userStore";

export default function SettingsScreen() {
  const navigation = useNavigation(); // <-- add this
  const user = getUser();
  const settings = getSettings();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Email states
  const [currentEmail, setCurrentEmail] = useState(user?.email || "");
  const [newEmail, setNewEmail] = useState("");

  // Password states
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  // Notification toggles
  const [notif, setNotif] = useState(settings.notifications || {});

  // App preferences toggles
  const [prefs, setPrefs] = useState(settings.preferences || { darkMode: false });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();

    // Load Dark Mode from AsyncStorage
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value !== null) setPrefs({ ...prefs, darkMode: value === "true" });
    });
  }, []);

  const handleButtonPressAnim = (callback) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => callback && callback());
  };

  // ------------------------
  // Email update
  // ------------------------
  const handleEmailUpdate = async () => {
    if (!newEmail.includes("@")) {
      Alert.alert("Error", "Enter a valid new email.");
      return;
    }
    try {
      await updateEmail(newEmail);
      setCurrentEmail(newEmail);
      setNewEmail("");
      Alert.alert("Success", "Email updated successfully!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // ------------------------
  // Password update
  // ------------------------
  const handlePasswordUpdate = async () => {
    if (newPass.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    try {
      await updatePassword(newPass);
      setOldPass("");
      setNewPass("");
      Alert.alert("Success", "Password updated successfully!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // ------------------------
  // Notification save
  // ------------------------
  const handleSaveNotifs = () => {
    saveNotificationSettings(notif);
    Alert.alert("Saved", "Notification settings updated!");
  };

  // ------------------------
  // Preferences save
  // ------------------------
  const handleSavePrefs = async () => {
    savePreferenceSettings(prefs);
    await AsyncStorage.setItem("darkMode", prefs.darkMode.toString());
    Alert.alert("Saved", "App preferences updated!");
  };

  const handleDarkModeToggle = (val) => {
    setPrefs({ ...prefs, darkMode: val });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: prefs.darkMode ? "#1e3c72" : "#f7f7f7" }]}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
<TouchableOpacity
  style={styles.backButtonIcon}
  onPress={() => navigation.goBack()}
>
  <Text style={styles.icon}>←</Text>
</TouchableOpacity>


      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>Settings</Animated.Text>

      {/* Email */}
      <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>Change Email</Animated.Text>
      <TextInput
        style={[styles.input, { color: prefs.darkMode ? "#fff" : "#000" }]}
        placeholder="Current Email"
        value={currentEmail}
        editable={false}
        placeholderTextColor={prefs.darkMode ? "rgba(255,255,255,0.5)" : "#999"}
      />
      <TextInput
        style={[styles.input, { color: prefs.darkMode ? "#fff" : "#000" }]}
        placeholder="New Email"
        value={newEmail}
        onChangeText={setNewEmail}
        placeholderTextColor={prefs.darkMode ? "rgba(255,255,255,0.5)" : "#999"}
      />
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={() => handleButtonPressAnim(handleEmailUpdate)}>
          <Text style={styles.btnText}>Update Email</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Password */}
      <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>Change Password</Animated.Text>
      <TextInput
        style={[styles.input, { color: prefs.darkMode ? "#fff" : "#000" }]}
        placeholder="Old Password"
        secureTextEntry
        value={oldPass}
        onChangeText={setOldPass}
        placeholderTextColor={prefs.darkMode ? "rgba(255,255,255,0.5)" : "#999"}
      />
      <TextInput
        style={[styles.input, { color: prefs.darkMode ? "#fff" : "#000" }]}
        placeholder="New Password"
        secureTextEntry
        value={newPass}
        onChangeText={setNewPass}
        placeholderTextColor={prefs.darkMode ? "rgba(255,255,255,0.5)" : "#999"}
      />
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={() => handleButtonPressAnim(handlePasswordUpdate)}>
          <Text style={styles.btnText}>Update Password</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Notifications */}
      <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>Notification Settings</Animated.Text>
      {Object.keys(notif).map((key) => (
        <View style={styles.row} key={key}>
          <Text style={[styles.label, { color: prefs.darkMode ? "#ffd369" : "#222" }]}>{formatKey(key)}</Text>
          <Switch
            value={notif[key]}
            onValueChange={(val) => setNotif({ ...notif, [key]: val })}
          />
        </View>
      ))}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={() => handleButtonPressAnim(handleSaveNotifs)}>
          <Text style={styles.btnText}>Save Notification Settings</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Preferences */}
      <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>App Preferences</Animated.Text>
      {Object.keys(prefs).map((key) => (
        <View style={styles.row} key={key}>
          <Text style={[styles.label, { color: prefs.darkMode ? "#ffd369" : "#222" }]}>{formatKey(key)}</Text>
          <Switch
            value={prefs[key]}
            onValueChange={(val) => handleDarkModeToggle(val)}
          />
        </View>
      ))}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity style={styles.button} onPress={() => handleButtonPressAnim(handleSavePrefs)}>
          <Text style={styles.btnText}>Save Preferences</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const formatKey = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase());

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backButtonIcon: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#FFA500",
  justifyContent: "center",
  alignItems: "center",
  margin: 10,
},

icon: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
},

backText: {
  fontSize: 16,
  color: "#fff",
  fontWeight: "bold",
  marginLeft: 5,
},
headerBack: {
  position: "absolute",
  top: 45,
  left: 15,
  padding: 8,
},

headerText: {
  fontSize: 22,
  color: "#FFA500",
  fontWeight: "bold",
},

  backText: { fontSize: 18, color: "#f59e0b" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#f59e0b" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 25, color: "#f59e0b" },
  input: { backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 10, marginTop: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 12, alignItems: "center" },
  label: { fontSize: 16 },
  button: { backgroundColor: "#f59e0b", padding: 14, marginTop: 15, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
