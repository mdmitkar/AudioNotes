import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  examId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '??' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SubjectSchema.index({ examId: 1, slug: 1 }, { unique: true });

export default mongoose.model<ISubject>('Subject', SubjectSchema);
