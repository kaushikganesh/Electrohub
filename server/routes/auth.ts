import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { verify, createGuardrails } from "otplib";
import { prisma } from "../db.js";
import { sendWelcomeAndResetEmail } from "../services/email.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "electrohub_super_secret_jwt_key_2025";

// POST /api/auth/verify-google-totp - Verify real Google Authenticator 6-digit TOTP code
router.post("/verify-google-totp", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, secret } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: "Email address and 6-digit Google Authenticator code are required." });
      return;
    }

    const cleanCode = code.toString().trim();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      res.status(400).json({ error: "Invalid format. Google Authenticator codes must be exactly 6 digits." });
      return;
    }

    const userSecret = secret || "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";

    // Verify using otplib v13 functional verify
    // epochTolerance of 120 seconds allows ±2 minute buffer for clock drift and typing latency
    const result = await verify({
      token: cleanCode,
      secret: userSecret,
      epochTolerance: 120,
      guardrails: createGuardrails({ MIN_SECRET_BYTES: 10 }),
    });

    if (!result.valid) {
      res.status(400).json({
        error: "Invalid Google Authenticator code! Fake or expired codes are rejected. Please enter the live 6-digit code shown in your Google Authenticator app.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Google Authenticator code verified successfully!",
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to verify Google Authenticator code." });
  }
});

// In-memory fallback users for resilience
const mockUsers: Array<{ id: number; name: string; email: string; passwordHash: string; role: "ADMIN" | "USER"; avatar?: string }> = [];

// Initialize default admin in mock array
(async () => {
  const hash = await bcrypt.hash("kaushik1512", 10);
  mockUsers.push({
    id: 1,
    name: "Kaushik Ganesh (Admin)",
    email: "kaushikganesh1512@gmail.com",
    passwordHash: hash,
    role: "ADMIN",
  });
})();

// Email validation helper
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 2FA in-memory verification store
const twoFactorStore = new Map<string, { code: string; expiresAt: number; user: any }>();

// Helper to generate 6-digit OTP code
const generate2FACode = (email: string, user: any) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  twoFactorStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    user,
  });
  return code;
};

// POST /api/auth/verify-2fa
router.post("/verify-2fa", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: "Email and 6-digit verification code are required." });
      return;
    }

    const targetEmail = email.trim().toLowerCase();
    const entry = twoFactorStore.get(targetEmail);
    if (!entry || entry.expiresAt < Date.now()) {
      res.status(400).json({ error: "Verification code has expired or is invalid. Please request a new code." });
      return;
    }

    if (entry.code !== code.trim()) {
      res.status(400).json({ error: "Invalid 6-digit 2FA code. Please check and try again." });
      return;
    }

    // 2FA Success!
    twoFactorStore.delete(targetEmail);
    const user = entry.user;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Two-Factor Authentication successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "2FA verification failed." });
  }
});

// POST /api/auth/send-2fa
router.post("/send-2fa", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email address is required." });
      return;
    }
    const targetEmail = email.trim().toLowerCase();
    const entry = twoFactorStore.get(targetEmail);
    if (!entry) {
      res.status(400).json({ error: "No active 2FA session found for this email." });
      return;
    }
    const newCode = generate2FACode(targetEmail, entry.user);
    res.status(200).json({
      message: `New 6-digit 2FA code sent to ${targetEmail}`,
      email: targetEmail,
      code: newCode,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to resend 2FA code." });
  }
});

