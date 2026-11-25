import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionQuery = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/saleor", () => ({ sessionQuery: (...args: unknown[]) => sessionQuery(...args) }));

const { getSavedVariantIds } = await import("./get-wishlist");

describe("getSavedVariantIds", () => {
	beforeEach(() => {
		sessionQuery.mockReset();
	});

	it("returns the saved variant IDs", async () => {
		sessionQuery.mockResolvedValue({
			ok: true,
			data: { wishlist: [{ variant: { id: "variant-1" } }, { variant: { id: "variant-2" } }] },
		});
		expect(await getSavedVariantIds()).toEqual(["variant-1", "variant-2"]);
	});

	it("returns an empty list when nothing is saved", async () => {
		sessionQuery.mockResolvedValue({ ok: true, data: { wishlist: [] } });
		expect(await getSavedVariantIds()).toEqual([]);
	});

	it("returns null when the read fails, so the heart is hidden instead of showing nothing saved", async () => {
		sessionQuery.mockResolvedValue({ ok: false, errors: [{ message: "network" }] });
		expect(await getSavedVariantIds()).toBeNull();
	});
});
