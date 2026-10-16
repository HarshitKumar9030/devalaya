// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
const mocks = vi.hoisted(() => ({
  session: {
    isLoaded: true,
    isSignedIn: true,
    userId: "owner-a",
    signIn: vi.fn(),
  },
  refresh: vi.fn(),
}));
vi.mock("@/components/auth/session-provider", () => ({
  useSessionGuard: () => mocks.session,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
import { PrivateContent } from "@/components/auth/private-content";
afterEach(cleanup);
beforeEach(() => {
  Object.assign(mocks.session, {
    isLoaded: true,
    isSignedIn: true,
    userId: "owner-a",
  });
});
it("renders private data only for the same verified owner", () => {
  render(
    <PrivateContent ownerId="owner-a">
      <p>Private ticket data</p>
    </PrivateContent>,
  );
  expect(screen.queryByText("Private ticket data")).not.toBeNull();
});
it("removes data immediately after signing out", () => {
  const view = render(
    <PrivateContent ownerId="owner-a">
      <p>Private ticket data</p>
    </PrivateContent>,
  );
  mocks.session.isSignedIn = false;
  view.rerender(
    <PrivateContent ownerId="owner-a">
      <p>Private ticket data</p>
    </PrivateContent>,
  );
  expect(screen.queryByText("Private ticket data")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Sign in securely" }),
  ).not.toBeNull();
});
it("hides a prior account’s data and refreshes when accounts switch", () => {
  mocks.session.userId = "owner-b";
  render(
    <PrivateContent ownerId="owner-a">
      <p>Private ticket data</p>
    </PrivateContent>,
  );
  expect(screen.queryByText("Private ticket data")).toBeNull();
  expect(mocks.refresh).toHaveBeenCalled();
});
