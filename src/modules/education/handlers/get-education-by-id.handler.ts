import StatusCodes from "@/config/status-codes";
import { EducationModel } from "@/db/schema/education/education.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const getEducationById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (c) => {
    try {
      const { id } = c.req.valid("param");

      const education = await EducationModel.findById(id);

      // if education does not exists
      if (!education) {
        throw new HTTPException(404, {
          message: "Education not found",
        });
      }

      return c.json(
        {
          message: "Education fetched successfully",
          education,
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error fetching education", {
        module: "education",
        action: "education:fetch:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to fetch  education",
      });
    }
  },
);
