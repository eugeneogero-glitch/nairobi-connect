import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "../components/ProtectedRoute";

const mockSession = vi.hoisted(() => ({ value: { activeUser: null } }));
vi.mock("../context/AuthContext", () => ({
  useSession: () => mockSession.value,
}));

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={["/post"]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <p>Post page</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  it("redirects logged-out users to /login", () => {
    mockSession.value = { activeUser: null };
    renderRoute();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("shows the page to logged-in users", () => {
    mockSession.value = { activeUser: { uid: "u1" } };
    renderRoute();
    expect(screen.getByText("Post page")).toBeInTheDocument();
  });
});
