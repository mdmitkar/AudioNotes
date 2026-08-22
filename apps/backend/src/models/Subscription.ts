import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: 'free' | 'premium_monthly' | 'premium_yearly';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  expiresAt: Date | null;
  paymentProvider: string | null;
  paymentReference: string | null;
  createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['free', 'premium_monthly', 'premium_yearly'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired', 'cancelled'],
      default: 'inactive',
    },
    expiresAt: { type: Date, default: null },
    paymentProvider: { type: String, default: null },
    paymentReference: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
