import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/work/work.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const updateExperienceById = factory.createHandlers(
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
        company: z.string().optional(),
        logo: z.string().optional(),
        location: z.string().optional(),
        website: z.string().optional(),
      })
      .refine(
        (data) => {
          const meaningful = [data.company, data.logo, data.location, data.website];
          return meaningful.some((v) => v !== undefined && v !== null);
        },
        { message: "At least one field must be provided to update experience" },
      ),
  ),

  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const updates = c.req.valid("json");

      const experience = await WorkExperienceModel.findById(id);

      if (!experience) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: "Work Experience not found",
        });
      }

      if (updates.company) experience.company = updates.company;
      if (updates.logo) experience.logo = updates.logo;
      if (updates.location) experience.location = updates.location;
      if (updates.website) experience.website = updates.website;

      await experience.save();

      return c.json(
        {
          message: "Work experience updated successfully",
          experience: {
            company: experience.company,
            logo: experience.logo,
            location: experience.location,
            website: experience.website,
          },
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) throw err;

      logger.error("Error updating work experience", {
        module: "work",
        action: "work:update:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to update work experience",
      });
    }
  },
);
