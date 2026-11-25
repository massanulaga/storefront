import { beforeEach, describe, expect, it, vi } from "vitest";

const mutate = vi.fn();
const getAccountAuthState = vi.fn();

vi.mock("@/lib/saleor", () => ({ mutate: (...args: unknown[]) => mutate(...args) }));
vi.mock("../get-current-user", () => ({
	getAccountAuthState: () => getAccountAuthState(),
}));

const { addWishlistItem, removeWishlistItem } = await import("./actions");

const authenticated = { status: "authenticated", user: { id: "customer-1" } };

describe("wishlist actions", () => {
	beforeEach(() => {
		mutate.mockReset();
		getAccountAuthState.mockReset();
	});

	describe("signed-out visitors", () => {
		beforeEach(() => {
			getAccountAuthState.mockResolvedValue({ status: "guest" });
		});

		it("refuses to add without calling the mutation", async () => {
			expect(await addWishlistItem("variant-1")).toEqual({ success: false, reason: "signedOut" });
			expect(mutate).not.toHaveBeenCalled();
		});

		it("refuses to remove without calling the mutation", async () => {
			expect(await removeWishlistItem("variant-1")).toEqual({ success: false, reason: "signedOut" });
			expect(mutate).not.toHaveBeenCalled();
		});
	});

	describe("signed-in shoppers", () => {
		beforeEach(() => {
			getAccountAuthState.mockResolvedValue(authenticated);
		});

		it("adds the variant and reports success", async () => {
			mutate.mockResolvedValue({ ok: true, data: { wishlistItemAdd: { errors: [] } } });
			expect(await addWishlistItem("variant-1")).toEqual({ success: true });
			expect(mutate).toHaveBeenCalledWith(expect.anything(), { variables: { variantId: "variant-1" } });
		});

		it("removes the variant and reports success", async () => {
			mutate.mockResolvedValue({ ok: true, data: { wishlistItemRemove: { errors: [] } } });
			expect(await removeWishlistItem("variant-1")).toEqual({ success: true });
			expect(mutate).toHaveBeenCalledWith(expect.anything(), { variables: { variantId: "variant-1" } });
		});

		it("reports failure when the request fails", async () => {
			mutate.mockResolvedValue({ ok: false, errors: [{ message: "network" }] });
			expect(await addWishlistItem("variant-1")).toEqual({ success: false, reason: "failed" });
			expect(await removeWishlistItem("variant-1")).toEqual({ success: false, reason: "failed" });
		});

		it("reports failure when the API returns account errors", async () => {
			mutate.mockResolvedValue({
				ok: true,
				data: { wishlistItemRemove: { errors: [{ field: "variantId", code: "NOT_FOUND" }] } },
			});
			expect(await removeWishlistItem("variant-1")).toEqual({ success: false, reason: "failed" });
		});
	});
});
