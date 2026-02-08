import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const welcomeText = "WELCOME";

  // entrance animation values
  const overlayAnim = useRef(new Animated.Value(0)).current; // 0..1
  const logoY = useRef(new Animated.Value(-24)).current;
  const titleScale = useRef(new Animated.Value(0.9)).current;
  const subTextY = useRef(new Animated.Value(10)).current;
  const cardY = useRef(new Animated.Value(20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // per-letter animation
  const letterAnimations = welcomeText.split("").map(() => useRef(new Animated.Value(0)).current);

  // floating blobs
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;

  // arrow pulse
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(titleScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(subTextY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // After main entrance, animate letters
      Animated.stagger(
        100,
        letterAnimations.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          })
        )
      ).start();
    });

    // Floating blobs loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1, {
          toValue: 1,
          duration: 6500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blob1, {
          toValue: 0,
          duration: 6500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2, {
          toValue: 1,
          duration: 8200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blob2, {
          toValue: 0,
          duration: 8200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // arrow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // interpolations
  const overlayOpacity = overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.48] });

  const blob1TranslateY = blob1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const blob1TranslateX = blob1.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const blob1Opacity = blob1.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.12] });

  const blob2TranslateY = blob2.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });
  const blob2TranslateX = blob2.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const blob2Opacity = blob2.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.06] });

  const arrowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const arrowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.75] });

  return (
    <ImageBackground
      source={require("../assets/welcome.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* animated overlay */}
      <Animated.View style={[styles.darkOverlay, { opacity: overlayOpacity }]} />

      {/* animated floating blobs */}
      <Animated.View
        style={[
          styles.floatingBlob,
          styles.blob1,
          {
            transform: [{ translateY: blob1TranslateY }, { translateX: blob1TranslateX }],
            opacity: blob1Opacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.floatingBlob,
          styles.blob2,
          {
            transform: [{ translateY: blob2TranslateY }, { translateX: blob2TranslateX }],
            opacity: blob2Opacity,
          },
        ]}
      />

      {/* Top-left logo badge with gradient */}
      <Animated.View style={[styles.topBar, { transform: [{ translateY: logoY }] }]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.03)"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.logoBadge}
        >
          <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.appName}>Save2Serve</Text>
            <Text style={styles.tagline}>because freshness deserve care</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* center block */}
      <View style={styles.center}>
        <View style={{ flexDirection: "row" }}>
          {welcomeText.split("").map((letter, index) => (
            <Animated.Text
              key={index}
              style={{
                color: "#fff",
                fontSize: 54,
                fontWeight: "900",
                letterSpacing: 6,
                textShadowColor: "rgba(0,0,0,0.6)",
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 5,
                opacity: letterAnimations[index],
                transform: [
                  {
                    scale: letterAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              }}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        <Animated.Text
          style={[
            styles.subText,
            {
              transform: [{ translateY: subTextY }],
            },
          ]}
        >
          never waste food again
        </Animated.Text>

        <Animated.View
          style={[
            styles.infoCard,
            {
              transform: [{ translateY: cardY }],
              opacity: cardOpacity,
            },
          ]}
        >
          <Text style={styles.cardText}>
            Track groceries • Save food • Get smart recipe suggestions
          </Text>
        </Animated.View>
      </View>

      {/* arrow */}
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => navigation.navigate("SignIn")}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[styles.arrowCircle, { transform: [{ scale: arrowScale }], opacity: arrowOpacity }]}
        >
          <Ionicons name="arrow-forward" size={34} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width, height },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  floatingBlob: { position: "absolute", backgroundColor: "#fff", borderRadius: 200, width: 160, height: 160, opacity: 0.12, zIndex: 5 },
  blob1: { top: 90, right: -40, backgroundColor: "#fff" },
  blob2: { bottom: 140, left: -40, width: 120, height: 120, backgroundColor: "#fff" },
  topBar: { position: "absolute", top: 48, left: 20, zIndex: 20 },
  logoBadge: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  logo: { width: 48, height: 48 },
  appName: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 0.6, textShadowColor: "rgba(0,0,0,0.45)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  tagline: { color: "#fff", fontSize: 11, marginTop: 2, opacity: 0.95 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  subText: { color: "#fff", fontSize: 18, marginTop: 8, textTransform: "lowercase", opacity: 0.95, textShadowColor: "rgba(0,0,0,0.35)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  infoCard: { marginTop: 22, backgroundColor: "rgba(255,255,255,0.04)", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6 },
  cardText: { color: "#fff", fontSize: 14, textAlign: "center", opacity: 0.95 },
  arrowButton: { position: "absolute", bottom: 36, right: 20, zIndex: 30 },
  arrowCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#f59e0b", alignItems: "center", justifyContent: "center", shadowColor: "#ffb36b", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 12 },
});
