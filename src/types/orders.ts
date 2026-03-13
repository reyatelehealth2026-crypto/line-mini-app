export interface OdooOrder {
  id: number
  order_id: number
  order_name: string
  partner_id: number | null
  customer_ref: string | null
  line_user_id: string | null
  salesperson_name: string | null
  state: string | null
  state_display: string | null
  payment_status: string | null
  delivery_status: string | null
  amount_total: number | null
  amount_tax: number | null
  amount_untaxed: number | null
  currency: string | null
  date_order: string | null
  expected_delivery: string | null
  payment_date: string | null
  items_count: number
  is_paid: boolean
  is_delivered: boolean
  latest_event: string | null
  synced_at: string | null
  updated_at: string | null
}

export interface OdooOrdersResponse {
  success: boolean
  orders: OdooOrder[]
  total: number
  source: string
  limit: number
  offset: number
}

export type OrderStateDisplay = 'draft' | 'sent' | 'sale' | 'done' | 'cancel'
