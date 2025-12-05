import StatusCodes from "@/config/status-codes";
import { EducationModel } from "@/db/schema/education/education.db";
import { factory } from "@/lib/factory";
import { logger } from "@/lib/logger";
import { customZValidator } from "@/middlewares/custom-z-validator";
import { getNextOrder } from "@/utils/getNextOrder";
import { HTTPException } from "hono/http-exception";
import z from "zod";

export const addEducation = factory.createHandlers(
  customZValidator(
    "json",
    z.object({
      institute: z.string(),
      logo: z.string().optional(),
      location: z.string(),
      degree: z.string(),
      startDate: z.iso.date(),
      endDate: z.iso.date().nullable(),
      isCurrent: z.boolean(),
    }),
  ),
  async (c) => {
    try {
      const { institute, logo, degree, startDate, endDate, isCurrent, location } =
        c.req.valid("json");

      const sortOrder = await getNextOrder("education");
      const res = await EducationModel.create({
        institute,
        logo,
        location,
        startDate,
        degree,
        endDate: isCurrent ? null : endDate,
        sortOrder,
      });

      return c.json(
        {
          message: "Education added successfully",
          data: res,
        },
        StatusCodes.HTTP_201_CREATED,
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }

      logger.error("Error adding education", {
        module: "education",
        action: "education:create:error",
        error: err instanceof Error ? err.message : String(err),
      });

      throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
        message: "Failed to add new education",
      });
    }
  },
);
