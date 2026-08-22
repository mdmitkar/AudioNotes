import mongoose, { Document, Schema } from 'mongoose';

export interface ITopic extends Document {
  subjectId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  order: number;
  createdAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TopicSchema.index({ subjectId: 1, slug: 1 }, { unique: true });

export default mongoose.model<ITopic>('Topic', TopicSchema);
