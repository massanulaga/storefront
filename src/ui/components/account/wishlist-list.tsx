"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { addVariantToCart } from "@/app/actions";
import { bumpChromeVersion } from "@/lib/chrome-sync";
import { LinkWithChannel } from "@/ui/atoms/link-with-channel";
import { Button } from "@/ui/components/ui/button";
import { removeWishlistItem } from "@/app/(storefront)/[locale]/[channel]/(main)/account/actions";
import {
	resolveAccountActionError,
	type AccountActionResult,
} from "@/ui/components/account/account-action-result";

export type WishlistRow = {
	id: string;
	name: string;
	variantName: string | null;
	variantId: string;
	productSlug: string;
	savedOn: string;
};

export function WishlistList({ items }: { items: WishlistRow[] }) {
	const t = useTranslations("account.wishlist");
	const tAccount = useTranslations("account");
	const { locale, channel } = useParams<{ locale: string; channel: string }>();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const handleRemove = (variantId: string) => {
		setError(null);
		startTransition(async () => {
			const result: AccountActionResult = await removeWishlistItem(variantId);
			if (!result.success) {
				setError(resolveAccountActionError(tAccount, result));
			}
		});
	};

	const handleAddToCart = (variantId: string) => {
		setError(null);
		startTransition(async () => {
			await addVariantToCart({ channel, localeSlug: locale, variantId });
			bumpChromeVersion();
		});
	};

	return (
		<div className="space-y-4">
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}
			<ul className="divide-y rounded-lg border">
				{items.map((item) => (
					<li
						key={item.id}
						className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<div className="min-w-0">
							<LinkWithChannel href={`/products/${item.productSlug}`} className="font-medium hover:underline">
								{item.name}
							</LinkWithChannel>
							{item.variantName && <p className="text-sm text-muted-foreground">{item.variantName}</p>}
							<p className="text-xs text-muted-foreground">{t("savedOn", { date: item.savedOn })}</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline-solid"
								size="sm"
								disabled={isPending}
								onClick={() => handleAddToCart(item.variantId)}
							>
								<ShoppingBag className="mr-2 h-4 w-4" />
								{t("addToBag")}
							</Button>
							<Button
								variant="outline-solid"
								size="sm"
								disabled={isPending}
								onClick={() => handleRemove(item.variantId)}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								{t("remove")}
							</Button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

export function WishlistEmpty({ title, message }: { title: string; message: string }) {
	return (
		<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
			<Heart className="h-6 w-6 text-muted-foreground" />
			<p className="font-medium">{title}</p>
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	);
}
