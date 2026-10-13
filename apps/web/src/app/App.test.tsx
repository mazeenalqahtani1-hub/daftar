import { createMemoryHistory } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App shell", () => {
  it("renders the home route in Arabic", async () => {
    render(<App history={createMemoryHistory({ initialEntries: ["/"] })} />);
    expect(await screen.findByRole("heading", { name: "دفتر" })).toBeInTheDocument();
  });
});
