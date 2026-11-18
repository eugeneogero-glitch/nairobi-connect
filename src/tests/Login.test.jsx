import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../pages/Login";

const { emailSignIn, googleSignIn, navigateMock } = vi.hoisted(() => ({
  emailSignIn: vi.fn(),
  googleSignIn: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useSession: () => ({
    authenticateWithEmail: emailSignIn,
    authenticateWithGoogle: googleSignIn,
  }),
}));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

const fillAndSubmit = (container) => {
  fireEvent.change(screen.getByPlaceholderText("user@example.com"), {
    target: { value: "eugene@example.com" },
  });
  fireEvent.change(container.querySelector('input[type="password"]'), {
    target: { value: "secret123" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: /log in/i }).closest("form"),
  );
};

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    emailSignIn.mockResolvedValue({});
    googleSignIn.mockResolvedValue({});
  });

  it("renders the sign-in form and Google button", () => {
    renderLogin();
    expect(screen.getByText(/nairobi connect - sign in/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("user@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it("signs in with email and password, then redirects home", async () => {
    const { container } = renderLogin();
    fillAndSubmit(container);

    await waitFor(() =>
      expect(emailSignIn).toHaveBeenCalledWith(
        "eugene@example.com",
        "secret123",
      ),
    );
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows an error when email sign-in fails", async () => {
    emailSignIn.mockRejectedValue(new Error("wrong-password"));
    const { container } = renderLogin();
    fillAndSubmit(container);

    expect(
      await screen.findByText(/sign-in failed: wrong-password/i),
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("signs in with Google, then redirects home", async () => {
    renderLogin();
    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    await waitFor(() => expect(googleSignIn).toHaveBeenCalledTimes(1));
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows an error when Google sign-in fails", async () => {
    googleSignIn.mockRejectedValue(new Error("popup-closed"));
    renderLogin();
    fireEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    expect(
      await screen.findByText(/google sign-in failed: popup-closed/i),
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
