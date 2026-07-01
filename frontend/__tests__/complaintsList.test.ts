import { listComplaintsByPhone } from "../services/complaints";
import { api } from "../services/api";

jest.mock("../services/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedGet = api.get as jest.MockedFunction<typeof api.get>;

describe("listComplaintsByPhone", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns complaint results from API", async () => {
    mockedGet.mockResolvedValue({
      data: {
        results: [
          {
            id: "abc-1",
            status: "new",
            areaName: "Kinondoni",
            submittedAt: "2026-06-01T10:00:00Z",
          },
        ],
      },
    });

    const results = await listComplaintsByPhone("+255712345678");
    expect(results).toHaveLength(1);
    expect(mockedGet).toHaveBeenCalledWith("/api/complaints/", {
      params: { phone: "+255712345678" },
    });
  });
});
