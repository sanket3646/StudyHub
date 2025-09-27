declare module "razorpay" {
  type OrderOptions = {
    amount: number;
    currency: string;
    payment_capture: 0 | 1;
    receipt?: string;
    notes?: Record<string, string>;
  };

  type Order = {
    id: string;
    currency: string;
    amount: number;
    amount_paid: number;
    status: string;
    receipt?: string;
  };

  class Razorpay {
    constructor(options: { key_id: string; key_secret: string });
    orders: {
      create(options: OrderOptions): Promise<Order>;
    };
  }

  export = Razorpay;
}
