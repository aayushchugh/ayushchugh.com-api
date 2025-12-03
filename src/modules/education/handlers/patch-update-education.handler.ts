import StatusCodes from "@/config/status-codes";
import { EducationModel } from "@/db/schema/education/education.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const updateEducationById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  customZValidator(
    "json",
    z
      .object({
        institute: z.string().optional(),
        logo: z.string().optional(),
        location: z.string().optional(),
        degree: z.string().optional(),
        startDate: z.iso.date().optional(),
        endDate: z.iso.date().nullable().optional(),
        isCurrent: z.boolean().optional(),
      })
      .refine(
        (data) => {
          // Remove fields that are empty, undefined, or default empty arrays
          const meaningfulFields = [
            data.institute,
            data.logo,
            data.location,
            data.degree,
            data.startDate,
            data.endDate,
            data.isCurrent,
          ];

          return meaningfulFields.some((v) => v !== undefined && v !== null);
        },
        {
          message: "At least one field must be provided to update experience",
        },
      )
      .refine(
        (data) => {
          // If isCurrent is explicitly set to false, endDate must be provided
          if (data.isCurrent === false && !data.endDate) {
            return false;
          }
          return true;
        },
        {
          message: "End date must be provided when isCurrent is false",
        },
      ),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const { institute, logo, degree, startDate, endDate, isCurrent, location } =
        c.req.valid("json");

      await EducationModel.findByIdAndUpdate(
        { _id: id },
        {
          institute,
          logo,
          location,
          startDate,
          degree,
          endDate: isCurrent ? null : endDate,
        },
      );

      return c.json(
        {
          message: "Education updated successfully",
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error updating education", {
        module: "education",
        action: "education:update:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to update education",
      });
    }
  },
);
