import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/work/work.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import mongoose from "mongoose";
import z from "zod";

export const getPositionExperienceById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      positionId: z.string(),
    }),
  ),

  async (c) => {
    try {
      const { positionId } = c.req.valid("param");

      const result = await WorkExperienceModel.aggregate([
        {
          $match: {
            "positions._id": new mongoose.Types.ObjectId(positionId),
          },
        },
        {
          $unwind: "$positions",
        },
        {
          $match: {
            "positions._id": new mongoose.Types.ObjectId(positionId),
          },
        },
        {
          $project: {
            _id: 0,
            position: "$positions",
          },
        },
      ]);

      if (!result || result.length === 0) {
        throw new HTTPException(404, {
          message: "Position not found",
        });
      }

      return c.json(
        {
          message: "Position fetched",
          position: result[0].position,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) throw err;

      logger.error("Error while fetching work Experience", {
        module: "work",
        action: "work:fetch:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to fetch experience",
      });
    }
  },
);
