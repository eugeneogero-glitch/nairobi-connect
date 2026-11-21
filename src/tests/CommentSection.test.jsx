import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommentSection from "../components/CommentSection";

const { addDocMock, onSnapshotMock } = vi.hoisted(() => ({
  addDocMock: vi.fn(),
  onSnapshotMock: vi.fn(),
}));

vi.mock("../firebase", () => ({ db: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => "comments-ref"),
  query: vi.fn((ref) => ref),
  orderBy: vi.fn(),
  addDoc: (...args) => addDocMock(...args),
  onSnapshot: (...args) => onSnapshotMock(...args),
  serverTimestamp: vi.fn(() => "server-time"),
}));

describe("CommentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onSnapshotMock.mockImplementation((_q, callback) => {
      callback({ docs: [] });
      return vi.fn();
    });
    addDocMock.mockResolvedValue({});
  });

  it("renders comments returned from Firestore", () => {
    onSnapshotMock.mockImplementation((_q, callback) => {
      callback({
        docs: [
          {
            id: "c1",
            data: () => ({ text: "Great update!", authorName: "Amina" }),
          },
        ],
      });
      return vi.fn();
    });

    render(<CommentSection noticeId="n1" currentUser={null} />);
    expect(screen.getByText(/great update!/i)).toBeInTheDocument();
  });

  it("submits a new comment when a user is logged in", async () => {
    render(
      <CommentSection
        noticeId="n1"
        currentUser={{
          uid: "u1",
          displayName: "Eugene",
          email: "e@example.com",
        }}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "I will be there!" } });
    fireEvent.submit(input.closest("form"));

    await waitFor(() => expect(addDocMock).toHaveBeenCalledTimes(1));
  });
});
