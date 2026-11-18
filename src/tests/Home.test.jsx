import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../pages/Home";

vi.mock("../context/AuthContext", () => ({
  useSession: () => ({
    currentUser: {
      uid: "test-123",
      email: "eugene@example.com",
      displayName: "Eugene",
    },
    loading: false,
    logout: vi.fn(),
  }),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((q, callback) => {
    callback({ docs: [] });
    return vi.fn();
  }),
}));

describe("Home Component", () => {
  it("renders Nairobi Connect header correctly", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );

    const headerElement = screen.getByText(/Nairobi Connect/i);
    expect(headerElement).toBeInTheDocument();
  });
});
