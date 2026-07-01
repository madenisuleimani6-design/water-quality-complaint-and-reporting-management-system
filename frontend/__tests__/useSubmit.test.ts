import { renderHook } from "@testing-library/react-native";
import NetInfo from "@react-native-community/netinfo";

import { useSubmit } from "../hooks/useSubmit";
import { submitComplaint } from "../services/complaints";
import { enqueueSubmission } from "../utils/offlineQueue";

jest.mock("@react-native-community/netinfo");
jest.mock("../services/complaints");
jest.mock("../utils/offlineQueue");

const mockedNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockedSubmit = submitComplaint as jest.MockedFunction<typeof submitComplaint>;
const mockedEnqueue = enqueueSubmission as jest.MockedFunction<
  typeof enqueueSubmission
>;

describe("useSubmit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits online successfully", async () => {
    mockedNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    } as never);
    mockedSubmit.mockResolvedValue({ id: "abc-123", status: "new" });

    const { result } = await renderHook(() => useSubmit());
    const response = await result.current!.submit({
      photoUri: "file:///photo.jpg",
      latitude: -6.7,
      longitude: 39.2,
      note: "test",
    });

    expect(response.success).toBe(true);
    if (response.success && !response.queued) {
      expect(response.complaintId).toBe("abc-123");
    }
    expect(mockedSubmit).toHaveBeenCalled();
  });

  it("queues submission when offline", async () => {
    mockedNetInfo.fetch.mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    } as never);
    mockedEnqueue.mockResolvedValue({
      id: "q1",
      photoUri: "file:///photo.jpg",
      latitude: null,
      longitude: null,
      note: "",
      createdAt: new Date().toISOString(),
    });

    const { result } = await renderHook(() => useSubmit());
    const response = await result.current!.submit({
      photoUri: "file:///photo.jpg",
      latitude: null,
      longitude: null,
    });

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.queued).toBe(true);
    }
    expect(mockedEnqueue).toHaveBeenCalled();
  });
});
