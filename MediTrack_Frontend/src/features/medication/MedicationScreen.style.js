import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 1000,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0f0",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "red",
    alignSelf: "center",
  },
    actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    margin: "10px",
  },
  favoriteButtonText: {
    marginLeft: 8,
    color: "black",
    fontSize: 14,
  },
  profileSelectContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileLabel: {
    fontWeight: "600",
    marginRight: 6,
    fontSize: 14,
  },
  profileSelect: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: 180,
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f7e9",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "green",
    marginLeft: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    padding: "10px",
  },
  topSection: {
    marginBottom: 32,
  },
  headerSection: {
    alignItems: "center",
  },
  mainImage: {
    width: 260,
    height: 260,
    marginBottom: 16,
    borderRadius: 10,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
  },
  iconButton: {
    alignItems: "center",
    marginHorizontal: 6,
    maxWidth: 80,
  },
  iconLabel: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  quickInfoSection: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 24,
  },
  gridSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 32,
  },
  gridColumn: {
    flex: 1,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  accordionTitle: {
    fontWeight: "700",
    fontSize: 18,
  },
  accordionBody: {
    paddingTop: 12,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 24,
  },
});