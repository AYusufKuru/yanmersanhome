export type CartViewLine = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  imageAlt: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
  available: boolean;
};

export type CartView = {
  lines: CartViewLine[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  count: number;
  couponCode: string | null;
  couponMessage: string | null;
};

export const emptyCart: CartView = {
  lines: [],
  subtotal: 0,
  discount: 0,
  shippingFee: 0,
  total: 0,
  count: 0,
  couponCode: null,
  couponMessage: null,
};
