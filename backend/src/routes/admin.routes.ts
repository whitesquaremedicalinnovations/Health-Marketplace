import { Router } from "express";
import { getOverview, getAllUsers, getAllDoctors, getAllClinics, getAllPitches, getAllRequirements, getAllPayments, setOnboardingFee, getUsersToVerify, verifyDoctor, verifyClinic, getAllNews, createNews, updateNews, deleteNews, getOnboardingFee, totalNewsLikes, totalNewsComments, getNewsById, adminLogin, adminLogout } from "../controller/admin.controller.ts";
import { adminAuth } from "../middlewares/admin-auth.ts";

const router = Router();

// Public routes (no auth required)
router.post("/login", adminLogin);

// Protected routes (admin auth required)
router.post("/logout", adminAuth, adminLogout);
router.get("/get-overview", adminAuth, getOverview);
router.get("/get-all-users", adminAuth, getAllUsers);
router.get("/get-all-doctors", adminAuth, getAllDoctors);
router.get("/get-all-clinics", adminAuth, getAllClinics);
router.get("/get-all-pitches", adminAuth, getAllPitches);
router.get("/get-all-requirements", adminAuth, getAllRequirements);
router.get("/get-all-payments", adminAuth, getAllPayments);
router.get("/get-onboarding-fee", adminAuth, getOnboardingFee);
router.post("/set-onboarding-fee", adminAuth, setOnboardingFee);
router.get("/get-users-to-verify", adminAuth, getUsersToVerify);
router.post("/verify-doctor/:doctorId", adminAuth, verifyDoctor);
router.post("/verify-clinic/:clinicId", adminAuth, verifyClinic);
router.get("/get-all-news", adminAuth, getAllNews);
router.get("/get-news-by-id/:newsId", adminAuth, getNewsById);
router.post("/create-news", adminAuth, createNews);
router.post("/update-news/:newsId", adminAuth, updateNews);
router.post("/delete-news/:newsId", adminAuth, deleteNews);
router.get("/total-news-likes/:newsId", adminAuth, totalNewsLikes);
router.get("/total-news-comments/:newsId", adminAuth, totalNewsComments);





export default router;