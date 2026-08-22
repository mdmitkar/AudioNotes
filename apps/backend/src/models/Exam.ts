import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '??' },
    color: { type: String, default: '#10B981' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>('Exam', ExamSchema);
