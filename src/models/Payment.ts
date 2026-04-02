import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  gymId: mongoose.Types.ObjectId;
  amount: number;              // stored in cents (e.g. 8900 = $89.00)
  currency: string;
  method: 'stripe' | 'paystack' | 'cash';
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  paystackReference?: string;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  membershipId?: mongoose.Types.ObjectId;
  invoiceNumber: string;       // auto-generated: INV-YYYY-XXXX
  createdAt: Date;
}

// ─── Invoice Number Counter ───────────────────────────────────────────────────
// Keep a simple in-process counter per year. For production you'd use a
// dedicated sequence collection, but this works reliably for a single-instance app.
let lastYear = new Date().getFullYear();
let counter  = 0;

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  if (year !== lastYear) {
    lastYear = year;
    counter  = 0;
  }
  counter += 1;
  const seq = String(counter).padStart(4, '0');
  return `INV-${year}-${seq}`;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const PaymentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gymId: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    amount: {
      type: Number,
      required: true,   // stored in cents
    },
    currency: {
      type: String,
      default: 'usd',
    },
    method: {
      type: String,
      enum: ['stripe', 'paystack', 'cash'],
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeSessionId: {
      type: String,
    },
    paystackReference: {
      type: String,
    },
    description: {
      type: String,
      required: true,
      default: 'Membership Payment',
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'pending',
    },
    membershipId: {
      type: Schema.Types.ObjectId,
      ref: 'Membership',
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Auto-generate invoice number before save ─────────────────────────────────
PaymentSchema.pre('save', function (this: any, next: any) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = generateInvoiceNumber();
  }
  next();
});

// ─── Also handle insertMany / create (which bypasses 'save' hooks) ────────────
// We attach a pre-validate hook so mongoose.create([...]) also gets numbers.
PaymentSchema.pre('validate', function (this: any, next: any) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = generateInvoiceNumber();
  }
  next();
});

export default mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);
