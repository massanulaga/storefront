"use server";

import { WishlistItemAddDocument, WishlistItemRemoveDocument } from "@/gql/graphql";
import { mutate } from "@/lib/saleor";
import { getAccountAuthState } from "../get-current-user";

export type WishlistActionResult = { success: true } | { success: false; reason: "signedOut" | "failed" };

async function requireSignedIn(): Promise<WishlistActionResult | null> {
	const auth = await getAccountAuthState();
	return auth.status === "authenticated" ? null : { success: false, reason: "signedOut" };
}

export async function addWishlistItem(variantId: string): Promise<WishlistActionResult> {
	const signedOut = await requireSignedIn();
	if (signedOut) return signedOut;

	const result = await mutate(WishlistItemAddDocument, { variables: { variantId } });
	if (!result.ok || result.data?.wishlistItemAdd?.errors?.length) {
		return { success: false, reason: "failed" };
	}
	return { success: true };
}

export async function removeWishlistItem(variantId: string): Promise<WishlistActionResult> {
	const signedOut = await requireSignedIn();
	if (signedOut) return signedOut;

	const result = await mutate(WishlistItemRemoveDocument, { variables: { variantId } });
	if (!result.ok || result.data?.wishlistItemRemove?.errors?.length) {
		return { success: false, reason: "failed" };
	}
	return { success: true };
}
