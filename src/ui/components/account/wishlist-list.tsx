"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { removeWishlistItem } from "@/app/(storefront)/[locale]/[channel]/(main)/account/wishlist/actions";
import { SaleorImage } from "@/ui/atoms/saleor-image";
import { LinkWithChannel } from "@/ui/atoms/link-with-channel";
import { Button } from "@/ui/components/ui/button";

export interface WishlistEntry {
	variantId: string;
	variantName: string;
	productName: string;
	productSlug: string;
	thumbnail: { url: string; alt?: string | null } | null;
}

export function WishlistList({ items: initialItems }: { items: WishlistEntry[] }) {
	const t = useTranslations("account.wishlist");
	const [items, setItems] = useState(initialItems);
	const [notice, setNotice] = useState(false);
	const [error, setError] = useState(false);
	const [pendingVariantId, setPendingVariantId] = useState<string | null>(null);
	const [, startTransition] = useTransition();

	const remove = (variantId: string) => {
		setPendingVariantId(variantId);
		startTransition(async () => {
			const result = await removeWishlistItem(variantId);
			setPendingVariantId(null);
			if (result.success) {
				setItems((current) => current.filter((item) => item.variantId !== variantId));
				setError(false);
				setNotice(true);
			} else {
				setError(true);
				setNotice(false);
			}
		});
	};

	if (items.length === 0) {
		return (
			<p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">{t("empty")}</p>
		);
	}

	return (
		<div className="space-y-4">
			{notice && (
				<p role="status" className="text-sm text-muted-foreground">
					{t("removedNotice")}
				</p>
			)}
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{t("updateFailed")}
				</p>
			)}
			<ul className="divide-y rounded-lg border">
				{items.map((item) => (
					<li key={item.variantId} className="flex items-center gap-4 p-4">
						<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
							{item.thumbnail && (
								<SaleorImage
									src={item.thumbnail.url}
									alt={item.thumbnail.alt ?? ""}
									sizes="64px"
									className="object-cover"
								/>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<LinkWithChannel
								href={`/products/${item.productSlug}`}
								className="block truncate font-medium hover:underline"
							>
								{item.productName}
							</LinkWithChannel>
							{item.variantName !== item.productName && (
								<p className="truncate text-sm text-muted-foreground">{item.variantName}</p>
							)}
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							disabled={pendingVariantId !== null}
							onClick={() => remove(item.variantId)}
						>
							{t("remove")}
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
}
