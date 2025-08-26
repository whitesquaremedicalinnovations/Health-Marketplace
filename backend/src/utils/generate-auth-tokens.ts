import jwt from "jsonwebtoken";

export const generateAccessToken = (id: string, role?: string) => {
    const payload: any = { id };
    if (role) {
        payload.role = role;
    }
    return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

export const generateRefreshToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET as string);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET as string);
};