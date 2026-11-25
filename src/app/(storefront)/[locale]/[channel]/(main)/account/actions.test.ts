import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
	refresh: vi.fn(),
}));
vi.mock("@/lib/saleor", () => ({
	mutate: vi.fn(),
}));

import { mutate } from "@/lib/saleor";
import { removeWishlistItem } from "./actions";

const run = vi.mocked(mutate);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("removeWishlistItem", () => {
	it("sends only the variant id, so the customer cannot target another user's item", async () => {
		run.mockResolvedValue({
			ok: true,
			data: { wishlistItemRemove: { errors: [] } },
		} as never);

		const result = await removeWishlistItem("variant-1");

		expect(run).toHaveBeenCalledTimes(1);
		expect(run.mock.calls[0][1]).toEqual({ variables: { variantId: "variant-1" } });
		expect(result).toEqual({ success: true });
	});

	it("returns the removal error key when Saleor reports errors", async () => {
		run.mockResolvedValue({
			ok: true,
			data: { wishlistItemRemove: { errors: [{ message: "not found" }] } },
		} as never);

		const result = await removeWishlistItem("variant-1");

		expect(result).toEqual({ success: false, errorKey: "removeWishlistItemFailed" });
	});

	it("returns the removal error key when the request fails", async () => {
		run.mockResolvedValue({ ok: false, error: new Error("down") } as never);

		const result = await removeWishlistItem("variant-1");

		expect(result).toEqual({ success: false, errorKey: "removeWishlistItemFailed" });
	});
});
