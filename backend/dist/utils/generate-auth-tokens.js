import jwt from "jsonwebtoken";
export const generateAccessToken = (id, role) => {
    const payload = { id };
    if (role) {
        payload.role = role;
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};
export const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
