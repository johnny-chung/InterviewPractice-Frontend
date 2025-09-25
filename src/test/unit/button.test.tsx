import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import userEvent from "@testing-library/user-event";

describe("Button", () => {
  it("renders with default variant and responds to click", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click Me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
