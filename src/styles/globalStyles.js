// src/styles/globalStyles.js
import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#542AB4", // purple titles
  },
  subtitle: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#333333",
  },
  button: {
    width: "100%",
    backgroundColor: "#02A394", // green buttons
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonSecondary: {
    width: "100%",
    backgroundColor: "#542AB4", // secondary variant (purple) if needed
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    color: "#542AB4",
    marginTop: 15,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
