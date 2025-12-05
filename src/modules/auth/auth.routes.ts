import { Hono } from "hono";
import { getOauthHandler } from "@/modules/auth/handlers/get-oauth.handler";
import { getOauthCallbackHandler } from "@/modules/auth/handlers/get-oauth-callback.handler";
import { postRefreshTokenHandler } from "@/modules/auth/handlers/post-refresh-token.handler";
import { verifySessionHandler } from "@/modules/auth/handlers/get-verify-session.handler";
import { authValidator } from "@/middlewares/enforce-auth.middleware";
import { logout } from "@/modules/auth/handlers/post-logout.handler";

const authRoutes = new Hono();

// Generic OAuth routes - works with any provider (e.g., /oauth/google, /oauth/github)
// These routes accept provider as a path parameter
authRoutes.get("/oauth/:provider", ...getOauthHandler);
authRoutes.get("/oauth/:provider/callback", ...getOauthCallbackHandler);

// Token refresh endpoint
authRoutes.post("/oauth/refresh", ...postRefreshTokenHandler);

// verify route
authRoutes.get("/verify-session", ...verifySessionHandler);

// logout route
authRoutes.post("/logout", authValidator, logout);

export default authRoutes;
