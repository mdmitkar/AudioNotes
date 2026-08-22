import mongoose, { Document, Schema } from 'mongoose';

export interface IListeningProgress extends Document {
  userId: mongoose.Types.ObjectId;
  episodeId: mongoose.Types.ObjectId;
  progressSeconds: number;
  completed: boolean;
  lastPlayedAt: Date;
}

const ListeningProgressSchema = new Schema<IListeningProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    episodeId: { type: Schema.Types.ObjectId, ref: 'Episode', required: true },
    progressSeconds: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false },
    lastPlayedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ListeningProgressSchema.index({ userId: 1, episodeId: 1 }, { unique: true });
ListeningProgressSchema.index({ userId: 1, lastPlayedAt: -1 });

export default mongoose.model<IListeningProgress>('ListeningProgress', ListeningProgressSchema);
