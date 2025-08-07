//Auth Middlewares
import jwt from "jsonwebtoken";
export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
};
