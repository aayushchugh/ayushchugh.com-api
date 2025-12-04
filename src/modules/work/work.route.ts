import { Hono } from "hono";
import { addExperience } from "@/modules/work/handlers/post-add-experience.handler";
import { getAllExperiences } from "@/modules/work/handlers/get-experience.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { updateExperienceById } from "@/modules/work/handlers/patch-experience.handler";
import { getExperienceById } from "@/modules/work/handlers/get-experience-by-id.handler";
import { deleteExperienceById } from "@/modules/work/handlers/delete-experience-by-id.handler";

const workExperienceRoutes = new Hono();

// add experience
workExperienceRoutes.post("/create", authValidator, ...addExperience);
// get all expriences
workExperienceRoutes.get("/list", ...getAllExperiences);
// get experience by id
workExperienceRoutes.get("/:id", ...getExperienceById);
// delete experience by id
workExperienceRoutes.delete("/:id", authValidator, ...deleteExperienceById);
//update experiences by id
workExperienceRoutes.patch("/update/:id", authValidator, ...updateExperienceById);

export default workExperienceRoutes;
