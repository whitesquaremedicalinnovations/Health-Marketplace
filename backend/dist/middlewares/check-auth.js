import { Clerk } from "@clerk/backend";
const clerk = Clerk({
    secretKey: process.env.CLERK_SECRET_KEY,
});
export const checkAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    clerk.verifyToken(token)
        .then((claims) => {
        req.userId = claims.sub;
        next();
    })
        .catch(() => {
        return res.status(401).json({ message: "Unauthorized" });
    });
};
