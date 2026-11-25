"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { removeWishlistItem } from "@/app/(storefront)/[locale]/[channel]/(main)/account/actions";
import { addWishlistItem } from "@/app/(storefront)/[locale]/[channel]/(main)/account/wishlist/actions";
import { Button } from "@/ui/components/ui/button";

interface WishlistToggleProps {
	variantId: string;
	initiallySaved: boolean;
}

export function WishlistToggle({ variantId, initiallySaved }: WishlistToggleProps) {
	const t = useTranslations("pdp.wishlist");
	const [saved, setSaved] = useState(initiallySaved);
	const [error, setError] = useState(false);
	const [notice, setNotice] = useState(false);
	const [pending, startTransition] = useTransition();

	const toggle = () => {
		const nextSaved = !saved;
		startTransition(async () => {
			const result = nextSaved ? await addWishlistItem(variantId) : await removeWishlistItem(variantId);
			if (result.success) {
				setSaved(nextSaved);
				setError(false);
				setNotice(nextSaved);
			} else {
				setError(true);
				setNotice(false);
			}
		});
	};

	return (
		<div className="space-y-2">
			<Button
				type="button"
				variant="outline-solid"
				size="lg"
				aria-pressed={saved}
				disabled={pending}
				onClick={toggle}
				className="h-14 w-full text-base font-medium"
			>
				<Heart className="mr-2 h-5 w-5" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
				{saved ? t("saved") : t("save")}
			</Button>
			{notice && (
				<p role="status" className="text-sm text-muted-foreground">
					{t("savedNotice")}
				</p>
			)}
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{t("updateFailed")}
				</p>
			)}
		</div>
	);
}
