import { Hono } from "hono";
import authRoutes from "@/modules/auth/auth.routes";
import blogRoutes from "@/modules/blog/blogs.routes";
import experienceRoutes from "@/modules/work/experience.route";
import projectsRoutes from "@/modules/projects/projects.route";

const apiV1Routes = new Hono();

apiV1Routes.route("/v1/auth", authRoutes);
apiV1Routes.route("/v1/blog", blogRoutes);
apiV1Routes.route("/v1/work", experienceRoutes);
apiV1Routes.route("/v1/project", projectsRoutes);

export default apiV1Routes;
