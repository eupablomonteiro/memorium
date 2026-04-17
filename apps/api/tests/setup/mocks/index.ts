import { vi } from "vitest";

export const mockDiskData = [
  {
    mount: "C:",
    size: 500000000000,
    used: 250000000000,
    available: 250000000000,
    use: 50,
  },
  {
    mount: "D:",
    size: 1000000000000,
    used: 750000000000,
    available: 250000000000,
    use: 75,
  },
];

export const createSysteminformationMock = () => {
  return {
    fsSize: vi.fn().mockResolvedValue(mockDiskData),
  };
};

export const mockConfigData = {
  storagePath: "D:\\TestMemorium",
  port: 3002,
};
