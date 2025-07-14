import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';


export const authService = {
  signup: async ({ fullName, email, password }) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fullName, // ensure 'name' is sent, not 'fullName'
        email,
        password,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Signup failed");
    }

    const data = await res.json();
    // Optional: save token to localStorage or cookie
    return data;
  },
  login: async (email: string, password: string) => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    if (!res.ok) {
      const err = await res.json();
      console.log("🔴 authService → login() error:", err);
      throw new Error(err.error || "Login failed");
    }
  
    const data = await res.json();
  
    const normalizedUser = {
      ...data.user,
      fullName: data.user.name, // ✅ ensure 'fullName' exists
    };
  
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  
    return { token: data.token, user: normalizedUser };
  },
  
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    console.log("🧠 authService → getCurrentUser():", userStr);

    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  logout: () => {
    localStorage.clear();
  }
  
};
