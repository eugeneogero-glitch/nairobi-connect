import { render, screen, act, waitFor } from "@testing-library/react";
import { SessionProvider, useSession } from "../context/AuthContext";
import { useContext } from "react";
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return vi.fn();
  }),
}));

const ContextConsumer = () => {
  const context = useSession();
  if (!context) return <div>No Context</div>;

  const {
    activeUser,
    registerWithEmail,
    authenticateWithEmail,
    authenticateWithGoogle,
    terminateSession,
  } = context;

  return (
    <div>
      <span data-testid="user-status">
        {activeUser ? activeUser.email : "Logged Out"}
      </span>
      <button
        onClick={() =>
          authenticateWithEmail &&
          authenticateWithEmail("test@example.com", "password")
        }
      >
        Sign In
      </button>
      <button onClick={() => terminateSession && terminateSession()}>
        Sign Out
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  it("renders children and provides initial authentication state", async () => {
    render(
      <SessionProvider>
        <ContextConsumer />
      </SessionProvider>,
    );

    expect(screen.getByTestId("user-status")).toHaveTextContent("Logged Out");
  });

  it("handles login and logout actions", async () => {
    render(
      <SessionProvider>
        <ContextConsumer />
      </SessionProvider>,
    );

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await act(async () => {
      signInButton.click();
    });
  });
});
