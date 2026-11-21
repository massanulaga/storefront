import { describe, expect, it } from "vitest";

import { getStockLineState } from "./stock-line";

describe("getStockLineState", () => {
	it("shows in stock when the selected variant can be bought", () => {
		expect(getStockLineState({ disabled: false })).toBe("in-stock");
	});

	it("shows out of stock when the selected variant has no stock", () => {
		expect(getStockLineState({ disabled: true, disabledReason: "out-of-stock" })).toBe("out-of-stock");
	});

	it("shows nothing when no variant is selected", () => {
		expect(getStockLineState({ disabled: true, disabledReason: "no-selection" })).toBeNull();
		expect(getStockLineState({ disabled: true })).toBeNull();
	});
});
