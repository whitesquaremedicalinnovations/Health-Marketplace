import { prisma } from "./prisma.js";
export const getDoctor = async (email) => {
    const doctor = await prisma.doctor.findUnique({
        where: { email },
    });
    return doctor;
};
export const getDoctorById = async (id) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id },
    });
    return doctor;
};
export const getClinic = async (email) => {
    const clinic = await prisma.clinic.findUnique({
        where: { email },
    });
    return clinic;
};
export const getClinicById = async (id) => {
    const clinic = await prisma.clinic.findUnique({
        where: { id },
    });
    return clinic;
};
