import StatusCodes from "@/config/status-codes";
import { WorkExperienceModel } from "@/db/schema/experience/experience.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { HTTPException } from "hono/http-exception";

export const getAllExperiences = factory.createHandlers(async (c) => {
  try {
    const experiences = await WorkExperienceModel.find();
    return c.json(
      {
        message: "Fetched experiences  successfully",
        experiences,
      },
      StatusCodes.HTTP_201_CREATED,
    );
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }

    logger.error("Error while fetching work experiences", {
      module: "work",
      action: "work:fetch:error",
      error: err instanceof Error ? err.message : String(err),
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Failed to fetch experiences",
    });
  }
});
