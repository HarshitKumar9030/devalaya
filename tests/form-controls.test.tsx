// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CustomSelect,
  DateInput,
  NumberInput,
} from "@/components/ui/form-controls";
afterEach(cleanup);
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
it("supports keyboard selection and restores trigger focus", async () => {
  const user = userEvent.setup();
  function Example() {
    const [value, setValue] = useState("all");
    return (
      <CustomSelect
        ariaLabel="Location"
        value={value}
        onValueChange={setValue}
        options={[
          { value: "all", label: "All locations" },
          { value: "north", label: "North India" },
          { value: "south", label: "South India" },
        ]}
      />
    );
  }
  render(<Example />);
  const trigger = screen.getByRole("combobox", { name: "Location" });
  trigger.focus();
  await user.keyboard("{Enter}");
  await screen.findByRole("option", { name: "North India" });
  await user.keyboard("{ArrowDown}{Enter}");
  expect(trigger.textContent).toContain("North India");
  expect(document.activeElement).toBe(trigger);
});
it("keeps custom number steppers within their declared limits", async () => {
  const user = userEvent.setup();
  function Example() {
    const [value, setValue] = useState(1);
    return (
      <NumberInput
        label="Devotees"
        min={1}
        max={2}
        value={value}
        onValueChange={setValue}
      />
    );
  }
  render(<Example />);
  expect(
    (
      screen.getByRole("button", {
        name: "Decrease Devotees",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "Increase Devotees" }));
  expect(
    (screen.getByRole("spinbutton", { name: "Devotees" }) as HTMLInputElement)
      .value,
  ).toBe("2");
  expect(
    (
      screen.getByRole("button", {
        name: "Increase Devotees",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});
it("uses a custom calendar and disables dates before the minimum", async () => {
  const user = userEvent.setup();
  render(
    <DateInput
      label="Visit date"
      value=""
      onValueChange={vi.fn()}
      min="2099-10-16"
    />,
  );
  await user.click(screen.getByRole("button", { name: "Visit date" }));
  expect(screen.getByRole("grid")).not.toBeNull();
  expect(document.querySelector(".rdp-disabled button")).not.toBeNull();
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
});