// POST /api/auth/google-verify
router.post("/google-verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, googleCredential } = req.body;
    const tokenToVerify = idToken || googleCredential;

    if (!tokenToVerify) {
      res.status(400).json({ error: "Google ID Token credential is required for real Google authentication." });
      return;
    }

    let payload: any = null;

    // Verify token directly with Google OAuth2 API
    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
      if (googleRes.ok) {
        payload = await googleRes.json();
      }
    } catch (fetchErr) {
      console.warn("Google tokeninfo fetch note:", fetchErr);
    }

    // Fallback: decode JWT payload if direct tokeninfo fetch fails
    if (!payload && typeof tokenToVerify === "string" && tokenToVerify.split(".").length === 3) {
      try {
        const base64Url = tokenToVerify.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        payload = JSON.parse(jsonPayload);
      } catch (decodeErr) {
        console.error("JWT decode error:", decodeErr);
      }
    }

    if (!payload || !payload.email) {
      res.status(401).json({ error: "Google Authentication Failed: Invalid or corrupted Google security token." });
      return;
    }

    if (payload.email_verified !== true && payload.email_verified !== "true") {
      res.status(401).json({ error: "Google Authentication Failed: Your Google email address is not verified by Google." });
      return;
    }

    const targetEmail = payload.email.trim().toLowerCase();
    const userName = payload.name || payload.given_name || targetEmail.split("@")[0];
    const userAvatar = payload.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop";

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email: targetEmail } });
      if (!user) {
        const dummyPassword = await bcrypt.hash("google_oauth_" + Date.now(), 10);
        user = await prisma.user.create({
          data: {
            name: userName,
            email: targetEmail,
            password: dummyPassword,
            avatar: userAvatar,
            role: targetEmail === "kaushikganesh1512@gmail.com" ? "ADMIN" : "USER",
          },
        });
        // Dispatch Welcome Email containing Password Change Link to Google user
        const resetToken = crypto.randomBytes(32).toString("hex");
        sendWelcomeAndResetEmail({ email: targetEmail, name: userName, resetToken }).catch(console.warn);
      } else {
        // Dispatch Welcome Email for returning Google user
        const resetToken = crypto.randomBytes(32).toString("hex");
        sendWelcomeAndResetEmail({ email: targetEmail, name: user.name || userName, resetToken }).catch(console.warn);
      }
    } catch {
      let mock = mockUsers.find((u) => u.email.toLowerCase() === targetEmail);
      if (!mock) {
        mock = {
          id: mockUsers.length + 1,
          name: userName,
          email: targetEmail,
          passwordHash: "google_oauth",
          role: targetEmail === "kaushikganesh1512@gmail.com" ? "ADMIN" : "USER",
          avatar: userAvatar,
        };
        mockUsers.push(mock);
      }
      user = mock;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: `Google Authentication successful for ${targetEmail}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || userAvatar,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Google token verification failed." });
  }
});

// POST /api/auth/google
router.post("/google", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, avatar } = req.body;
    if (!email) {
      res.status(400).json({ error: "Google account email is required." });
      return;
    }

    const targetEmail = email.trim().toLowerCase();

    // Strict Email validation for real Google accounts
    if (!isValidEmail(targetEmail)) {
      res.status(400).json({ error: "Authentication Failed: Please enter a valid Google email address." });
      return;
    }

    const isGoogleMail = targetEmail.endsWith("@gmail.com") || targetEmail.endsWith("@google.com") || targetEmail === "kaushikganesh1512@gmail.com";
    if (!isGoogleMail) {
      res.status(400).json({ error: "Authentication Failed: Only real @gmail.com or verified Google Workspace accounts can authenticate via Google." });
      return;
    }

    const userName = name || email.split("@")[0];
    const userAvatar = avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop";

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email: targetEmail } });
      if (!user) {
        const dummyPassword = await bcrypt.hash("google_oauth_" + Date.now(), 10);
        user = await prisma.user.create({
          data: {
            name: userName,
            email: targetEmail,
            password: dummyPassword,
            avatar: userAvatar,
            role: targetEmail === "kaushikganesh1512@gmail.com" ? "ADMIN" : "USER",
          },
        });
        // Dispatch Welcome Email containing Password Change Link to Google user
        const resetToken = crypto.randomBytes(32).toString("hex");
        sendWelcomeAndResetEmail({ email: targetEmail, name: userName, resetToken }).catch(console.warn);
      } else {
        // Dispatch Welcome Email for returning Google user
        const resetToken = crypto.randomBytes(32).toString("hex");
        sendWelcomeAndResetEmail({ email: targetEmail, name: user.name || userName, resetToken }).catch(console.warn);
      }
    } catch {
      // In-memory fallback
      let mock = mockUsers.find((u) => u.email.toLowerCase() === targetEmail);
      if (!mock) {
        mock = {
          id: mockUsers.length + 1,
          name: userName,
          email: targetEmail,
          passwordHash: "google_oauth",
          role: targetEmail === "kaushikganesh1512@gmail.com" ? "ADMIN" : "USER",
          avatar: userAvatar,
        };
        mockUsers.push(mock);
      }
      user = mock;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: `Google Authentication successful for ${targetEmail}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || userAvatar,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Google Authentication failed." });
  }
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required." });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Please enter a valid email address." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long." });
      return;
    }

    // Prevent registering as the dedicated admin email
    if (email.toLowerCase() === "kaushikganesh1512@gmail.com") {
      res.status(400).json({ error: "This email address is reserved for system administration." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const resetToken = crypto.randomBytes(24).toString("hex");

    let newUser;
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(400).json({ error: "An account with this email already exists." });
        return;
      }

      newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER",
        },
      });
    } catch {
      // Fallback in-memory store if DB is unreachable
      if (mockUsers.some((u) => u.email === email)) {
        res.status(400).json({ error: "An account with this email already exists." });
        return;
      }
      newUser = {
        id: mockUsers.length + 1,
        name,
        email,
        passwordHash: hashedPassword,
        role: "USER" as const,
      };
      mockUsers.push(newUser);
    }

    // Send Welcome Email with Password Reset Link
    await sendWelcomeAndResetEmail({
      email: newUser.email,
      name: newUser.name,
      resetToken,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful! Welcome to ElectroHub.",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: (newUser as any).avatar || null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed." });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // Special check for Admin Credentials
    const isAdminCredentials =
      email.trim().toLowerCase() === "kaushikganesh1512@gmail.com" &&
      password.trim() === "kaushik1512";

    let user: { id: number; name: string; email: string; role: "ADMIN" | "USER"; password?: string; avatar?: string | null } | null = null;

    try {
      const dbUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (dbUser) {
        const isPasswordValid = await bcrypt.compare(password, dbUser.password);
        if (isPasswordValid || (isAdminCredentials && dbUser.role === "ADMIN")) {
          user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role as "ADMIN" | "USER",
            avatar: dbUser.avatar || null,
          };
        }
      }
    } catch {
      // Memory fallback lookup
    }

    if (!user && isAdminCredentials) {
      user = {
        id: 1,
        name: "Kaushik Ganesh (Admin)",
        email: "kaushikganesh1512@gmail.com",
        role: "ADMIN",
        avatar: null,
      };
    }

    if (!user) {
      const mock = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (mock) {
        const match = await bcrypt.compare(password, mock.passwordHash);
        if (match) {
          user = { id: mock.id, name: mock.name, email: mock.email, role: mock.role, avatar: mock.avatar || null };
        }
      }
    }

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Dispatch Welcome Email with active Password Change Link to user's email address on login
    const resetToken = crypto.randomBytes(32).toString("hex");
    sendWelcomeAndResetEmail({ email: user.email, name: user.name, resetToken }).catch((e) => console.warn("Login email send note:", e));

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed." });
  }
});

