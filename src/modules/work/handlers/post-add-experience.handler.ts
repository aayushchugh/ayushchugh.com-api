import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/experience/experience.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const ZodExperienceType = z.enum(["work", "education", "volunteering"]);

export const addExperience = factory.createHandlers(
  customZValidator(
    "json",
    z.object({
      company: z
        .string()
        .min(3, { message: "Company Name must be at least 3 characters" })
        .max(50, { message: "Company Name cannot exceed 50 characters" }),
      logo: z
        .string()
        .min(3, "Logo must be at least 3 characters")
        .max(30, "Logo cannot exceed 30 characters"),
      location: z
        .string()
        .min(3, "Location must be at least 3 characters")
        .max(50, "Location cannot exceed 50 characters"),
      website: z
        .string()
        .min(3, "Website must be at least 3 characters")
        .max(50, "Website cannot exceed 50 characters"),
      role: z
        .string()
        .min(3, "Role must be at least 3 characters")
        .max(50, "Role cannot exceed 50 characters"),
      startDate: z.iso.date(),

      endDate: z.iso.date().nullable(),

      isCurrent: z.boolean(),
      workType: z
        .string()
        .min(3, "WorkType must be at least 3 characters")
        .max(50, "WorkType cannot exceed 50 characters"),

      technologies: z.array(z.string()).optional().default([]),
      responsibilities: z.array(z.string()).optional().default([]),
    }),
  ),
  async (c) => {
    try {
      const {
        company,
        logo,
        website,
        role,
        location,
        technologies,
        workType,
        responsibilities,
        startDate,
        endDate,
        isCurrent,
      } = c.req.valid("json");

      const res = await WorkExperienceModel.create({
        company,
        logo,
        location,
        website,
        role,
        startDate: new Date(startDate),
        endDate: isCurrent ? null : endDate ? new Date(endDate) : null,
        workType,
        technologies,
        responsibilities,
      });

      return c.json(
        {
          message: "Workd Experience added successfully",
          data: res,
        },
        StatusCodes.HTTP_201_CREATED,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error add new work experience", {
        module: "work",
        action: "work:create:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to add new work experience",
      });
    }
  },
);
