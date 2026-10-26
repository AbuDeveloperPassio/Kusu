const jwt = require("jsonwebtoken");

function secret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    throw new Error("JWT_SECRET is not set (use at least 16 characters)");
  }
  return process.env.JWT_SECRET;
}

function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, secret(), { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not signed in" });
  try {
    const payload = jwt.verify(token, secret());
    req.userId = payload.sub;
    next();
  } catch (err) {
    if (err.message && err.message.includes("JWT_SECRET")) return next(err);
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

module.exports = { signToken, requireAuth };
