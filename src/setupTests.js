import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("firebase/firestore", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    collection: vi.fn(),
    getDocs: vi.fn(() =>
      Promise.resolve({
        docs: [
          {
            id: "1",
            data: () => ({
              title: "Westlands Clean-up",
              description: "Morning clean-up starting at 9am near the park.",
              category: "Events",
              authorName: "Eugene",
              uid: "u1",
            }),
          },
          {
            id: "2",
            data: () => ({
              title: "Lost Wallet",
              description: "Lost black leather wallet around Kilimani.",
              category: "Lost & Found",
              authorName: "Alice",
              uid: "u2",
            }),
          },
        ],
      }),
    ),
    query: vi.fn(),
    orderBy: vi.fn(),
    where: vi.fn(),
  };
});
