import { beforeEach, describe, expect, it, vi } from "vitest";

const mutate = vi.fn();
const getAccountAuthState = vi.fn();

vi.mock("@/lib/saleor", () => ({ mutate: (...args: unknown[]) => mutate(...args) }));
vi.mock("../get-current-user", () => ({
	getAccountAuthState: () => getAccountAuthState(),
}));

const { addWishlistItem } = await import("./actions");

const authenticated = { status: "authenticated", user: { id: "customer-1" } };

describe("addWishlistItem", () => {
	beforeEach(() => {
		mutate.mockReset();
		getAccountAuthState.mockReset();
	});

	it("refuses to add for a signed-out visitor without calling the mutation", async () => {
		getAccountAuthState.mockResolvedValue({ status: "guest" });

		expect(await addWishlistItem("variant-1")).toEqual({ success: false, reason: "signedOut" });
		expect(mutate).not.toHaveBeenCalled();
	});

	it("adds the variant for a signed-in shopper and reports success", async () => {
		getAccountAuthState.mockResolvedValue(authenticated);
		mutate.mockResolvedValue({ ok: true, data: { wishlistItemAdd: { errors: [] } } });

		expect(await addWishlistItem("variant-1")).toEqual({ success: true });
		expect(mutate).toHaveBeenCalledWith(expect.anything(), { variables: { variantId: "variant-1" } });
	});

	it("reports failure when the request fails", async () => {
		getAccountAuthState.mockResolvedValue(authenticated);
		mutate.mockResolvedValue({ ok: false, error: new Error("down") });

		expect(await addWishlistItem("variant-1")).toEqual({ success: false, reason: "failed" });
	});

	it("reports failure when the API returns account errors", async () => {
		getAccountAuthState.mockResolvedValue(authenticated);
		mutate.mockResolvedValue({ ok: true, data: { wishlistItemAdd: { errors: [{ message: "nope" }] } } });

		expect(await addWishlistItem("variant-1")).toEqual({ success: false, reason: "failed" });
	});
});
