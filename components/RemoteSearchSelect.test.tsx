import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RemoteSearchSelect } from "./RemoteSearchSelect";

interface Item {
  id: string;
  name: string;
}

const ITEMS: Item[] = [
  { id: "1", name: "Acme Corp" },
  { id: "2", name: "Beta Industries" },
];

// useOptions as a controllable fake, following this component's own
// hook-as-prop design - no MSW/network needed to test its own rendering
// logic in isolation. Always returns data regardless of query (matching
// useCustomerOptions, which fetches unconditionally - an empty search
// param is just "no filter", not "don't fetch").
function makeUseOptions(resultsFor: (query: string) => Item[]) {
  return (query: string) => ({
    data: resultsFor(query),
    isFetching: false,
  });
}

describe("RemoteSearchSelect", () => {
  // This is the exact gap that let the "kenapa dropdown customer tidak
  // ada hasil" report through: useCustomerOptions used to skip fetching
  // entirely until the user typed something, so an untouched combobox
  // showed the SAME "no results" message as a genuine failed search.
  // useCustomerOptions now fetches unconditionally - covered here at the
  // RemoteSearchSelect level with a useOptions fake that returns the
  // full list for an empty query, same as the real one does.
  it("shows the full option list immediately on open, before typing anything", async () => {
    render(
      <RemoteSearchSelect<Item>
        value={null}
        onValueChange={jest.fn()}
        useOptions={makeUseOptions(() => ITEMS)}
        getOptionLabel={(i) => i.name}
        getOptionId={(i) => i.id}
        aria-label="Customer"
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: /customer/i }));

    expect(await screen.findByRole("option", { name: "Acme Corp" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beta Industries" })).toBeInTheDocument();
  });

  it("narrows the list as the user types (via useOptions, which owns the actual filtering)", async () => {
    render(
      <RemoteSearchSelect<Item>
        value={null}
        onValueChange={jest.fn()}
        useOptions={makeUseOptions((q) =>
          ITEMS.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())),
        )}
        getOptionLabel={(i) => i.name}
        getOptionId={(i) => i.id}
        aria-label="Customer"
      />,
    );

    const user = userEvent.setup();
    const input = screen.getByRole("combobox", { name: /customer/i });
    await user.click(input);
    await user.type(input, "Acme");

    // Only asserting the match appears, not that the non-match's DOM node
    // is fully gone - Base UI's popup exit relies on a CSS transitionend
    // that jsdom never fires, so a filtered-out item can linger in the DOM
    // mid (never-completing) exit animation here without it being a real
    // bug - confirmed correct in an actual browser separately (typing
    // "Dashboard" showed exactly the 2 matching customers, "kucing"
    // exactly 1, nothing extra).
    expect(await screen.findByRole("option", { name: "Acme Corp" })).toBeInTheDocument();
  });

  it("shows the empty message once a search genuinely returns nothing", async () => {
    render(
      <RemoteSearchSelect<Item>
        value={null}
        onValueChange={jest.fn()}
        useOptions={makeUseOptions(() => [])}
        getOptionLabel={(i) => i.name}
        getOptionId={(i) => i.id}
        aria-label="Customer"
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: /customer/i }));

    expect(await screen.findByText(/tidak ada hasil/i)).toBeInTheDocument();
  });

  it("shows a 'Mencari...' state while isFetching, not the empty message", async () => {
    render(
      <RemoteSearchSelect<Item>
        value={null}
        onValueChange={jest.fn()}
        useOptions={() => ({ data: undefined, isFetching: true })}
        getOptionLabel={(i) => i.name}
        getOptionId={(i) => i.id}
        aria-label="Customer"
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: /customer/i }));

    expect(await screen.findByText(/mencari/i)).toBeInTheDocument();
    expect(screen.queryByText(/tidak ada hasil/i)).not.toBeInTheDocument();
  });
});
