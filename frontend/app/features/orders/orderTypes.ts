export interface OrderItem {
  id?: string;
  order_id?: string;
  cake_id: string;
  qty: number;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cake {
  id: string;
  cake_name: string;
  price: number;
  image: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  order_no: number;
  customer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items: Array<OrderItem & { cake: Cake }>;
}
