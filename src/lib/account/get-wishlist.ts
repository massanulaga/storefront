import "server-only";

import { WishlistItemsDocument } from "@/gql/graphql";
import { sessionQuery } from "@/lib/saleor";

/** Live, per-request wishlist of the signed-in customer. Never shared-cached. */
export function getCurrentUserWishlist() {
	return sessionQuery(WishlistItemsDocument);
}

/** Variant IDs the signed-in customer has saved. Null when the read fails. */
export async function getSavedVariantIds(): Promise<string[] | null> {
	const result = await getCurrentUserWishlist();
	if (!result.ok) return null;
	return result.data?.wishlist.map((item) => item.variant.id) ?? [];
}
