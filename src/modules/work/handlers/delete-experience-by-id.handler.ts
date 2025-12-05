import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/work/work.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const deleteExperienceById = factory.createHandlers(
  customZValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),

  async (c) => {
    try {
      const { id } = c.req.valid("param");

      const experience = await WorkExperienceModel.findById(id);
      if (!experience) {
        throw new HTTPException(StatusCodes.HTTP_404_NOT_FOUND, {
          message: "Experience not found",
        });
      }

      const deletedOrder = experience.sortOrder;

      await WorkExperienceModel.findByIdAndDelete(id);

      await WorkExperienceModel.updateMany(
        { sortOrder: { $gt: deletedOrder } },
        { $inc: { sortOrder: -1 } },
      );

      return c.json(
        {
          message: "work expirence deleted successfully",
        },
        StatusCodes.HTTP_200_OK,
      );
    } catch (err) {
      if (err instanceof HTTPException) throw err;

      logger.error("Error while deleting work experience", {
        module: "work",
        action: "work:delete:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to delete work exp",
      });
    }
  },
);
