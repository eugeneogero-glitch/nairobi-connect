import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PostNotice from "../pages/PostNotice";

const { addDocMock, navigateMock, mockSession } = vi.hoisted(() => ({
  addDocMock: vi.fn(),
  navigateMock: vi.fn(),
  mockSession: { value: { activeUser: null } },
}));

vi.mock("../firebase", () => ({ db: {} }));
vi.mock("../context/AuthContext", () => ({
  useSession: () => mockSession.value,
}));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => "notices-ref"),
  addDoc: (...args) => addDocMock(...args),
  serverTimestamp: vi.fn(() => "server-time"),
}));
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <PostNotice />
    </MemoryRouter>,
  );

const fillForm = () => {
  fireEvent.change(
    screen.getByPlaceholderText(/westlands community clean-up/i),
    { target: { value: "Kilimani Clean-up" } },
  );
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "Safety Alert" },
  });
  fireEvent.change(screen.getByPlaceholderText(/e\.g\. westlands, nairobi/i), {
    target: { value: "Kilimani, Nairobi" },
  });
  fireEvent.change(screen.getByPlaceholderText(/provide details/i), {
    target: { value: "Meet at 8am" },
  });
};

const submitForm = () =>
  fireEvent.submit(
    screen.getByRole("button", { name: /publish notice/i }).closest("form"),
  );

describe("PostNotice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addDocMock.mockResolvedValue({});
    mockSession.value = { activeUser: null };
  });

  it("renders the form fields and publish button", () => {
    renderPage();
    expect(screen.getByText(/post community notice/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/westlands community clean-up/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /publish notice/i }),
    ).toBeInTheDocument();
  });

  it("asks logged-out users to log in and does not save", async () => {
    renderPage();
    submitForm();
    expect(
      await screen.findByText(/please log in to publish a notice/i),
    ).toBeInTheDocument();
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it("saves the notice with authorId and authorName, then redirects", async () => {
    mockSession.value = {
      activeUser: {
        uid: "u1",
        displayName: "Eugene Ogero",
        email: "e@example.com",
      },
    };
    renderPage();
    fillForm();
    submitForm();

    await waitFor(() => expect(addDocMock).toHaveBeenCalledTimes(1));
    expect(addDocMock.mock.calls[0][1]).toMatchObject({
      title: "Kilimani Clean-up",
      category: "Safety Alert",
      location: "Kilimani, Nairobi",
      description: "Meet at 8am",
      authorId: "u1",
      authorName: "Eugene Ogero",
    });
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("uses the email name when the user has no display name", async () => {
    mockSession.value = {
      activeUser: { uid: "u2", displayName: null, email: "amina@example.com" },
    };
    renderPage();
    fillForm();
    submitForm();

    await waitFor(() => expect(addDocMock).toHaveBeenCalled());
    expect(addDocMock.mock.calls[0][1].authorName).toBe("amina");
  });

  it("shows an error message when saving fails", async () => {
    addDocMock.mockRejectedValue(new Error("permission-denied"));
    mockSession.value = {
      activeUser: { uid: "u1", displayName: "Eugene", email: "e@example.com" },
    };
    renderPage();
    fillForm();
    submitForm();

    expect(
      await screen.findByText(/could not publish notice: permission-denied/i),
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
