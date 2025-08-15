import { Router } from "express";
import { onboardingDoctor, onboardingClinic, getProfile, updateProfile, updateDocuments, deleteDocument, getNewsById, getNews, likeNews, commentOnNews, getNewsComments } from "../controller/user.controller.js";
const router = Router();
//Onboarding Routes
router.post("/onboarding/doctor", onboardingDoctor);
router.post("/onboarding/clinic", onboardingClinic);
// Profile Routes
router.get("/profile", getProfile);
router.post("/profile/update/:userId", updateProfile);
router.post("/profile/update-documents/:userId", updateDocuments);
router.delete("/profile/delete-document/:userId/:documentId", deleteDocument);
//News Routes
router.get("/news", getNews);
router.get("/news/:newsId", getNewsById);
router.post("/news/:newsId/like", likeNews);
router.post("/news/:newsId/comment", commentOnNews);
router.get("/news/:newsId/comments", getNewsComments);
//Payment Routes
export default router;
