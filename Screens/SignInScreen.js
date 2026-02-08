// SignInScreen.js
import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./supabase"; // your supabase client
import { setUser } from "./userStore";

const { width, height } = Dimensions.get("window");

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (e) => /^\S+@\S+\.\S+$/.test(e);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      if (!data.user?.email_confirmed_at) {
        Alert.alert(
          "Email Not Confirmed",
          "Please confirm your email before logging in."
        );
        return;
      }

      // set user in memory for ProfileScreen etc.
      setUser({
        name: data.user.user_metadata?.full_name || trimmedEmail.split("@")[0],
        email: data.user.email,
        memberSince: data.user.created_at,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err) {
      console.warn(err);
      Alert.alert("Login Failed", "Something went wrong. Try again.");
    }
  };

  const canLogin = email.trim().length > 0 && password.length > 0;

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBand} />
        <View style={styles.overlay} />

        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <Text style={styles.title}>Sign In</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
              <Ionicons name="mail-outline" size={20} color="#fff" />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginTop: 18 }]}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.7)"
                style={styles.input}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, !canLogin && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={!canLogin}
          >
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.signup}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBand: {
    position: "absolute",
    top: 0,
    height: height * 0.28,
    width: "100%",
    backgroundColor: "rgba(45,150,120,0.22)",
  },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(135,206,250,0.28)" },
  container: { flex: 1, paddingHorizontal: 28, justifyContent: "center" },
  title: {
    fontSize: 44,
    color: "#fff",
    fontWeight: "800",
    marginBottom: 30,
    alignSelf: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  inputGroup: { width: "100%", marginBottom: 12 },
  label: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255,255,255,0.9)",
    paddingVertical: 2,
  },
  input: { flex: 1, color: "#fff", fontSize: 16, paddingVertical: 4 },
  loginButton: {
    marginTop: 28,
    width: "90%",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footerRow: { flexDirection: "row", marginTop: 22, justifyContent: "center" },
  footerText: {
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  signup: {
    color: "#ffb84d",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
