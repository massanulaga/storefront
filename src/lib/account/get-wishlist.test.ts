import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/has-auth-session", () => ({
	hasAuthSession: vi.fn(),
}));
vi.mock("@/lib/saleor", () => ({
	sessionQuery: vi.fn(),
}));

import { hasAuthSession } from "@/lib/auth/has-auth-session";
import { sessionQuery } from "@/lib/saleor";
import { getCurrentUserWishlist } from "./get-wishlist";

const hasSession = vi.mocked(hasAuthSession);
const query = vi.mocked(sessionQuery);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getCurrentUserWishlist", () => {
	it("returns signed-out without querying Saleor when there is no session", async () => {
		hasSession.mockResolvedValue(false);

		const result = await getCurrentUserWishlist();

		expect(result).toEqual({ status: "signed-out" });
		expect(query).not.toHaveBeenCalled();
	});

	it("returns the customer's items when the session query succeeds", async () => {
		hasSession.mockResolvedValue(true);
		const items = [{ id: "1", createdAt: "2026-11-20T00:00:00Z" }];
		query.mockResolvedValue({ ok: true, data: { wishlist: items } } as never);

		const result = await getCurrentUserWishlist();

		expect(result).toEqual({ status: "ok", items });
	});

	it("returns error when the session query fails", async () => {
		hasSession.mockResolvedValue(true);
		query.mockResolvedValue({ ok: false, error: new Error("down") } as never);

		const result = await getCurrentUserWishlist();

		expect(result).toEqual({ status: "error" });
	});
});
