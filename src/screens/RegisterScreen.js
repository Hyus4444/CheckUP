// src/screens/RegisterScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { globalStyles } from "../styles/globalStyles";

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    try {
      await register(email, password);
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[globalStyles.container, { backgroundColor: "#fff", justifyContent: "flex-start" }]}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 60,
          paddingBottom: 30,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../assets/logo.png")}
          style={{ width: 300, height: 300, marginBottom: 5 }}
          resizeMode="contain"
        />

        <Text style={[globalStyles.title, { color: "#542AB4", marginBottom: 15 }]}>
          Create Account
        </Text>

        <TextInput
          style={globalStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity style={globalStyles.button} onPress={handleRegister}>
          <Text style={globalStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: "#542AB4", marginTop: 20 }}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
