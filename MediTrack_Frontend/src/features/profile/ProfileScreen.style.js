import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    position: "relative",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    backgroundColor: "#A5D6A7",
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
    marginRight: 24,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
  value: {
    color: "#fff",
  },
  editIcon: {
    marginLeft: 8,
    color: "#fff",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#f1f1f1",
  },
  tabButton: {
    marginHorizontal: 16,
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#66BB6A",
  },
});