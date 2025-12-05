/**
 * Shared code between client and server
 * API configuration and utilities
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DemoResponse {
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller';
  profile_image?: string;
  bio?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  is_verified?: boolean;
  rating?: number;
  total_ratings?: number;
  verification_status?: "pending" | "approved" | "rejected";
}

export interface Product {
  id: number;
  seller_id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  quantity_available: number;
  unit?: string;
  image_url?: string;
  harvest_date?: string;
  expiry_date?: string;
  quality_grade?: 'A' | 'B' | 'C';
  is_organic?: boolean;
  origin_location?: string;
  rating?: number;
  total_ratings?: number;
  total_sold?: number;
  is_active?: boolean;
  business_name?: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image_url?: string;
}

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  seller_id?: number;
  total_amount: number;
  discount_amount: number;
  voucher_code?: string;
  shipping_address: string;
  shipping_method?: string;
  tracking_number?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}
export interface FarmerVerification {
  id?: number;
  user_id: number;
  farmer_card_number: string;
  farmer_card_name: string;
  organization_name: string;
  organization_id: string;
  status?: "pending" | "approved" | "rejected";
  created_at?: string;
}


export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  is_active: boolean;
}

export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount_amount?: number;
  minimum_purchase_amount?: number;
  usage_limit?: number;
  used_count?: number;
  per_user_limit?: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
}

export interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  buyer_id: number;
  full_name?: string;
  is_verified_purchase?: boolean;
  created_at?: string;
}

// API Helper Functions
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}/api/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  return data;
}

export async function apiLogin(email: string, password: string): Promise<ApiResponse<User>> {
  return apiCall<User>('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(
  full_name: string,
  email: string,
  password: string,
  phone: string,
  role: 'buyer' | 'seller' = 'buyer',
  business_name?: string
): Promise<ApiResponse<User>> {
  return apiCall<User>('auth/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name,
      email,
      password,
      phone,
      role,
      business_name,
    }),
  });
}

export async function apiGetProducts(
  category?: string,
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ products: Product[]; page: number; limit: number }>> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  return apiCall(`products?${params.toString()}`);
}

export async function apiGetProduct(id: number): Promise<ApiResponse<Product>> {
  return apiCall(`products/${id}`);
}

export async function apiGetCart(userId: number): Promise<ApiResponse<CartItem[]>> {
  return apiCall(`cart?user_id=${userId}`);
}

export async function apiAddToCart(
  userId: number,
  productId: number,
  quantity: number
): Promise<ApiResponse> {
  return apiCall('cart', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, product_id: productId, quantity }),
  });
}

export async function apiRemoveFromCart(cartItemId: number): Promise<ApiResponse> {
  return apiCall(`cart/${cartItemId}`, {
    method: 'DELETE',
  });
}

export async function apiGetOrders(userId: number): Promise<ApiResponse<Order[]>> {
  return apiCall(`orders?buyer_id=${userId}`);
}

export async function apiGetOrder(orderId: number): Promise<ApiResponse<Order>> {
  return apiCall(`orders/${orderId}`);
}

export async function apiCreateOrder(
  buyerId: number,
  items: Array<{ product_id: number; quantity: number }>,
  shippingAddress: string,
  voucherCode?: string,
  paymentMethod?: string,
  pointsUsed?: number
): Promise<ApiResponse<{ order_id: number; order_number: string; points_earned?: number; user_points?: number }>> {
  return apiCall('orders', {
    method: 'POST',
    body: JSON.stringify({
      buyer_id: buyerId,
      items,
      shipping_address: shippingAddress,
      voucher_code: voucherCode,
      payment_method: paymentMethod,
      points_used: pointsUsed || 0,
    }),
  });
}

export async function apiGetCategories(): Promise<ApiResponse<Category[]>> {
  return apiCall('categories');
}

export async function apiGetVouchers(): Promise<ApiResponse<Voucher[]>> {
  return apiCall('vouchers');
}

export async function apiValidateVoucher(code: string): Promise<ApiResponse<Voucher>> {
  return apiCall(`vouchers/validate?code=${encodeURIComponent(code)}`);
}

export async function apiGetProductReviews(productId: number): Promise<ApiResponse<Review[]>> {
  return apiCall(`reviews?product_id=${productId}`);
}

export async function apiCreateProductReview(
  productId: number,
  buyerId: number,
  rating: number,
  comment: string,
  title?: string,
  isVerifiedPurchase: boolean = false
): Promise<ApiResponse> {
  return apiCall('reviews', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      buyer_id: buyerId,
      rating,
      comment,
      title,
      is_verified_purchase: isVerifiedPurchase,
    }),
  });
}

export async function apiGetUser(userId: number): Promise<ApiResponse<User>> {
  return apiCall(`users/${userId}`);
}

export async function apiUpdateUser(userId: number, updates: Partial<User>): Promise<ApiResponse> {
  return apiCall(`users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function apiFarmerVerification(
  payload: FarmerVerification
): Promise<ApiResponse> {
  return apiCall("farmer-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
