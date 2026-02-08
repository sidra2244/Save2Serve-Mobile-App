// RecipePage.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { supabase } from "./supabase";
import { clearUser } from "./userStore";
const fetchYouTubeLink = async (recipeName) => {
  try {
    const apiKey = "AIzaSyAt2kc_ksrDUcQAiObAWFp7HzpOB9P78UU"; 
    const query = encodeURIComponent(recipeName + " food fusion recipe tutorial");

    // 👇 Add your trusted food fusion channel ID here
    const channelId = "UCuqBZWK9Wrol_4Y22DzisFQ"; // <-- Replace with actual channel ID

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&channelId=${channelId}&key=${apiKey}&type=video&videoDuration=medium&maxResults=1`;


    const response = await fetch(url);
    const data = await response.json();
    const videoId = data.items[0]?.id?.videoId;
    if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    return null;
  } catch (err) {
    console.error("YouTube fetch error:", err);
    return null;
  }
};


export default function RecipePage({ navigation }) {
  const currentRoute =
    navigation.getState().routes[navigation.getState().index].name;

  const [groceryItems, setGroceryItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [sortBy, setSortBy] = useState("match");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterAnim = useRef(new Animated.Value(0)).current;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ---------------- FETCH DATA ----------------
  const fetchGroceries = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from("grocery_items")
      .select("name, expiry_date")
      .eq("user_id", userId);

    setGroceryItems(data || []);
  };
// If navigated from GroceryPage, auto-select the ingredient
useEffect(() => {
  const itemFromGrocery = navigation.getState()?.routes[navigation.getState().index]?.params?.itemName;
  if (itemFromGrocery) {
    setSelectedIngredients([itemFromGrocery]); // auto-select
    setFilterOpen(true); // open the filter dropdown
  }
}, [navigation]);

  const sampleRecipes = [
    { id: 1, name: "Spaghetti Bolognese", ingredients: ["pasta", "tomato", "beef"] },
    { id: 2, name: "Omelette", ingredients: ["egg", "cheese", "milk"] },
    { id: 3, name: "Chicken Curry", ingredients: ["chicken", "onion", "spices"] },
  ];

useEffect(() => {
  fetchGroceries();
  fetchRecipes(); // ✅ REAL DATA
}, []);
useEffect(() => {
  Animated.timing(filterAnim, {
    toValue: 1,
    duration: 400,
    useNativeDriver: true,
  }).start();
}, [filterOpen]);



  const groceryNames = groceryItems.map(g => g.name.toLowerCase());
const getMatchCount = (recipe) => {
  if (!recipe.ingredients) return 0;
  return recipe.ingredients.filter(i =>
    groceryNames.includes(i.toLowerCase())
  ).length;
};

const getExpiryInfo = (ingredient) => {
  if (!ingredient) return null; // 🔹 ingredient undefined hai toh null return
  const item = groceryItems.find(
    g => g.name && g.name.toLowerCase() === ingredient.toLowerCase()
  );
  if (!item?.expiry_date) return null;
  
  const diffDays = Math.ceil(
    (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  let color = "#16a34a";
  if (diffDays <= 2) color = "#dc2626";
  else if (diffDays <= 5) color = "#f59e0b";

  return { diffDays, color };
};


  const getUrgencyPercent = (diffDays) => {
    if (diffDays <= 0) return 100;
    if (diffDays >= 7) return 0;
    return ((7 - diffDays) / 7) * 100;
  };

  const processedRecipes = useMemo(() => {
  let list = recipes.map(r => {
    const matchCount = getMatchCount(r);
    return {
      ...r,
      matchCount,
      isMatched: matchCount > 0,
    };
  });

  // filter button lagne par
  if (selectedIngredients.length > 0) {
    list = list.filter(r =>
      selectedIngredients.every(sel =>
        r.ingredients?.some(i => i.toLowerCase() === sel)
      )
    );
  }

  // sorting
  if (sortBy === "match") {
    list.sort((a, b) => b.matchCount - a.matchCount);
  }

  if (sortBy === "expiry") {
    list.sort((a, b) => {
      const aD = getExpiryInfo(a.ingredients[0])?.diffDays || 999;
      const bD = getExpiryInfo(b.ingredients[0])?.diffDays || 999;
      return aD - bD;
    });
  }

  if (sortBy === "az") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}, [recipes, groceryItems, sortBy, selectedIngredients]);

const addGroceryItem = async (newItem) => {
  const { data, error } = await supabase
    .from("grocery_items")
    .insert([{ name: newItem, user_id: userId }]);

  if (!error) {
    fetchGroceries(); // <-- refresh groceryItems state
  }
};
const fetchRecipes = async () => {
  const { data, error } = await supabase
    .from("recipes")
    .select("id, name, recipe_ingredients (ingredient)");

  if (error) {
    console.log("Recipe fetch error:", error);
    return;
  }

  // 🔑 normalize data for UI
  const formatted = (data || []).map(r => ({
    id: r.id,
    name: r.name,
    ingredients: r.recipe_ingredients.map(i => i.ingredient),
  }));

  setRecipes(formatted);
};


  const handleLogout = () => {
    setMenuVisible(false);
    clearUser();
    navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
  };

  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Ionicons name="menu" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle" size={45} color="#fff" />
        </TouchableOpacity>

        {menuVisible && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="person" size={18} />
              <Text>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons name="settings" size={18} />
              <Text>Settings</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={18} color="#b91c1c" />
              <Text style={{ color: "#b91c1c" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.heading}>Recipe Suggestions</Text>
{/* FILTER HEADER */}
<View>
  <TouchableOpacity
    style={styles.filterHeader}
    onPress={() => setFilterOpen(!filterOpen)}
  >
    <Text style={styles.filterText}>
      Filter Ingredients ({selectedIngredients.length})
    </Text>
    <Ionicons
      name={filterOpen ? "chevron-up" : "chevron-down"}
      color="#fff"
      size={20}
    />
  </TouchableOpacity>

  {/* CLEAR FILTER BUTTON */}
  {selectedIngredients.length > 0 && (
    <TouchableOpacity
      onPress={() => setSelectedIngredients([])}
      style={{
        alignSelf: "flex-end",
        marginTop: 6,
        marginRight: 10,
      }}
    >
      <Text style={{ color: "#f59e0b", fontWeight: "600" }}>
        Clear filter ✕
      </Text>
    </TouchableOpacity>
  )}
</View>

{/* FILTER BODY */}
{filterOpen && (
  <View
    style={{
      maxHeight: 250,
      backgroundColor: "#fff",
      borderRadius: 12,
      marginTop: 10,
      paddingHorizontal: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      overflow: "hidden",
    }}
  >
    {groceryItems.length === 0 ? (
      <Animated.View
        style={{
          opacity: filterAnim,
          padding: 25,
          alignItems: "center",
        }}
      >
        <Ionicons name="cart-outline" size={42} color="#9ca3af" />
        <Text
          style={{
            marginTop: 10,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          No grocery items added yet
        </Text>
      </Animated.View>
    ) : (
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingVertical: 5 }}
        nestedScrollEnabled={true}
      >
        {groceryItems.map((item, idx) => {
          const selected = selectedIngredients.includes(
            item.name.toLowerCase()
          );

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.filterItem,
                selected && {
                  backgroundColor: "#2563eb",
                  borderRadius: 8,
                },
              ]}
              onPress={() =>
                setSelectedIngredients(prev =>
                  prev.includes(item.name.toLowerCase())
                    ? prev.filter(i => i !== item.name.toLowerCase())
                    : [...prev, item.name.toLowerCase()]
                )
              }
            >
              <Text
                style={{
                  color: selected ? "#fff" : "#000",
                  fontWeight: "500",
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    )}
  </View>
)}

        {/* SORT */}
        <View style={styles.sortRow}>
          {[
            { key: "match", label: "Best Match" },
            { key: "expiry", label: "Expiring Soon" },
            { key: "az", label: "A–Z" },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.sortBtn,
                sortBy === opt.key && styles.sortActive,
              ]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text style={styles.sortText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {processedRecipes.length === 0 ? (
  <View
    style={{
      marginTop: 40,
      alignItems: "center",
      opacity: 0.7,
    }}
  >
    <Ionicons
      name="restaurant-outline"
      size={60}
      color="#fff"
      style={{ marginBottom: 10 }}
    />
    <Text
      style={{
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
      }}
    >
      No recipes found
    </Text>
    <Text
      style={{
        color: "#e5e7eb",
        marginTop: 6,
        textAlign: "center",
      }}
    >
      Try selecting different ingredients
    </Text>
  </View>
) : (
  processedRecipes.map(recipe => {
    const expiry = getExpiryInfo(recipe.ingredients[0]);

    return (
      <TouchableOpacity
        key={recipe.id}
        style={[
          styles.card,
          !recipe.isMatched && { opacity: 0.45 },
        ]}
        onPress={async () => {
          const link = await fetchYouTubeLink(recipe.name);
          if (link) Linking.openURL(link);
          else
            Toast.show({
              type: "error",
              text1: "Video not found",
            });
        }}
      >
        <Text style={styles.cardTitle}>{recipe.name}</Text>

        {recipe.isMatched && (
          <View
            style={{
              backgroundColor: "#16a34a",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              alignSelf: "flex-start",
              marginBottom: 6,
            }}
          >
            
          </View>
        )}

        {expiry && (
          <>
            <View
              style={[styles.badge, { backgroundColor: expiry.color }]}
            >
              <Text style={styles.badgeText}>
                Expires in {expiry.diffDays} days
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${getUrgencyPercent(expiry.diffDays)}%`,
                    backgroundColor: expiry.color,
                  },
                ]}
              />
            </View>
          </>
        )}

        <Text style={styles.linkText}>Watch on YouTube</Text>
      </TouchableOpacity>
    );
  })
)}

      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        {[
          { name: "Home", icon: "home" },
          { name: "Recipe", icon: "book" },
          { name: "Grocery", icon: "cart" },
          { name: "About", icon: "information-circle" },
        ].map(tab => (
          <TouchableOpacity
            key={tab.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Ionicons
              name={tab.icon}
              size={26}
              color={currentRoute === tab.name ? "#f59e0b" : "#fff"}
            />
            <Text
              style={{
                color: currentRoute === tab.name ? "#f59e0b" : "#fff",
                fontSize: 12,
              }}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Toast position="bottom" />
    </View>
  );
}


// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3a6073" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginTop: 50,
  },
  contentContainer: { padding: 20, paddingBottom: 120 },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },

  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  filterText: { color: "#fff", fontWeight: "700" },
  filterDropdown: {
    overflow: "hidden",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 6,
  },
  filterItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  filterSelected: {
    backgroundColor: "#2563eb",
  },

  sortRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  sortBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#6b7280",
  },
  sortActive: { backgroundColor: "#f59e0b" },
  sortText: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#eef9ff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "900" },

  badge: {
    marginTop: 6,
    padding: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: { color: "#fff", fontWeight: "700" },

  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },

  linkText: { color: "#2563eb", marginTop: 8 },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 12,
  },
  navItem: { alignItems: "center" },

  menuDropdown: {
    position: "absolute",
    top: 60,
    left: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: 160,
    zIndex: 1000,
  },
  menuItem: { flexDirection: "row", gap: 10, paddingVertical: 6 },
  divider: { height: 1, backgroundColor: "#ccc", marginVertical: 6 },
});
