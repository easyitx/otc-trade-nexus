
export type Profile = {
  id: string;
  full_name: string | null;
  company: string | null;
  telegram_id: string | null;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
};

export type Order = {
  id: string;
  user_id: string;
  type: 'BUY' | 'SELL';
  amount: number;
  amount_currency?: string;
  rate: string;
  rate_details?: {
    type: "dynamic" | "fixed";
    source?: string;
    value?: string;
    adjustment?: number;
    serviceFee: number;
  };
  purpose: string | null;
  notes: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'ARCHIVED';
  expires_at: string;
  created_at: string;
  updated_at: string;
  geography?: {
    country?: string;
    city?: string;
  };
};
