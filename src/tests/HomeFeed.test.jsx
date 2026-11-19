import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { updateDoc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Home from "../pages/Home";

vi.mock("../components/CommentSection", () => ({
  default: () => <div data-testid="comments" />,
}));

vi.mock("../firebase", () => ({ db: {}, auth: {} }));

vi.mock("firebase/auth", () => ({
  signOut: vi.fn(() => Promise.resolve()),
}));

vi.mock("../context/AuthContext", () => ({
  useSession: () => ({ activeUser: { uid: "owner-123" } }),
}));

const fakeNotices = [
  {
    id: "1",
    title: "Westlands Clean-up",
    description: "Meet at 9am at the roundabout",
    category: "Community Event",
    authorName: "Eugene",
    authorId: "owner-123",
  },
  {
    id: "2",
    title: "Lost Wallet",
    description: "Black wallet near Kilimani market",
    category: "Lost & Found",
    authorName: "Amina",
    authorId: "someone-else",
  },
];

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  getDocs: vi.fn(() =>
    Promise.resolve({
      docs: fakeNotices.map((n) => {
        const { id, ...data } = n;
        return { id, data: () => data };
      }),
    }),
  ),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home feed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows notices from Firestore", async () => {
    renderHome();
    expect(await screen.findByText("Westlands Clean-up")).toBeInTheDocument();
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
  });

  it("filters notices by category", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Lost & Found" },
    });

    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
    expect(screen.queryByText("Westlands Clean-up")).not.toBeInTheDocument();
  });

  it("filters by Community Event", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Community Event" },
    });

    expect(screen.getByText("Westlands Clean-up")).toBeInTheDocument();
    expect(screen.queryByText("Lost Wallet")).not.toBeInTheDocument();
  });

  it("searches notices by keyword", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    fireEvent.change(screen.getByPlaceholderText(/search notices/i), {
      target: { value: "kilimani" },
    });

    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
    expect(screen.queryByText("Westlands Clean-up")).not.toBeInTheDocument();
  });

  it("shows an empty message when nothing matches", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    fireEvent.change(screen.getByPlaceholderText(/search notices/i), {
      target: { value: "zzzz" },
    });

    expect(screen.getByText("No notices found.")).toBeInTheDocument();
  });

  it("shows Edit and Delete only on the owner's notice", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    expect(screen.getAllByText("Edit")).toHaveLength(1);
    expect(screen.getAllByText("Delete")).toHaveLength(1);
  });

  it("searches notices by description", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    fireEvent.change(screen.getByPlaceholderText(/search notices/i), {
      target: { value: "9am" },
    });

    expect(screen.getByText("Westlands Clean-up")).toBeInTheDocument();
    expect(screen.queryByText("Lost Wallet")).not.toBeInTheDocument();
  });

  it("resets all active filters when changing values back to default", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Lost & Found" },
    });
    expect(screen.queryByText("Westlands Clean-up")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "All" },
    });

    expect(screen.getByText("Westlands Clean-up")).toBeInTheDocument();
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
  });

  it("deletes the owner's notice after confirmation", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    renderHome();
    await screen.findByText("Westlands Clean-up");

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("Westlands Clean-up")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
  });

  it("edits the owner's notice", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Edit title"), {
      target: { value: "Westlands Big Clean-up" },
    });
    fireEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByText("Westlands Big Clean-up"),
    ).toBeInTheDocument();
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it("shows the Post a notice link and logs out", async () => {
    renderHome();
    await screen.findByText("Westlands Clean-up");

    expect(screen.getByText("Post a notice")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Log out"));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
  });
});
