import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Make sure these env variables exist on the server
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay key_id or key_secret is missing in env");
}

// Use `any` to avoid TS type issues
const razorpay: any = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, noteId } = await req.json();

    if (!amount || !noteId) {
      return NextResponse.json(
        { error: "Amount and noteId are required" },
        { status: 400 }
      );
    }

    const options = {
      amount: amount * 100, // convert INR to paise
      currency: "INR",
      payment_capture: 1,
      notes: { noteId },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Razorpay create order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
