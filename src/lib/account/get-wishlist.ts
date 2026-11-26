import "server-only";

import { WishlistItemsDocument } from "@/gql/graphql";
import { sessionQuery } from "@/lib/saleor";
import { hasAuthSession } from "@/lib/auth/has-auth-session";

/** Live, per-request wishlist of the signed-in customer. Never shared-cached. */
export async function getCurrentUserWishlist() {
	if (!(await hasAuthSession())) {
		return { status: "signed-out" as const };
	}

	const result = await sessionQuery(WishlistItemsDocument);

	if (!result.ok) {
		return { status: "error" as const };
	}

	return { status: "ok" as const, items: result.data.wishlist };
}

/** Variant IDs the signed-in customer has saved. Null when the read fails. */
export async function getSavedVariantIds(): Promise<string[] | null> {
	const wishlist = await getCurrentUserWishlist();
	if (wishlist.status !== "ok") return null;
	return wishlist.items.map((item) => item.variant.id);
}
