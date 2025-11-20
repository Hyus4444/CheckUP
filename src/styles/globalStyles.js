import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  /* Styles Globales */
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
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
  emojiCircle: {
    width: 150,
    height: 150,
    borderRadius: 250,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    alignSelf: "center",
  },
  emojiOption: {
    width: "20%",
    padding: 10,
    alignItems: "center",
  },

  /* Styles de texto*/
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#542AB4",
  },
  titleWhite: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 2,
  },
  dayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 20,
  },
  percentText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
  linkText: {
    color: "#542AB4",
    marginTop: 15,
  },
  checkText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  habitText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtext: {
    fontSize: 16,
    opacity: 0.5,
  },
  valueContador: {
    fontSize: 22,
    fontWeight: "bold",
  },

  /* Styles botones generales*/
  button: {
    width: "100%",
    backgroundColor: "#02A394",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  buttonSecondary: {
    width: "100%",
    backgroundColor: "#542AB4",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  buttonRed: {
    width: "100%",
    backgroundColor: "#E74C3C",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 8,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  /* Styles crear - editar habito */
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
  emojiDetails: {
    fontSize: 80,
    marginRight: 15,
  },
  sectionDetails: {
    marginBottom: 20,
    alignContent: "center",
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCircle: {
    flex: 1,
    width: 44,
    height: 44,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    paddingVertical: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* Styles selector de colores */
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

  /* Styles de Input contador*/
  containerCounterInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  symbol: {
    fontSize: 36,
    fontWeight: "bold",
    marginHorizontal: 20,
  },

  /* Styles Boton flotante*/
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
    backgroundColor: "#02A394",
  },

  /* Styles Habit Card*/
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  emojiHabitCard: {
    fontSize: 35,
  },

  /* Styles contenedor del Form*/
  containerFormHabit: {
    marginVertical: 10,
    marginHorizontal: 10,
  },

  /* Conteneder de botones inferior styles */
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

  /* Styles Time Selector */
  timeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 30,
    flex: 1,
    marginHorizontal: 60,
  },

  /* Calendar styles */
  calendar: {
    marginTop: 10,
    borderRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },

  /* Styles  Habit Item */
  card: {
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  emojiCircleCard: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBarCard: {
    height: "100%",
    borderRadius: 3,
  },

  /* Styles Opciones*/
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
    paddingHorizontal: 5,
  },

  // --- Estilos para el gráfico semanal de barras ---
  chartContainer: {
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 10,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  chart: {
    marginTop: 10,
    padding: 25,
    borderRadius: 12,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  chartWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },

  chartInner: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  barChart: {
    alignSelf: "center",
    borderRadius: 12,
    marginTop: 12,
    paddingRight: 0,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
  },
});
