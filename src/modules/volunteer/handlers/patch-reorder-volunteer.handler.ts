import StatusCodes from "@/config/status-codes";
import { VolunteerModel } from "@/db/schema/volunteer/volunteer.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { HTTPException } from "hono/http-exception";
import z from "zod";

const reorderSchema = z.object({
  list: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int().nonnegative(),
    }),
  ),
});

export const reorderVolunteer = factory.createHandlers(
  customZValidator("json", reorderSchema),

  async (c) => {
    try {
      const { list } = c.req.valid("json");

      const bulkOps = list.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { sortOrder: item.sortOrder } },
        },
      }));

      await VolunteerModel.bulkWrite(bulkOps);

      return c.json({ message: "Volunteer experience successfully" }, StatusCodes.HTTP_200_OK);
    } catch (err) {
      if (err instanceof HTTPException) throw err;

      logger.error("Error reordering Volunteer", {
        module: "volunteer",
        action: "volunteer:reorder:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to reorder volunteer experience",
      });
    }
  },
);
