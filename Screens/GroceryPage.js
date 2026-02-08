import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";


import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./supabase";
import { clearUser } from "./userStore";


export default function GroceryPage({ navigation, route }) {
  const navState = navigation.getState();
  const currentRoute =
    navState?.routes?.[navState.index]?.name || "Grocery";

  const initialFromRoute = route?.params?.itemName ?? "";

  const [itemName, setItemName] = useState(initialFromRoute);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [category, setCategory] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [sortBy, setSortBy] = useState("expiry");
  const [menuVisible, setMenuVisible] = useState(false);

  const categories = [
    "Dairy",
    "Vegetables",
    "Fruits",
    "Bakery",
    "Meat & Seafood",
    "Pantry",
    "Drinks",
    "Frozen",
    "Snacks",
    "Condiments & Sauces",
    "Other",
  ];

  // ---------------- USER ----------------
  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  };

  // ---------------- FETCH ITEMS ----------------
  const fetchItems = async () => {
    const userId = await getUserId();
    if (!userId) return;

    let query = supabase
      .from("grocery_items")
      .select("*")
      .eq("user_id", userId);

    if (sortBy === "expiry") {
      query = query.order("expiry_date", { ascending: true });
    } else {
      query = query.order("name", { ascending: true });
    }

    const { data, error } = await query;
    if (!error && data) {
      setItems(data);

      // ---------- CHECK EXPIRING ITEMS ----------
      const today = new Date();
      const expiringSoon = data.filter((item) => {
        const expiry = new Date(item.expiry_date);
        const diffDays = Math.ceil(
          (expiry - today) / (1000 * 60 * 60 * 24)
        );
        return diffDays <= 2 && diffDays >= 0; // 0-2 din me expire ho rahe
      });

      if (expiringSoon.length > 0) {
        Toast.show({
          type: "expiry", // custom toast
          text1: "⚠️ Expiry Alert!",
          text2: `These items are expiring soon: ${expiringSoon
            .map((i) => i.name)
            .join(", ")}`,
          position: "top",
          visibilityTime: 6000,
          autoHide: true,
        });
      }
    }
  };

  useEffect(() => {
    fetchItems();
  }, [sortBy]);

  useEffect(() => {
    if (initialFromRoute) setItemName(initialFromRoute);
  }, [initialFromRoute]);

  // ---------------- ADD ITEM ----------------
  const handleAddItem = async () => {
    if (!itemName || !category) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Item name & category required",
      });
      return;
    }

    const userId = await getUserId();
    if (!userId) return;

    const { error } = await supabase.from("grocery_items").insert([
      {
        user_id: userId,
        name: itemName.trim(),
        category,
        expiry_date: expiryDate.toISOString().split("T")[0],
      },
    ]);

    if (error) {
      Toast.show({ type: "error", text1: error.message });
    } else {
      Toast.show({ type: "success", text1: "Item added ✅" });
      setItemName("");
      setCategory("");
      fetchItems();
    }
  };

  // ---------------- DELETE ----------------
const confirmDelete = (id) => {
  Alert.alert(
    "Delete Item?",
    "Are you sure you want to delete this item?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteItem(id) },
    ]
  );
};
  const deleteItem = async (id) => {
    await supabase.from("grocery_items").delete().eq("id", id);
    Toast.show({ type: "success", text1: "Item deleted 🗑️" });
    fetchItems();
  };

  const isExpiringSoon = (date) => {
    const diff =
      (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  };

  // ---------------- MENU ACTIONS ----------------
  const handleProfile = () => {
    setMenuVisible(false);
    navigation.navigate("Profile");
  };

  const handleSettings = () => {
    setMenuVisible(false);
    navigation.navigate("Settings");
  };

  const handleLogout = () => {
    setMenuVisible(false);
    clearUser();
    navigation.reset({
      index: 0,
      routes: [{ name: "SignIn" }],
    });
  };

  // ---------------- UI ----------------
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Ionicons name="menu" size={32} color="#fff" />
            </TouchableOpacity>

            {menuVisible && (
              <View style={styles.menuDropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleProfile}
                >
                  <Ionicons name="person" size={18} />
                  <Text style={styles.menuText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleSettings}
                >
                  <Ionicons name="settings" size={18} />
                  <Text style={styles.menuText}>Settings</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out" size={18} color="#b91c1c" />
                  <Text style={[styles.menuText, { color: "#b91c1c" }]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person-circle" size={44} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* FORM */}
        <Text style={styles.heading}>Add Grocery Item</Text>

        <Text style={styles.label}>Item Name</Text>
        <TextInput
          value={itemName}
          onChangeText={setItemName}
          style={styles.input}
          placeholder="Milk, Bread..."
        />

        <Text style={styles.label}>Expiry Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDate(true)}
        >
          <Text>{expiryDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDate && (
          <DateTimePicker
            value={expiryDate}
            mode="date"
            onChange={(e, d) => {
              setShowDate(false);
              if (d) setExpiryDate(d);
            }}
          />
        )}

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text>{category || "Select category"}</Text>
        </TouchableOpacity>

        {dropdownOpen &&
          categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={styles.dropdownItem}
              onPress={() => {
                setCategory(c);
                setDropdownOpen(false);
              }}
            >
              <Text>{c}</Text>
            </TouchableOpacity>
          ))}

        <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>

        {/* SORT */}
        <View style={styles.sortRow}>
          <Text style={styles.sectionTitle}>Your Items</Text>
          <TouchableOpacity
            onPress={() =>
              setSortBy(sortBy === "expiry" ? "name" : "expiry")
            }
          >
            <Text style={styles.sortText}>
              Sort: {sortBy === "expiry" ? "Expiry" : "A–Z"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ITEMS */}
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              isExpiringSoon(item.expiry_date) && styles.expiring,
            ]}
            onPress={() =>
              navigation.navigate("Recipe", { itemName: item.name.toLowerCase() })
            }
          >
            <View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text>{item.category}</Text>
              <Text>Expiry: {new Date(item.expiry_date).toDateString()}</Text>
            </View>

            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Ionicons name="trash" size={22} color="#b91c1c" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {menuVisible && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}
          />
        )}
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomBar}>
        {[
          { name: "Home", icon: "home" },
          { name: "Recipe", icon: "book" },
          { name: "Grocery", icon: "cart" },
          { name: "About", icon: "information-circle" },
        ].map((tab) => (
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
              style={[
                styles.navText,
                { color: currentRoute === tab.name ? "#f59e0b" : "#fff" },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

     
       
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { backgroundColor: "#4e4376", padding: 20 },
  topBar: {
    marginTop: 25,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: { fontSize: 26, fontWeight: "900", color: "#fff" },
  label: { color: "#ffd369", marginTop: 12, fontWeight: "700" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  dropdownItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  addBtn: {
    backgroundColor: "#ff9f1c",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  addBtnText: {
    textAlign: "center",
    fontWeight: "800",
    color: "#fff",
  },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
  },
  sortText: { color: "#ffd369", fontWeight: "700" },
  card: {
    backgroundColor: "#eef9ff",
    padding: 15,
    borderRadius: 12,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expiring: {
    backgroundColor: "#ffe5e5",
    borderLeftWidth: 6,
    borderLeftColor: "#dc2626",
  },
  cardTitle: { fontWeight: "900", fontSize: 16 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 12,
    justifyContent: "space-around",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  menuDropdown: {
    position: "absolute",
    top: 40,
    left: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: 160,
    elevation: 6,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  menuText: { fontSize: 15, fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 6,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 1000,
  },
});
