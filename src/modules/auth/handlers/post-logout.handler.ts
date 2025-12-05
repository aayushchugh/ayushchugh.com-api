import { HTTPException } from "hono/http-exception";
import { setCookie } from "hono/cookie";
import StatusCodes from "@/config/status-codes";
import { logger } from "@/lib/logger";
import { SessionModel, SessionStatus } from "@/db/schema";
import type { Context } from "hono";

export async function logout(c: Context) {
  try {
    const sessionId = c.get("sessionId");

    if (!sessionId) {
      throw new HTTPException(StatusCodes.HTTP_400_BAD_REQUEST, {
        message: "Session ID missing in context",
      });
    }

    await SessionModel.findByIdAndUpdate(
      { _id: sessionId },
      {
        status: SessionStatus.EXPIRED,
      },
    );

    logger.audit("User logged out", {
      module: "auth",
      action: "auth:logout:success",
      sessionId,
    });

    setCookie(c, "accessToken", "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    setCookie(c, "refreshToken", "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    return c.json({ message: "Logged out successfully" });
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }

    logger.error("Logout error", {
      module: "auth",
      action: "auth:logout:error",
      error: err instanceof Error ? err.message : String(err),
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Internal server error during logout",
    });
  }
}
