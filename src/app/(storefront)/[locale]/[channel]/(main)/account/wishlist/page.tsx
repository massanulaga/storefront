import { getTranslations } from "next-intl/server";
import { getCurrentUserWishlist } from "@/lib/account/get-wishlist";
import { WishlistList, type WishlistEntry } from "@/ui/components/account/wishlist-list";

export default async function WishlistPage() {
	const t = await getTranslations("account.wishlist");
	const result = await getCurrentUserWishlist();

	const items: WishlistEntry[] =
		result.ok && result.data
			? result.data.wishlist.map((item) => ({
					variantId: item.variant.id,
					variantName: item.variant.name ?? item.product.name,
					productName: item.product.name,
					productSlug: item.product.slug,
					thumbnail: item.product.thumbnail ?? null,
				}))
			: [];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-balance text-h1">{t("title")}</h1>
				<p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
			</div>
			{result.ok ? (
				<WishlistList items={items} />
			) : (
				<p role="alert" className="text-sm text-destructive">
					{t("updateFailed")}
				</p>
			)}
		</div>
	);
}
