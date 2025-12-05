import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/work/work.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import mongoose from "mongoose";
import z from "zod";

export const updatePositionExperienceById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      positionId: z.string(),
    }),
  ),

  customZValidator(
    "json",
    z
      .object({
        role: z.string().optional(),
        startDate: z.iso.date().optional(),
        endDate: z.iso.date().nullable().optional(),
        isCurrent: z.boolean().optional(),
        workType: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        responsibilities: z.array(z.string()).optional(),
      })
      .refine(
        (data) => {
          const meaningful = [
            data.role,
            data.workType,
            data.startDate,
            data.endDate,
            data.isCurrent,
            data.technologies?.length ? data.technologies : null,
            data.responsibilities?.length ? data.responsibilities : null,
          ];
          return meaningful.some((v) => v !== undefined && v !== null);
        },
        { message: "At least one field must be provided to update experience" },
      )
      .refine((data) => !(data.isCurrent === false && !data.endDate), {
        message: "End date must be provided when isCurrent is false",
      }),
  ),

  async (c) => {
    try {
      const { positionId } = c.req.valid("param");
      const updates = c.req.valid("json");

      const experience = await WorkExperienceModel.findOne({
        "positions._id": new mongoose.Types.ObjectId(positionId),
      });

      if (!experience) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: "Position not found",
        });
      }

      const position = experience.positions.id(positionId);
      if (!position) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: `Position with id ${positionId} does not exist`,
        });
      }

      if (updates.role) position.role = updates.role;
      if (updates.startDate) position.startDate = new Date(updates.startDate);

      if (updates.endDate !== undefined) {
        position.endDate = updates.endDate ? new Date(updates.endDate) : null;
      }

      if (updates.isCurrent === true) {
        position.endDate = null;
      }

      if (updates.workType) position.workType = updates.workType;
      if (updates.technologies) position.technologies = updates.technologies;
      if (updates.responsibilities) position.responsibilities = updates.responsibilities;

      await experience.save();

      return c.json(
        {
          message: "Work position updated successfully",
          position: position,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) throw err;

      logger.error("Error updating work position", {
        module: "work",
        action: "work:update:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to update work position",
      });
    }
  },
);
