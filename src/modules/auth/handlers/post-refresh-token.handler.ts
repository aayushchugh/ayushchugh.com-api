import { factory } from "@/lib/factory";
import { HTTPException } from "hono/http-exception";
import StatusCodes from "@/config/status-codes";
import { TokenService } from "../services";
import { logger } from "@/lib/logger";
import { getCookie, setCookie } from "hono/cookie";
import { verifyJwt } from "@/lib/jwt";
import env from "@/config/env";

export const postRefreshTokenHandler = factory.createHandlers(async (c) => {
  try {
    const refreshToken = getCookie(c, "refreshToken");

    if (!refreshToken) {
      logger.warn("Refresh token not provided", {
        module: "auth",
        action: "token:refresh:no-token",
      });
      throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
        message: "Refresh token not provided",
      });
    }

    let decoded: { userId: string; sessionId: string };

    try {
      decoded = verifyJwt(refreshToken, {
        algorithms: ["HS256"],
      }) as { userId: string; sessionId: string };
    } catch (error) {
      logger.error("Refresh token verification failed", {
        module: "auth",
        action: "token:refresh:verify-failed",
        error: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : "Unknown",
      });

      throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
        message: "Invalid or expired refresh token",
      });
    }

    const { sessionId } = decoded;

    const result = await TokenService.refreshAccessToken(sessionId);

    logger.audit("Tokens refreshed successfully", {
      module: "auth",
      action: "token:refresh:success",
      sessionId,
    });

    setCookie(c, "accessToken", result.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return c.json({
      message: "Tokens refreshed successfully",
    });
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }

    logger.error("Error refreshing token", {
      module: "auth",
      action: "token:refresh:error",
      error: err instanceof Error ? err.message : String(err),
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Internal server error while refreshing tokens",
    });
  }
});
