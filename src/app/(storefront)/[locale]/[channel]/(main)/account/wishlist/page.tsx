import { Suspense, type ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { getCurrentUserWishlist } from "@/lib/account/get-wishlist";
import { AccountOrdersListSkeleton } from "@/ui/components/account/account-skeleton";
import { WishlistEmpty, WishlistList, type WishlistRow } from "@/ui/components/account/wishlist-list";

type Props = {
	params: Promise<{ locale: string }>;
};

export default function AccountWishlistPage({ params }: Props) {
	return (
		<Suspense fallback={<AccountOrdersListSkeleton />}>
			<AccountWishlistContent params={params} />
		</Suspense>
	);
}

async function AccountWishlistContent({ params }: Props) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "account.wishlist" });
	const tErrors = await getTranslations({ locale, namespace: "account.errors" });

	const result = await getCurrentUserWishlist();

	if (result.status === "signed-out") {
		return (
			<WishlistPageFrame title={t("title")}>
				<WishlistEmpty title={t("title")} message={t("signInRequired")} />
			</WishlistPageFrame>
		);
	}

	if (result.status === "error") {
		return (
			<WishlistPageFrame title={t("title")}>
				<WishlistEmpty title={t("title")} message={tErrors("loadWishlistFailed")} />
			</WishlistPageFrame>
		);
	}

	const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
	const rows: WishlistRow[] = result.items.map((item) => ({
		id: item.id,
		name: item.variant.product.name,
		variantName: item.variant.name || null,
		variantId: item.variant.id,
		productSlug: item.variant.product.slug,
		savedOn: dateFormatter.format(new Date(item.createdAt)),
	}));

	return (
		<WishlistPageFrame title={t("title")}>
			{rows.length === 0 ? (
				<WishlistEmpty title={t("empty")} message={t("emptyHint")} />
			) : (
				<WishlistList items={rows} />
			)}
		</WishlistPageFrame>
	);
}

function WishlistPageFrame({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="space-y-6">
			<h1 className="text-balance text-h1">{title}</h1>
			{children}
		</div>
	);
}
