import React from "react";
import { Alert } from "react-native";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsTab from "../SettingsTab";
import { AuthContext } from "contexts/AuthContext";
import { ThemeContext } from "contexts/ThemeContext";
import { lightTheme } from "styles/theme";
import { deleteAccount } from "features/profile/profile.api";

// Issue #84: the profile tab's "Fiókműveletek → Fiók törlése" control used to call
// requestAccountDeletion(), a function that was removed from profile.api.js. That made
// every deletion attempt throw and get swallowed into a generic error message.
// These tests pin the required fix: the flow must require password re-entry and call
// the real, already-wired deleteAccount(password) endpoint (mirroring AccountSection.js /
// SettingsScreen.js), and any failure must surface a specific message instead of being
// silently swallowed.
jest.mock("features/profile/profile.api", () => ({
  fetchUserPreferences: jest.fn(() => Promise.resolve({})),
  updateUserPreferences: jest.fn(() => Promise.resolve({})),
  exportDataDirect: jest.fn(() => Promise.resolve({})),
  generate2FA: jest.fn(() => Promise.resolve({})),
  enable2FA: jest.fn(() => Promise.resolve({})),
  disable2FA: jest.fn(() => Promise.resolve({})),
  deleteAccount: jest.fn(),
}));

function renderSettingsTab() {
  return render(
    <AuthContext.Provider value={{ user: { id: 1, is2faEnabled: false }, logout: jest.fn() }}>
      <ThemeContext.Provider value={{ theme: lightTheme, isDark: false }}>
        <SettingsTab />
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

/** Finds the confirm/destructive button passed to the most recent Alert.alert call. */
function pressLatestAlertButton(matchText) {
  const lastCall = Alert.alert.mock.calls[Alert.alert.mock.calls.length - 1];
  const buttons = lastCall[2] || [];
  const button = buttons.find((b) => b.text === matchText) || buttons[buttons.length - 1];
  button.onPress && button.onPress();
}

describe("SettingsTab – Fiókműveletek → Fiók törlése (issue #84)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("jelszó megadását kéri, mielőtt a valós deleteAccount végpontot meghívná", async () => {
    await renderSettingsTab();
    await waitFor(() => screen.getByText("Fiók törlése"));

    fireEvent.press(screen.getByText("Fiók törlése"));
    expect(Alert.alert).toHaveBeenCalled();
    pressLatestAlertButton("Törlés");

    // The confirm dialog must ask for the account password before deleting, exactly like
    // AccountSection.js / SettingsScreen.js does. This input does not exist yet.
    await waitFor(() =>
      expect(screen.getByTestId("account-deletion-password-input")).toBeTruthy()
    );

    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("helyes jelszóval a valós deleteAccount(password) végpontot hívja meg", async () => {
    deleteAccount.mockResolvedValue({});
    await renderSettingsTab();
    await waitFor(() => screen.getByText("Fiók törlése"));

    fireEvent.press(screen.getByText("Fiók törlése"));
    pressLatestAlertButton("Törlés");

    const passwordInput = await screen.findByTestId("account-deletion-password-input");
    fireEvent.changeText(passwordInput, "correct-horse-battery-staple");
    fireEvent.press(await screen.findByTestId("account-deletion-confirm-button"));

    await waitFor(() =>
      expect(deleteAccount).toHaveBeenCalledWith("correct-horse-battery-staple")
    );
  });

  it("sikertelen törlési kérés esetén konkrét hibaüzenetet jelenít meg, nem nyeli el a hibát", async () => {
    deleteAccount.mockRejectedValue({
      response: { data: { message: "Helytelen jelszó." } },
    });
    await renderSettingsTab();
    await waitFor(() => screen.getByText("Fiók törlése"));

    fireEvent.press(screen.getByText("Fiók törlése"));
    pressLatestAlertButton("Törlés");

    const passwordInput = await screen.findByTestId("account-deletion-password-input");
    fireEvent.changeText(passwordInput, "wrong-password");
    fireEvent.press(await screen.findByTestId("account-deletion-confirm-button"));

    await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith("wrong-password"));

    // The surfaced message must be the specific backend error, not the old generic
    // "Nem sikerült rögzíteni a törlési kérelmet." that swallowed every failure.
    await waitFor(() => {
      const alertMessages = Alert.alert.mock.calls.map((call) => call[1]);
      expect(alertMessages).toContain("Helytelen jelszó.");
      expect(alertMessages).not.toContain(
        "Nem sikerült rögzíteni a törlési kérelmet. Próbáld újra később."
      );
    });
  });
});
