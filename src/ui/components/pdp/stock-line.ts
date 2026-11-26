export type StockLineReason = "no-selection" | "out-of-stock";

export type StockLineState = "in-stock" | "out-of-stock" | null;

export function getStockLineState({
	disabled,
	disabledReason,
}: {
	disabled: boolean;
	disabledReason?: StockLineReason;
}): StockLineState {
	if (!disabled) return "in-stock";
	if (disabledReason === "out-of-stock") return "out-of-stock";
	return null;
}
