// AboutPage.js
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AboutPage({ navigation }) {
  const fadeHeading = useRef(new Animated.Value(0)).current;
  const fadeMission = useRef(new Animated.Value(0)).current;
  const fadeDo = useRef(new Animated.Value(0)).current;
  const fadeWhy = useRef(new Animated.Value(0)).current;
  const fadeFooter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeHeading, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(fadeMission, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(fadeDo, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(fadeWhy, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(fadeFooter, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
  }, []);

  const Bullet = () => <Text style={styles.bullet}>{'\u2B24'}</Text>;

  // Current route for highlighting
  const currentRoute = "About";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Animated.Text style={[styles.heading, { opacity: fadeHeading }]}>
          About SaveToServe
        </Animated.Text>

        <Animated.View style={{ opacity: fadeMission, transform: [{ translateY: fadeMission.interpolate({inputRange:[0,1],outputRange:[20,0]}) }] }}>
          <Text style={styles.subHeading}>Our Mission</Text>
          <Text style={styles.paragraph}>
            SaveToServe is designed to help households and individuals reduce food waste efficiently. 
            We provide smart notifications for grocery expiry, suggest quick and delicious recipes, 
            and help you manage your kitchen like a pro. Save food, save money, and serve responsibly!
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeDo, transform: [{ translateY: fadeDo.interpolate({inputRange:[0,1],outputRange:[20,0]}) }] }}>
          <Text style={styles.subHeading}>What We Do</Text>
          <View style={styles.bulletItem}><Bullet /><Text style={styles.paragraph}>Track expiry dates of all grocery items so nothing goes bad.</Text></View>
          <View style={styles.bulletItem}><Bullet /><Text style={styles.paragraph}>Suggest simple, tasty recipes for items near expiry.</Text></View>
          <View style={styles.bulletItem}><Bullet /><Text style={styles.paragraph}>Give personalized alerts to help save money and plan meals better.</Text></View>
          <View style={styles.bulletItem}><Bullet /><Text style={styles.paragraph}>Promote sustainable practices for healthier lifestyle and environment.</Text></View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeWhy, transform: [{ translateY: fadeWhy.interpolate({inputRange:[0,1],outputRange:[20,0]}) }] }}>
          <Text style={styles.subHeading}>Why Choose SaveToServe?</Text>
          <View style={styles.bulletItem}><Bullet /><Text style={styles.paragraph}>User-friendly interface that anyone can use easily.</Text></View>
          <View style={styles.bulletItem}><Bullet /><Text style={styles.paragraph}>Smart notifications for expiry, recipes, and reminders.</Text></View>
          <View style={styles.bulletItem}><Bullet /><Text style={styles.paragraph}>Efficient kitchen management to minimize waste and save money.</Text></View>
          <View style={styles.bulletItem}><Bullet /><Text style={styles.paragraph}>Join a community of conscious users focused on reducing food waste.</Text></View>
        </Animated.View>

        <Animated.Text style={[styles.footerText, { opacity: fadeFooter }]}>
          Every meal matters. Every ingredient counts. SaveToServe helps you serve smarter.
        </Animated.Text>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home" size={26} color={currentRoute === "Home" ? "#f59e0b" : "#fff"} />
          <Text style={[styles.navText, { color: currentRoute === "Home" ? "#f59e0b" : "#fff" }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Recipe")}>
          <Ionicons name="book" size={26} color={currentRoute === "Recipe" ? "#f59e0b" : "#fff"} />
          <Text style={[styles.navText, { color: currentRoute === "Recipe" ? "#f59e0b" : "#fff" }]}>Recipe</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Grocery")}>
          <Ionicons name="cart" size={28} color={currentRoute === "Grocery" ? "#f59e0b" : "#fff"} />
          <Text style={[styles.navText, { color: currentRoute === "Grocery" ? "#f59e0b" : "#fff" }]}>Grocery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("About")}>
          <Ionicons name="information-circle" size={26} color={currentRoute === "About" ? "#f59e0b" : "#fff"} />
          <Text style={[styles.navText, { color: currentRoute === "About" ? "#f59e0b" : "#fff" }]}>About</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1f2937", paddingTop: Platform.OS === "ios" ? 50 : 40 },
  contentContainer: { paddingHorizontal: 25, paddingBottom: 70 },
  heading: { fontSize: 36, fontWeight: "900", color: "#f59e0b", textAlign: "center", marginBottom: 20, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  subHeading: { fontSize: 24, fontWeight: "700", color: "#fbbf24", marginTop: 18, marginBottom: 10 },
  paragraph: { fontSize: 17, color: "#e5e7eb", lineHeight: 26, marginBottom: 10 },
  footerText: { fontSize: 18, fontStyle: "italic", color: "#f59e0b", textAlign: "center", marginTop: 25 },
  bullet: { fontSize: 12, color: "#f59e0b", marginRight: 8 },
  bulletItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 10,
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 50,
    elevation: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
  },
  navItem: { flex: 1, alignItems: "center" },
  navText: { fontSize: 12, marginTop: 2, fontWeight: "600", color: "#fff" },
});
