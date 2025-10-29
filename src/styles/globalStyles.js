// src/styles/globalStyles.js
import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#542AB4", // purple titles
  },
  titleWhite: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
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
    backgroundColor: "#02A394", 
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonSecondary: {
    width: "100%",
    backgroundColor: "#542AB4",
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
  label: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 5,
    marginBottom: 2,
  },
  emojiCircle: {
    width: 200,
    height: 200,
    borderRadius: 250,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  emojiOption: {
    width: "20%",
    padding: 10,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  rowhabit: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    gap: 15,
  },
  adjustBtn: {
    padding: 10,
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  emoji: {
    fontSize: 28,
    marginRight: 10,
  },
  emojiDetails: {
    fontSize: 80,
    marginRight: 15,
  },
  habitText: {
    fontSize: 20,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    backgroundColor: "#02A394"
  },
  containerColor: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  circleColor: {
    width: 44,
    height: 44,
    borderRadius: 30,
    margin: 4,
  },
  containerFormHabit: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  sectionDetails: {
    marginBottom: 20,
  },
  percent: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  },
  dayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  bottomButtonsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#00000010",
  },
  calendar: {
    marginTop: 10,
    borderRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
});
