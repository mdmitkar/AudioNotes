import mongoose, { Document, Schema } from 'mongoose';

export type EpisodeStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface IEpisode extends Document {
  title: string;
  description: string;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  creatorId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  duration: number;
  isPremium: boolean;
  status: EpisodeStatus;
  playCount: number;
  featuredAt: Date | null;
  rejectionReason: string | null;
  whatYoullLearn: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    audioUrl: { type: String, default: null },
    thumbnailUrl: { type: String, default: null },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    duration: { type: Number, required: true, min: 0 },
    isPremium: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
    },
    playCount: { type: Number, default: 0 },
    featuredAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    whatYoullLearn: [{ type: String }],
    tags: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
  },
  { timestamps: true }
);

EpisodeSchema.index({ examId: 1, status: 1 });
EpisodeSchema.index({ subjectId: 1, status: 1 });
EpisodeSchema.index({ topicId: 1, status: 1 });
EpisodeSchema.index({ creatorId: 1 });
EpisodeSchema.index({ isPremium: 1, status: 1 });
EpisodeSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IEpisode>('Episode', EpisodeSchema);