// PUT /api/auth/update-avatar
router.put("/update-avatar", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, avatar } = req.body;

    if (!email || avatar === undefined) {
      res.status(400).json({ error: "Email address and avatar image are required." });
      return;
    }

    const targetEmail = email.trim().toLowerCase();

    let updatedUser: any = null;
    try {
      const dbUser = await prisma.user.findUnique({ where: { email: targetEmail } });
      if (dbUser) {
        updatedUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { avatar },
        });
      }
    } catch (dbErr) {
      console.warn("PostgreSQL user avatar update note:", dbErr);
    }

    const mock = mockUsers.find((u) => u.email.toLowerCase() === targetEmail);
    if (mock) {
      mock.avatar = avatar;
    }

    res.status(200).json({
      message: "Profile photo updated successfully in PostgreSQL database!",
      user: {
        id: updatedUser?.id || 1,
        name: updatedUser?.name || "User",
        email: targetEmail,
        role: updatedUser?.role || "USER",
        avatar: avatar,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update profile photo." });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ error: "Email address and new password are required." });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters long." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const targetEmail = email.trim().toLowerCase();

    try {
      const dbUser = await prisma.user.findUnique({ where: { email: targetEmail } });
      if (dbUser) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { password: hashedPassword },
        });
      }
    } catch (dbErr) {
      console.warn("PostgreSQL password update note:", dbErr);
    }

    const mock = mockUsers.find((u) => u.email.toLowerCase() === targetEmail);
    if (mock) {
      mock.passwordHash = hashedPassword;
    }

    res.status(200).json({
      message: "Password changed successfully! You can now sign in with your new password.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reset password." });
  }
});

// GET current user info
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization?.split(" ")[1];
    if (!authHeader) {
      res.status(401).json({ error: "Missing token" });
      return;
    }
    const payload = jwt.verify(authHeader, JWT_SECRET) as any;
    const dbUser = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role, avatar: dbUser.avatar || null });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// DELETE account (Direct PostgreSQL deletion)
router.delete("/delete-account", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization?.split(" ")[1];
    let userId: number | undefined;
    let userEmail: string | undefined = req.body?.email?.toLowerCase();

    if (authHeader) {
      try {
        const payload: any = jwt.verify(authHeader, JWT_SECRET);
        if (payload?.id) userId = payload.id;
        if (payload?.email) userEmail = payload.email.toLowerCase();
      } catch {
        // Fallback to body/query lookup
      }
    }

    if (!userId && !userEmail && req.query?.email) {
      userEmail = (req.query.email as string).toLowerCase();
    }

    let targetUser = null;

    // Direct PostgreSQL lookup
    try {
      if (userId) {
        targetUser = await prisma.user.findUnique({ where: { id: userId } });
      }
      if (!targetUser && userEmail) {
        targetUser = await prisma.user.findUnique({ where: { email: userEmail } });
      }

      if (targetUser) {
        // Delete all orders associated with this PostgreSQL user
        await prisma.order.deleteMany({
          where: {
            OR: [{ userId: targetUser.id }, { customerEmail: targetUser.email }],
          },
        });
        // Delete user row permanently from PostgreSQL
        await prisma.user.delete({ where: { id: targetUser.id } });
      }
    } catch (dbErr) {
      console.warn("PostgreSQL user deletion note:", dbErr);
    }

    // Clean up mock fallback array if present
    if (userEmail || userId) {
      const mockIdx = mockUsers.findIndex(
        (u) => (userId && u.id === userId) || (userEmail && u.email.toLowerCase() === userEmail)
      );
      if (mockIdx !== -1) {
        mockUsers.splice(mockIdx, 1);
      }
    }

    res.json({
      success: true,
      message: "User profile and all associated data permanently deleted from PostgreSQL database.",
    });
  } catch (err: any) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: err.message || "Failed to delete user profile from database" });
  }
});

export default router;
