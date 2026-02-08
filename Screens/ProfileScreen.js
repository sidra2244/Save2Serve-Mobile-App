// ProfileScreen.js
import React, { useEffect, useRef, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform, Animated, Easing 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "./supabase"; // <-- Supabase client
import { getUser, setUser } from "./userStore";

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "Your Name",
    email: "email@example.com",
    memberSince: "Not available",
  });

  const avatarAnim = useRef(new Animated.Value(1)).current;
  const fadeAnims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current]; 
  const slideAnims = [useRef(new Animated.Value(20)).current, useRef(new Animated.Value(20)).current, useRef(new Animated.Value(20)).current];
  const gradientAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // fetch current user from Supabase
    const fetchUser = async () => {
      try {
        const currentUser = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : getUser();
        if (!currentUser) return;

        const name = currentUser.user_metadata?.full_name || currentUser.email.split("@")[0];
        const email = currentUser.email;
        const memberSince = currentUser.created_at ? new Date(currentUser.created_at).toDateString() : "Not available";

        const userObj = { name, email, memberSince };
        setUserData(userObj);
        setUser(userObj); // update in-memory store
      } catch (err) {
        console.warn("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Avatar bounce
    Animated.sequence([
      Animated.spring(avatarAnim, { toValue: 1.1, friction: 4, tension: 120, useNativeDriver: true }),
      Animated.spring(avatarAnim, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();

    // Staggered info fade + slide
    const animations = fadeAnims.map((fade, index) =>
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 600, delay: index * 150, useNativeDriver: true }),
        Animated.timing(slideAnims[index], { toValue: 0, duration: 600, delay: index * 150, useNativeDriver: true }),
      ])
    );
    Animated.stagger(150, animations).start();

    // Animated gradient
    Animated.loop(
      Animated.timing(gradientAnim, { toValue: 1, duration: 10000, easing: Easing.linear, useNativeDriver: false })
    ).start();
  }, []);

  const bgColor1 = gradientAnim.interpolate({ inputRange: [0,1], outputRange: ["#3a6073","#16222A"] });
  const bgColor2 = gradientAnim.interpolate({ inputRange: [0,1], outputRange: ["#16222A","#3a6073"] });

  if (loading) return <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}><Text style={{color:'#fff'}}>Loading...</Text></View>;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor1 }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.topBar}>
        <Text style={styles.appName}>SaveToServe</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.profileTitle}>Profile</Text>

        <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarAnim }] }]}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={64} color="#fff" />
          </View>
        </Animated.View>

        <AnimatedLinearGradient colors={[bgColor1, bgColor2]} style={styles.infoCard}>
          <Animated.View style={{ opacity: fadeAnims[0], transform: [{ translateY: slideAnims[0] }] }}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{userData.name}</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnims[1], transform: [{ translateY: slideAnims[1] }], marginTop: 12 }}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnims[2], transform: [{ translateY: slideAnims[2] }], marginTop: 12 }}>
            <Text style={styles.label}>Member since</Text>
            <Text style={styles.value}>{userData.memberSince}</Text>
          </Animated.View>
        </AnimatedLinearGradient>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.9}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === "android"?24:44 },
  topBar: { flexDirection:'row', alignItems:'center', paddingHorizontal:20, marginBottom:18 },
  appName: { color:"#ffd369", fontSize:28, fontWeight:"900", textShadowColor:"rgba(0,0,0,0.5)", textShadowOffset:{width:1,height:1}, textShadowRadius:3 },
  content: { alignItems:'center', paddingHorizontal:24 },
  profileTitle: { color:"#fbbf24", fontSize:36, fontWeight:"900", marginTop:6, marginBottom:18, textAlign:'center', textShadowColor:'rgba(0,0,0,0.45)', textShadowOffset:{width:2,height:2}, textShadowRadius:4 },
  avatarWrap: { marginBottom:18, shadowColor:"#000", shadowOffset:{width:0,height:6}, shadowOpacity:0.25, shadowRadius:8, elevation:10 },
  avatar: { width:130, height:130, borderRadius:65, backgroundColor:"rgba(255,255,255,0.12)", alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:"rgba(255,255,255,0.15)" },
  infoCard: { width:"100%", marginTop:8, paddingVertical:22, paddingHorizontal:20, borderRadius:16, borderWidth:1, borderColor:"rgba(255,255,255,0.08)", shadowColor:"#000", shadowOffset:{width:0,height:4}, shadowOpacity:0.12, shadowRadius:6, elevation:6 },
  label: { color:"#fbbf24", fontWeight:"700", marginBottom:6, fontSize:15 },
  value: { color:"#fff", fontSize:19, fontWeight:"800" },
  backBtn: { position:'absolute', bottom:22, left:16, flexDirection:'row', alignItems:'center', backgroundColor:'rgba(0,0,0,0.4)', paddingHorizontal:14, paddingVertical:10, borderRadius:12, shadowColor:"#000", shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:5, elevation:8 },
  backText: { color:"#fff", marginLeft:8, fontWeight:"700", fontSize:16 }
});
