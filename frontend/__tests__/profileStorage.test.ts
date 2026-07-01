import { isValidTzPhone, normalizeTzPhone } from "../utils/phoneValidation";
import { isProfileComplete, loadProfile, saveProfile } from "../utils/profileStorage";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("profileStorage", () => {
  it("returns default profile when empty", async () => {
    const profile = await loadProfile();
    expect(profile.phone).toBe("");
    expect(profile.preferredLanguage).toBe("en");
  });

  it("persists profile fields", async () => {
    await saveProfile({
      phone: "+255712345678",
      fullName: "Jane",
      preferredLanguage: "sw",
    });
    const loaded = await loadProfile();
    expect(loaded.fullName).toBe("Jane");
    expect(loaded.phone).toBe("+255712345678");
    expect(isProfileComplete(loaded)).toBe(true);
  });

  it("requires full name and phone for a complete profile", async () => {
    await saveProfile({
      phone: "+255712345678",
      preferredLanguage: "en",
    });
    const phoneOnly = await loadProfile();
    expect(isProfileComplete(phoneOnly)).toBe(false);
  });
});

describe("phoneValidation", () => {
  it("validates tanzania mobile numbers", () => {
    expect(isValidTzPhone("0712345678")).toBe(true);
    expect(isValidTzPhone("+255712345678")).toBe(true);
    expect(isValidTzPhone("12345")).toBe(false);
  });

  it("normalizes local numbers to international format", () => {
    expect(normalizeTzPhone("0712345678")).toBe("+255712345678");
  });
});
