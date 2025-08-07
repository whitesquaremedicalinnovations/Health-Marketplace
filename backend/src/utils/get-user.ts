import { prisma } from "./prisma.ts";

export const getDoctor = async (email: string) => {
    const doctor = await prisma.doctor.findUnique({
        where: { email },
    });
    return doctor;
};

export const getDoctorById = async (id: string) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id },
    });
    return doctor;
};

export const getClinic = async (email: string) => {
    const clinic = await prisma.clinic.findUnique({
        where: { email },
    });
    return clinic;
};

export const getClinicById = async (id: string) => {    
    const clinic = await prisma.clinic.findUnique({
        where: { id },
    });
    return clinic;
};