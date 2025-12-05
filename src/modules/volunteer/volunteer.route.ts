import { Hono } from "hono";
import { addVolunteerExp } from "@/modules/volunteer/handlers/post-add-volunteer.handler";
import { getVolunteerExp } from "@/modules/volunteer/handlers/get-volunteer.handler";
import { getVolunteerExpById } from "@/modules/volunteer/handlers/get-volunteer-by-id.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { deleteVolunteerExpById } from "@/modules/volunteer/handlers/delete-volunteer-by-id.handler";
import { updateVolunteerExpById } from "@/modules/volunteer/handlers/patch-update-volunteer.handler";
import { reorderVolunteer } from "@/modules/volunteer/handlers/patch-reorder-volunteer.handler";

const volunteerRoutes = new Hono();

// add voluneteer experience
volunteerRoutes.post("/create", authValidator, ...addVolunteerExp);
// get all voluneteer expriences
volunteerRoutes.get("/list", ...getVolunteerExp);
// get voluneteer experience by id
volunteerRoutes.get("/:id", ...getVolunteerExpById);
// delete voluneteer experience by id
volunteerRoutes.delete("/:id", authValidator, ...deleteVolunteerExpById);
//update voluneteer experiences by id
volunteerRoutes.patch("/update/:id", authValidator, ...updateVolunteerExpById);
// reorder voluneteer experience
volunteerRoutes.patch("/re-order", authValidator, ...reorderVolunteer);

export default volunteerRoutes;
