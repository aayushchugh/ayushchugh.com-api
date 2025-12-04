import mongoose, { Schema } from "mongoose";
import type { InferSchemaType } from "mongoose";

const volunteerSchema = new Schema(
  {
    organization: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
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
    responsibilities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type VolunteerSchemaType = InferSchemaType<typeof volunteerSchema>;

export const VolunteerModel =
  mongoose.models.volunteer || mongoose.model("volunteer", volunteerSchema);
