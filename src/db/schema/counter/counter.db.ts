import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const counterSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export type CounterSchemaType = InferSchemaType<typeof counterSchema>;

export const CounterModel = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
