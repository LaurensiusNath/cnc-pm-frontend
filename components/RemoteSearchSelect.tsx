"use client";

import { useMemo, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 400;

interface RemoteSearchSelectProps<T> {
  value: T | null;
  onValueChange: (value: T | null) => void;
  /**
   * Must be a stable reference (a hook defined at module scope, e.g.
   * useCustomerOptions) - called unconditionally on every render, same as
   * any other hook, just supplied by the caller so this component stays
   * ignorant of what it's actually searching.
   */
  useOptions: (query: string) => {
    data: T[] | undefined;
    isFetching: boolean;
  };
  getOptionLabel: (item: T) => string;
  getOptionId: (item: T) => string;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function RemoteSearchSelect<T>({
  value,
  onValueChange,
  useOptions,
  getOptionLabel,
  getOptionId,
  placeholder,
  emptyMessage = "Tidak ada hasil.",
  disabled,
  "aria-label": ariaLabel,
}: RemoteSearchSelectProps<T>) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const { data, isFetching } = useOptions(debouncedSearch);

  // Keeps the selected item visible/labelable even if it falls out of the
  // current search results (e.g. user searched something else after
  // picking a value) - per Base UI's documented async-search pattern.
  const items = useMemo(() => {
    const options = data ?? [];
    if (!value) return options;
    const alreadyIncluded = options.some(
      (item) => getOptionId(item) === getOptionId(value),
    );
    return alreadyIncluded ? options : [value, ...options];
  }, [data, value, getOptionId]);

  return (
    <Combobox
      items={items}
      value={value}
      itemToStringLabel={getOptionLabel}
      isItemEqualToValue={(item: T, val: T) =>
        getOptionId(item) === getOptionId(val)
      }
      filter={null}
      disabled={disabled}
      onValueChange={(next) => onValueChange(next as T | null)}
      onInputValueChange={(next, { reason }) => {
        // Selecting an item also fires this (input text becomes the
        // item's label) - not a real search intent, skip it.
        if (reason === "item-press") return;
        setSearchInput(next);
      }}
    >
      <ComboboxInput
        placeholder={placeholder}
        aria-label={ariaLabel}
        showClear
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: T) => (
            <ComboboxItem key={getOptionId(item)} value={item}>
              {getOptionLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>
          {isFetching ? "Mencari..." : emptyMessage}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
