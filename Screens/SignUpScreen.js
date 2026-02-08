import React, { useState, useRef } from "react";
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
import { supabase } from "./supabase";
import { setUser } from "./userStore";

const { height } = Dimensions.get("window");

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const isValidEmail = (e) => /^\S+@\S+\.\S+$/.test(e);

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Enter your name");
      return;
    }
    if (!isValidEmail(email.trim())) {
      Alert.alert("Error", "Invalid email");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be 6+ characters");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      Alert.alert("Signup Failed", error.message);
      return;
    }

    setUser({
      name: name.trim(),
      email: email.trim(),
      memberSince: new Date().toISOString(),
    });

    Alert.alert("Success", "Account created. Please login.");
    navigation.navigate("SignIn");
  };

  return (
    <ImageBackground source={require("../assets/background.png")} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Text style={styles.title}>Create Account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current.focus()}
              />
              <Ionicons name="person-outline" size={20} color="#fff" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={emailRef}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
              />
              <Ionicons name="mail-outline" size={20} color="#fff" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
            <Text style={styles.loginText}>SIGN UP</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.footer}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 28 },
  title: { fontSize: 38, color: "#fff", fontWeight: "800", marginBottom: 30, alignSelf: "center" },
  inputGroup: { marginBottom: 18 },
  label: { color: "#fff", marginBottom: 6 },
  inputWrapper: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#fff" },
  input: { flex: 1, color: "#fff" },
  loginButton: { backgroundColor: "#f59e0b", padding: 14, borderRadius: 10, marginTop: 20 },
  loginText: { color: "#fff", textAlign: "center", fontWeight: "800" },
  footer: { color: "#fff", textAlign: "center", marginTop: 18 },
});
