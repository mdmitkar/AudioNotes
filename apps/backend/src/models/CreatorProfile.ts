import mongoose, { Document, Schema } from 'mongoose';

export interface ICreatorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  expertise: string[];
  examIds: mongoose.Types.ObjectId[];
  followerCount: number;
  totalListeningMinutes: number;
  isVerified: boolean;
  createdAt: Date;
}

const CreatorProfileSchema = new Schema<ICreatorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '' },
    expertise: [{ type: String }],
    examIds: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
    followerCount: { type: Number, default: 0 },
    totalListeningMinutes: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ICreatorProfile>('CreatorProfile', CreatorProfileSchema);
