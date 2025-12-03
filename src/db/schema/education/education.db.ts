import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const educationSchema = new Schema(
  {
    institution: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
    degree: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export type EducationSchemaType = InferSchemaType<typeof educationSchema>;

export const EducationModel =
  mongoose.models.education || mongoose.model("education", educationSchema);
