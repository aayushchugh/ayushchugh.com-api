import { Hono } from "hono";
import { createBlog } from "@/modules/blog/handlers/post-create-blog.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { getAllBlogs } from "@/modules/blog/handlers/get-blogs.handler";
import { getBlogById } from "@/modules/blog/handlers/get-blogs-by-id.handler";
import { updateBlogById } from "@/modules/blog/handlers/patch-update-blogs-by-id.handler";
import { deleteBlogById } from "@/modules/blog/handlers/delete-blogs-by-id.handler";
import { reorderBlogs } from "@/modules/blog/handlers/patch-reorder-blog.handler";

const blogRoutes = new Hono();

// create blogs
blogRoutes.post("/create", authValidator, ...createBlog);
// get list of all blogs
blogRoutes.get("/list", ...getAllBlogs);
// get a specific blog by id
blogRoutes.get("/:id", ...getBlogById);
// delete blog by specific id
blogRoutes.delete("/:id", authValidator, ...deleteBlogById);
// update blog by id
blogRoutes.patch("/update/:id", authValidator, ...updateBlogById);
// update sort order
blogRoutes.patch("/re-order", authValidator, ...reorderBlogs);

export default blogRoutes;
