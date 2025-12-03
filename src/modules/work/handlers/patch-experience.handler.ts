import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/experience/experience.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const updateExperienceById = factory.createHandlers(
  customZValidator("param", z.object({ id: z.string() })),
  customZValidator(
    "json",
    z
      .object({
        company: z.string().optional(),
        logo: z.string().optional(),
        location: z.string().optional(),
        website: z.string().optional(),
        role: z.string().optional(),
        startDate: z.iso.date().optional(),
        endDate: z.iso.date().nullable().optional(),
        isCurrent: z.boolean().optional(),
        workType: z.string().optional(),
        technologies: z.array(z.string()).optional().default([]),
        responsibilities: z.array(z.string()).optional().default([]),
      })
      .refine(
        (data) => {
          // Remove fields that are empty, undefined, or default empty arrays
          const meaningfulFields = [
            data.company,
            data.logo,
            data.location,
            data.website,
            data.role,
            data.workType,
            data.startDate,
            data.endDate,
            data.isCurrent,
            data.technologies?.length ? data.technologies : null,
            data.responsibilities?.length ? data.responsibilities : null,
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
      const {
        company,
        logo,
        location,
        website,
        role,
        startDate,
        endDate,
        workType,
        isCurrent,
        technologies,
        responsibilities,
      } = c.req.valid("json");

      const experience = await WorkExperienceModel.findById(id);
      if (!experience) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: "resource not found",
        });
      }

      const updateFields: Partial<{
        company: string;
        logo: string;
        location: string;
        website: string;
        role: string;
        startDate: Date;
        endDate: Date | null;
        isCurrent: boolean;
        workType: string;
        technologies: string[];
        responsibilities: string[];
      }> = {};

      if (company) updateFields.company = company;
      if (logo) updateFields.logo = logo;
      if (location) updateFields.location = location;
      if (website) updateFields.website = website;
      if (role) updateFields.role = role;
      if (startDate) updateFields.startDate = new Date(startDate);
      if (endDate !== undefined) updateFields.endDate = endDate ? new Date(endDate) : null;
      if (isCurrent) updateFields.endDate = null;
      if (workType) updateFields.workType = workType;
      if (technologies) updateFields.technologies = technologies;
      if (responsibilities) updateFields.responsibilities = responsibilities;

      const res = await WorkExperienceModel.findByIdAndUpdate({ _id: id }, updateFields, {
        new: true,
      });

      return c.json(
        {
          message: "Work experience updated successfully",
          data: res,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

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
