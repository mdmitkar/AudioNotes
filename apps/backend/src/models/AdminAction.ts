import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAction extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetType: 'user' | 'episode' | 'creator' | 'exam' | 'subject' | 'topic';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
}

const AdminActionSchema = new Schema<IAdminAction>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['user', 'episode', 'creator', 'exam', 'subject', 'topic'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IAdminAction>('AdminAction', AdminActionSchema);
