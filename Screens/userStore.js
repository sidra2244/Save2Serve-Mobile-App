import { supabase } from "./supabase";

let user = null; // in-memory cache

// Default settings
let settings = {
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  preferences: {
    darkMode: false,
  },
};

// ------------------------
// User cache
// ------------------------
export const setUser = (u) => { user = u; };
export const getUser = () => user;
export const clearUser = () => { user = null; };

// ------------------------
// Supabase operations
// ------------------------
export const updateEmail = async (newEmail) => {
  try {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    user.email = data.user.email;
    return data.user;
  } catch (err) {
    console.log("updateEmail error:", err.message);
    throw err;
  }
};

export const updatePassword = async (newPass) => {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
    return data.user;
  } catch (err) {
    console.log("updatePassword error:", err.message);
    throw err;
  }
};

// ------------------------
// Settings functions
// ------------------------
export const getSettings = () => settings;

export const saveNotificationSettings = (notif) => {
  settings.notifications = { ...notif };
};

export const savePreferenceSettings = (prefs) => {
  settings.preferences = { ...prefs };
};
