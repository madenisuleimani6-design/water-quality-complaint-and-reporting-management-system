import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  enqueueSubmission,
  getQueuedSubmissions,
  removeQueuedSubmission,
} from "../utils/offlineQueue";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("offlineQueue", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("enqueues and reads submissions", async () => {
    await enqueueSubmission({
      photoUri: "file:///photo.jpg",
      latitude: -6.7,
      longitude: 39.2,
      note: "brown water",
      phone: "+255712345678",
      reporterName: "Jane Citizen",
    });

    const queue = await getQueuedSubmissions();
    expect(queue).toHaveLength(1);
    expect(queue[0].photoUri).toBe("file:///photo.jpg");
  });

  it("removes a queued submission", async () => {
    const item = await enqueueSubmission({
      photoUri: "file:///photo.jpg",
      latitude: null,
      longitude: null,
      note: "",
      phone: "+255712345678",
      reporterName: "Jane Citizen",
    });

    await removeQueuedSubmission(item.id);
    expect(await getQueuedSubmissions()).toHaveLength(0);
  });

  it("throws when queue is full", async () => {
    for (let i = 0; i < 10; i += 1) {
      await enqueueSubmission({
        photoUri: `file:///photo-${i}.jpg`,
        latitude: null,
        longitude: null,
        note: "",
        phone: "+255712345678",
        reporterName: "Jane Citizen",
      });
    }

    await expect(
      enqueueSubmission({
        photoUri: "file:///overflow.jpg",
        latitude: null,
        longitude: null,
        note: "",
        phone: "+255712345678",
        reporterName: "Jane Citizen",
      }),
    ).rejects.toThrow("Offline queue is full");
  });
});
