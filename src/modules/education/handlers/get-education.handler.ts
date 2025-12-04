import StatusCodes from "@/config/status-codes";
import { EducationModel } from "@/db/schema/education/education.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { HTTPException } from "hono/http-exception";

export const getEducation = factory.createHandlers(async (c) => {
  try {
    const educations = await EducationModel.find();
    return c.json(
      {
        message: "Education fetched successfully",
        educations,
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
});
