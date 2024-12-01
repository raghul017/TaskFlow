import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface TokenPayload {
  userId: string;
  role?: string;
  email?: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
  });
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    if (!decoded.id) {
      return null;
    }
    return decoded;
  } catch (_error) {
    return null;
  }
}

export function generateResetToken(userId: string) {
  return jwt.sign({ userId, type: "reset" }, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyResetToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      type: string;
    };
    if (decoded.type !== "reset") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (_error) {
    throw new Error("Invalid or expired reset token");
  }
}
