import React from "react";
import { render, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../components/AuthContext";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Test Component to access AuthContext
const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="auth-status">
        {isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </p>
      <p data-testid="user">{user ? user.name : "No User"}</p>
      <button onClick={() => login({ name: "Test User", token: "12345" })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should initialize with no user and not authenticated", () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("auth-status").textContent).toBe("Not Authenticated");
    expect(getByTestId("user").textContent).toBe("No User");
  });

  it("should log in a user and set authentication state", () => {
    const { getByTestId, getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      getByText("Login").click();
    });

    expect(getByTestId("auth-status").textContent).toBe("Authenticated");
    expect(getByTestId("user").textContent).toBe("Test User");
    expect(window.localStorage.getItem("token")).toBe("12345");
    expect(JSON.parse(window.localStorage.getItem("user"))).toEqual({
      name: "Test User",
      token: "12345",
    });
  });

  it("should log out a user and clear authentication state", () => {
    const { getByTestId, getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Log in first
    act(() => {
      getByText("Login").click();
    });

    // Log out
    act(() => {
      getByText("Logout").click();
    });

    expect(getByTestId("auth-status").textContent).toBe("Not Authenticated");
    expect(getByTestId("user").textContent).toBe("No User");
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(window.localStorage.getItem("user")).toBeNull();
  });

  it("should initialize with user data from localStorage", () => {
    window.localStorage.setItem("token", "12345");
    window.localStorage.setItem(
      "user",
      JSON.stringify({ name: "Stored User", token: "12345" })
    );

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("auth-status").textContent).toBe("Authenticated");
    expect(getByTestId("user").textContent).toBe("Stored User");
  });
});