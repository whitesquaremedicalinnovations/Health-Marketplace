import { prisma } from "../utils/prisma.js";
export const getOverview = async (req, res) => {
    const totalDoctors = await prisma.doctor.count();
    const totalClinics = await prisma.clinic.count();
    const totalPitches = await prisma.pitch.count();
    const totalRequirements = await prisma.jobRequirement.count();
    const totalPayments = await prisma.payment.count();
    const totalAmount = await prisma.payment.aggregate({ _sum: { amount: true } });
    const totalNews = await prisma.news.count();
    const totalLikes = await prisma.newsLike.count();
    const totalComments = await prisma.newsComment.count();
    res.status(200).json({ totalDoctors, totalClinics, totalPitches, totalRequirements, totalPayments, totalAmount, totalNews, totalLikes, totalComments });
};
export const getAllUsers = async (req, res) => {
    const doctors = await prisma.doctor.findMany();
    const clinics = await prisma.clinic.findMany();
    res.status(200).json({ doctors, clinics });
};
export const getAllDoctors = async (req, res) => {
    const doctors = await prisma.doctor.findMany();
    res.status(200).json({ doctors });
};
export const getAllClinics = async (req, res) => {
    const clinics = await prisma.clinic.findMany();
    res.status(200).json({ clinics });
};
export const getAllPitches = async (req, res) => {
    const pitches = await prisma.pitch.findMany();
    res.status(200).json({ pitches });
};
export const getAllRequirements = async (req, res) => {
    const requirements = await prisma.jobRequirement.findMany();
    res.status(200).json({ requirements });
};
export const getAllPayments = async (req, res) => {
    const payments = await prisma.payment.findMany();
    res.status(200).json({ payments });
};
export const getOnboardingFee = async (req, res) => {
    const onboardingFee = await prisma.onboardingFee.findFirst();
    res.status(200).json({ onboardingFee });
};
export const setOnboardingFee = async (req, res) => {
    const { fee } = req.body;
    const onboardingFee = await prisma.onboardingFee.create({ data: { fee } });
    res.status(200).json({ onboardingFee });
};
export const getUsersToVerify = async (req, res) => {
    const doctors = await prisma.doctor.findMany({ where: { isVerified: false } });
    const clinics = await prisma.clinic.findMany({ where: { isVerified: false } });
    res.status(200).json({ doctors, clinics });
};
export const verifyDoctor = async (req, res) => {
    const { doctorId } = req.params;
    const doctor = await prisma.doctor.update({ where: { id: doctorId }, data: { isVerified: true } });
    res.status(200).json({ doctor });
};
export const verifyClinic = async (req, res) => {
    const { clinicId } = req.params;
    const clinic = await prisma.clinic.update({ where: { id: clinicId }, data: { isVerified: true } });
    res.status(200).json({ clinic });
};
export const getAllNews = async (req, res) => {
    const news = await prisma.news.findMany();
    res.status(200).json({ news });
};
export const createNews = async (req, res) => {
    const { title, content, imageUrl, adminId } = req.body;
    const news = await prisma.news.create({ data: { title, content, imageUrl, postedById: adminId } });
    res.status(200).json({ news });
};
export const updateNews = async (req, res) => {
    const { newsId } = req.params;
    const { title, content, imageUrl } = req.body;
    const news = await prisma.news.update({ where: { id: newsId }, data: { title, content, imageUrl } });
    res.status(200).json({ news });
};
export const deleteNews = async (req, res) => {
    const { newsId } = req.params;
    const news = await prisma.news.delete({ where: { id: newsId } });
    res.status(200).json({ news });
};
export const totalNewsLikes = async (req, res) => {
    const { newsId } = req.params;
    const totalLikes = await prisma.newsLike.count({ where: { newsId } });
    res.status(200).json({ totalLikes });
};
export const totalNewsComments = async (req, res) => {
    const { newsId } = req.params;
    const totalComments = await prisma.newsComment.count({ where: { newsId } });
    res.status(200).json({ totalComments });
};
