import { Hono } from "hono";
import { addExperience } from "@/modules/work/handlers/post-add-experience.handler";
import { getAllExperiences } from "@/modules/work/handlers/get-experience.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { updatePositionExperienceById } from "@/modules/work/handlers/patch-experience.handler";
import { getExperienceById } from "@/modules/work/handlers/get-experience-by-id.handler";
import { deletePositionExperienceById } from "@/modules/work/handlers/delete-position-experience-by-id.handler";
import { getPositionExperienceById } from "@/modules/work/handlers/get-position-experience-by-id.handler";
import { deleteExperienceById } from "@/modules/work/handlers/delete-experience-by-id.handler";
import { updateExperienceById } from "@/modules/work/handlers/patch-experience-by-id.handler";

const workExperienceRoutes = new Hono();

// add experience
workExperienceRoutes.post("/create", authValidator, ...addExperience);
// get all expriences
workExperienceRoutes.get("/list", ...getAllExperiences);
// get experience by id but only the top level info
workExperienceRoutes.get("/:id", ...getExperienceById);
// get position experience by id but the position level info
workExperienceRoutes.get("/position/:positionId", ...getPositionExperienceById);
// delete experience by id
workExperienceRoutes.delete("/:id", authValidator, ...deleteExperienceById);
// delete position experience by id
workExperienceRoutes.delete(
  "/:id/position/:positionId",
  authValidator,
  ...deletePositionExperienceById,
);
// update experience meta data by id
workExperienceRoutes.patch("/update/:id", authValidator, ...updateExperienceById);
//update position experiences by id
workExperienceRoutes.patch(
  "/update/position/:positionId",
  authValidator,
  ...updatePositionExperienceById,
);

export default workExperienceRoutes;
