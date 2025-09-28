import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Ensure env variables exist
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay key_id or key_secret is missing in env");
}

// Minimal custom types for Razorpay order
interface RazorpayOrderOptions {
  amount: number;
  currency: string;
  payment_capture: number;
  notes?: Record<string, string>;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  created_at?: number;
  notes?: Record<string, string>;
}

// Proper callback types
interface RazorpayError {
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata?: Record<string, string>;
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Wrap callback API in a Promise
function createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
  return new Promise((resolve, reject) => {
    (razorpay.orders.create as unknown as (
      options: RazorpayOrderOptions,
      callback: (err: RazorpayError | null, order?: RazorpayOrder) => void
    ) => void)(options, (err, order) => {
      if (err) return reject(err);
      if (!order) return reject(new Error("Order creation failed"));
      resolve(order);
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { amount, noteId } = await req.json();

    if (!amount || !noteId) {
      return NextResponse.json(
        { error: "Amount and noteId are required" },
        { status: 400 }
      );
    }

    const options: RazorpayOrderOptions = {
      amount: amount * 100, // convert INR to paise
      currency: "INR",
      payment_capture: 1,
      notes: { noteId },
    };

    const order = await createOrder(options);

    return NextResponse.json(order);
  } catch (err: unknown) {
    console.error("Razorpay create order error:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
