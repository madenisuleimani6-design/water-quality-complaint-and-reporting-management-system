import { roundCoordinate } from "../utils/coordinates";

describe("roundCoordinate", () => {
  it("rounds GPS values to six decimal places", () => {
    expect(roundCoordinate(-6.792354123456789)).toBe(-6.792354);
    expect(roundCoordinate(39.208328987654321)).toBe(39.208329);
  });

  it("returns null for missing values", () => {
    expect(roundCoordinate(null)).toBeNull();
    expect(roundCoordinate(undefined)).toBeNull();
  });
});
