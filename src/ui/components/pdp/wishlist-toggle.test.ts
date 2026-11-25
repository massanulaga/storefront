// @vitest-environment happy-dom
import { createElement, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const addWishlistItem = vi.fn();
const removeWishlistItem = vi.fn();

vi.mock("@/app/(storefront)/[locale]/[channel]/(main)/account/wishlist/actions", () => ({
	addWishlistItem: (...args: unknown[]) => addWishlistItem(...args),
}));
vi.mock("@/app/(storefront)/[locale]/[channel]/(main)/account/actions", () => ({
	removeWishlistItem: (...args: unknown[]) => removeWishlistItem(...args),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

const { WishlistToggle } = await import("./wishlist-toggle");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

async function flush() {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
}

function toggleButton() {
	return container.querySelector("button") as HTMLButtonElement;
}

describe("WishlistToggle", () => {
	beforeEach(() => {
		addWishlistItem.mockReset();
		removeWishlistItem.mockReset();
		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(async () => {
		await act(async () => root.unmount());
		container.remove();
	});

	it("shows the saved state when the variant is already in the wishlist", async () => {
		await act(async () =>
			root.render(createElement(WishlistToggle, { variantId: "variant-1", initiallySaved: true })),
		);
		expect(toggleButton().getAttribute("aria-pressed")).toBe("true");
		expect(toggleButton().textContent).toContain("saved");
	});

	it("saves the variant on click and shows the confirmation", async () => {
		addWishlistItem.mockResolvedValue({ success: true });
		await act(async () =>
			root.render(createElement(WishlistToggle, { variantId: "variant-1", initiallySaved: false })),
		);

		await act(async () => toggleButton().click());
		await flush();

		expect(addWishlistItem).toHaveBeenCalledWith("variant-1");
		expect(toggleButton().getAttribute("aria-pressed")).toBe("true");
		expect(container.querySelector('[role="status"]')?.textContent).toBe("savedNotice");
	});

	it("removes the variant on click when it is already saved", async () => {
		removeWishlistItem.mockResolvedValue({ success: true });
		await act(async () =>
			root.render(createElement(WishlistToggle, { variantId: "variant-1", initiallySaved: true })),
		);

		await act(async () => toggleButton().click());
		await flush();

		expect(removeWishlistItem).toHaveBeenCalledWith("variant-1");
		expect(toggleButton().getAttribute("aria-pressed")).toBe("false");
		expect(container.querySelector('[role="status"]')).toBeNull();
	});

	it("shows an error and keeps the previous state when the call fails", async () => {
		addWishlistItem.mockResolvedValue({ success: false, reason: "failed" });
		await act(async () =>
			root.render(createElement(WishlistToggle, { variantId: "variant-1", initiallySaved: false })),
		);

		await act(async () => toggleButton().click());
		await flush();

		expect(toggleButton().getAttribute("aria-pressed")).toBe("false");
		expect(container.querySelector('[role="alert"]')?.textContent).toBe("updateFailed");
	});
});
