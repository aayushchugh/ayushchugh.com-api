import StatusCodes from "@/config/status-codes";
import { SessionModel, SessionStatus } from "@/db/schema";
import type { Session } from "@/db/schema";
import { factory } from "@/lib/factory";
import { verifyJwt } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

export const verifySessionHandler = factory.createHandlers(async (c) => {
  try {
    const accessToken = getCookie(c, "accessToken");
    // if access token is avilable
    if (!accessToken) {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        message: "Access Token not available",
      });
    }

    let decoded: { userId: string; sessionId: string };

    try {
      // verifying the token
      decoded = verifyJwt(accessToken, {
        algorithms: ["HS256"],
      }) as { userId: string; sessionId: string };
    } catch {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        message: "Invalid or expired access token",
      });
    }

    const { sessionId } = decoded;

    const session: Session | null = await SessionModel.findById(sessionId);

    // check if the session exists
    if (!session) {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        message: "Session not found",
      });
    }

    //check if session is active
    if (session.status !== SessionStatus.ACTIVE) {
      throw new HTTPException(StatusCodes.HTTP_403_FORBIDDEN, {
        message: "Session not active",
      });
    }

    // check if accesstoken has expired
    if (session.providerAccessTokenExpiresAt <= new Date()) {
      throw new HTTPException(StatusCodes.HTTP_401_UNAUTHORIZED, {
        message: "Provider access token expired",
      });
    }

    return c.json({
      success: true,
      message: "Session verified successfully",
    });
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err;
    }

    logger.error("Error verifying user session", {
      module: "auth",
      action: "token:verify:error",
      error: err instanceof Error ? err.message : String(err),
    });

    throw new HTTPException(StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      message: "Internal server error during verification",
    });
  }
});
