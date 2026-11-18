import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Home from "../pages/Home";

const { notices, mockSession } = vi.hoisted(() => ({
  notices: [
    {
      id: "1",
      title: "Westlands Clean-up",
      description: "Meet at 9am",
      category: "Community Event",
      location: "Westlands, Nairobi",
      authorId: "u1",
      authorName: "Eugene",
    },
    {
      id: "2",
      title: "Lost Wallet",
      description: "Black wallet",
      category: "Lost & Found",
      location: "Kilimani, Nairobi",
      authorId: "u2",
      authorName: "Amina",
    },
  ],
  mockSession: { value: { activeUser: null, terminateSession: () => {} } },
}));

vi.mock("../firebase", () => ({ db: {} }));
vi.mock("../context/AuthContext", () => ({
  useSession: () => mockSession.value,
}));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  doc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  onSnapshot: (q, onNext) => {
    onNext({
      docs: notices.map(({ id, ...rest }) => ({ id, data: () => rest })),
    });
    return () => {};
  },
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

describe("Home feed", () => {
  it("shows notices from Firestore", () => {
    renderHome();
    expect(screen.getByText("Westlands Clean-up")).toBeInTheDocument();
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
  });

  it("filters notices by category", () => {
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: "Lost & Found" }));
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
    expect(screen.queryByText("Westlands Clean-up")).not.toBeInTheDocument();
  });

  it("searches notices by keyword", () => {
    renderHome();
    fireEvent.change(screen.getByPlaceholderText(/search notices/i), {
      target: { value: "kilimani" },
    });
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
    expect(screen.queryByText("Westlands Clean-up")).not.toBeInTheDocument();
  });

  it("shows an empty message when nothing matches", () => {
    renderHome();
    fireEvent.change(screen.getByPlaceholderText(/search notices/i), {
      target: { value: "zzzz" },
    });
    expect(
      screen.getByText(/no notices found matching your criteria/i),
    ).toBeInTheDocument();
  });

  it("shows Edit and Delete only on the owner's notice", () => {
    mockSession.value = {
      activeUser: { uid: "u1", email: "e@x.com" },
      terminateSession: () => {},
    };
    renderHome();
    expect(screen.getAllByText("Edit")).toHaveLength(1);
    expect(screen.getAllByText("Delete")).toHaveLength(1);
  });
  it("searches notices by description and clears search input", () => {
    renderHome();
    const searchInput = screen.getByPlaceholderText(/search notices/i);

    fireEvent.change(searchInput, { target: { value: "9am" } });
    expect(screen.getByText("Westlands Clean-up")).toBeInTheDocument();
    expect(screen.queryByText("Lost Wallet")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 notices")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^clear$/i }));
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2 notices")).toBeInTheDocument();
  });

  it("resets all active filters when clicking Reset all filters", () => {
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: "Lost & Found" }));
    fireEvent.change(screen.getByPlaceholderText(/search notices/i), {
      target: { value: "black" },
    });

    expect(screen.getByText("Showing 1 of 2 notices")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset all filters/i }));
    expect(screen.getByText("Westlands Clean-up")).toBeInTheDocument();
    expect(screen.getByText("Lost Wallet")).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2 notices")).toBeInTheDocument();
  });
});
