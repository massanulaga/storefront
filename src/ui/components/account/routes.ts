export const accountRoutes = {
	overview: "/account",
	orders: "/account/orders",
	orderDetail: (number: string) => `/account/orders/${number}`,
	wishlist: "/account/wishlist",
	addresses: "/account/addresses",
	settings: "/account/settings",
} as const;
