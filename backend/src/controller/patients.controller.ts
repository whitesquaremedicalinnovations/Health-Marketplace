import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.ts";
import { ResponseHelper, asyncHandler } from "../utils/response.ts";
import { AppError } from "../utils/app-error.ts";
import { ErrorCode } from "../types/errors.ts";
import { PatientStatus } from "@prisma/client";

export const getPatientsByClinicId = asyncHandler(async (req: Request, res: Response) => {
    const { clinicId } = req.params as { clinicId: string };
    
        const patients = await prisma.patient.findMany({
        where: { clinicId },
        include: {
            clinic: {
                select: {
                    id: true,
                    clinicName: true,
                    clinicAddress: true
                }
            },
            assignedDoctors: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true,
                    profileImage: {
                        select: {
                            docUrl: true
                        }
                    }
                }
            },
            feedbacks: {
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            _count: {
                select: {
                    feedbacks: true,
                    assignedDoctors: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
        ResponseHelper.success(res, patients, "Patients fetched successfully");
});

export const getPatientsByDoctorId = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId } = req.params as { doctorId: string };
    
        const patients = await prisma.patient.findMany({
            where: {
                assignedDoctors: {
                some: { id: doctorId }
            }
        },
        include: {
            clinic: {
                select: {
                    id: true,
                    clinicName: true,
                    clinicAddress: true
                }
            },
            assignedDoctors: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true,
                    profileImage: {
                        select: {
                            docUrl: true
                        }
                    }
                }
            },
            feedbacks: {
                orderBy: { createdAt: 'desc' },
                take: 5
            },
            _count: {
                select: {
                    feedbacks: true,
                    assignedDoctors: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
        ResponseHelper.success(res, patients, "Patients fetched successfully");
});   

export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params as { patientId: string };
    
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            clinic: {
                select: {
                    id: true,
                    clinicName: true,
                    clinicAddress: true,
                    clinicPhoneNumber: true
                }
            },
            assignedDoctors: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true,
                    phoneNumber: true,
                    profileImage: {
                        select: {
                            docUrl: true
                        }
                    }
                }
            },
            feedbacks: {
                orderBy: { createdAt: 'desc' }
            },
            profileImage: {
                select: {
                    docUrl: true
                }
            },
            _count: {
                select: {
                    feedbacks: true,
                    assignedDoctors: true
                }
            }
        }
    });
    
    if (!patient) {
        throw AppError.notFound("Patient");
    }
    
        ResponseHelper.success(res, patient, "Patient fetched successfully");
});

export const createPatient = asyncHandler(async (req: Request, res: Response) => {
    const { name, phoneNumber, gender, dateOfBirth, address, latitude, longitude, clinicId } = req.body as {
        name: string;
        phoneNumber: string;
        gender: string;
        dateOfBirth: string;
        address: string;
        latitude?: number;
        longitude?: number;
        clinicId: string;
    };
    
    // Validate required fields
    if (!name || !phoneNumber || !gender || !dateOfBirth || !address || !clinicId) {
        throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, "Please provide all required patient information");
    }
    
    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
        select: { id: true }
    });
    
    if (!clinic) {
        throw AppError.notFound("Clinic");
    }
    
        const patient = await prisma.patient.create({
        data: {
            name,
            phoneNumber,
            gender,
            dateOfBirth: new Date(dateOfBirth),
            address,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            clinicId
        },
        include: {
            clinic: {
                select: {
                    id: true,
                    clinicName: true,
                    clinicAddress: true
                }
            }
        }
    });
    
    ResponseHelper.created(res, patient, "Patient created successfully");
});   

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params as { patientId: string };
    const { name, phoneNumber, gender, dateOfBirth, address, latitude, longitude, clinicId } = req.body as {
        name?: string;
        phoneNumber?: string;
        gender?: string;
        dateOfBirth?: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        clinicId?: string;
    };
    
    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true }
    });
    
    if (!existingPatient) {
        throw AppError.notFound("Patient");
    }
    
    // If clinicId is being updated, check if new clinic exists
    if (clinicId) {
        const clinic = await prisma.clinic.findUnique({
            where: { id: clinicId },
            select: { id: true }
        });
        
        if (!clinic) {
            throw AppError.notFound("Clinic");
        }
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (gender) updateData.gender = gender;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (address) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude ? Number(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? Number(longitude) : null;
    if (clinicId) updateData.clinicId = clinicId;
    
        const patient = await prisma.patient.update({
        where: { id: patientId },
        data: updateData,
        include: {
            clinic: {
                select: {
                    id: true,
                    clinicName: true,
                    clinicAddress: true
                }
            }
        }
    });
    
        ResponseHelper.success(res, patient, "Patient updated successfully");
});

export const assignDoctorToPatient = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params as { patientId: string };
    const { doctorId } = req.body as { doctorId: string };
    
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true }
    });
    
    if (!patient) {
        throw AppError.notFound("Patient");
    }
    
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true }
    });
    
    if (!doctor) {
        throw AppError.notFound("Doctor");
    }
    
    // Check if already assigned
    const existingAssignment = await prisma.patient.findFirst({
        where: {
            id: patientId,
            assignedDoctors: {
                some: { id: doctorId }
            }
        }
    });
    
    if (existingAssignment) {
        throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, "Doctor is already assigned to this patient");
    }
    
    const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: { assignedDoctors: { connect: { id: doctorId } } },
        include: {
            assignedDoctors: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true
                }
            }
        }
    });
    
    ResponseHelper.success(res, updatedPatient, "Doctor assigned to patient successfully");
});

export const deAssignDoctorFromPatient = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params as { patientId: string };
    const { doctorId } = req.body as { doctorId: string };
    
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true }
    });
    
    if (!patient) {
        throw AppError.notFound("Patient");
    }
    
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true }
    });
    
    if (!doctor) {
        throw AppError.notFound("Doctor");
    }
    
    // Check if assignment exists
    const existingAssignment = await prisma.patient.findFirst({
        where: {
            id: patientId,
            assignedDoctors: {
                some: { id: doctorId }
            }
        }
    });
    
    if (!existingAssignment) {
        throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, "Doctor is not assigned to this patient");
    }
    
    const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: { assignedDoctors: { disconnect: { id: doctorId } } },
        include: {
            assignedDoctors: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true
                }
            }
        }
    });
    
    ResponseHelper.success(res, updatedPatient, "Doctor de-assigned from patient successfully");
});

export const updatePatientStatus = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params as { patientId: string };
    const { status } = req.body as { status: PatientStatus };
    
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true }
    });
    
    if (!patient) {
        throw AppError.notFound("Patient");
    }
    
    // Validate status
    if (!Object.values(PatientStatus).includes(status)) {
        throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, "Invalid patient status");
    }
    
    const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: { status },
        include: {
            clinic: {
                select: {
                    id: true,
                    clinicName: true
                }
            }
        }
    });
    
    ResponseHelper.success(res, updatedPatient, "Patient status updated successfully");
});

export const addFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params as { patientId: string };
    const { feedback } = req.body as { feedback: string };
    
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true }
    });
    
    if (!patient) {
        throw AppError.notFound("Patient");
    }
    
    // Validate feedback
    if (!feedback || feedback.trim().length === 0) {
        throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, "Feedback content is required");
    }
    
    const newFeedback = await prisma.feedback.create({
        data: {
            feedback: feedback.trim(),
            patientId
        },
        include: {
            patient: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    
    ResponseHelper.created(res, newFeedback, "Feedback added successfully");
});

export const searchPatients = asyncHandler(async (req: Request, res: Response) => {
    const { clinicId } = req.params as { clinicId: string };
    const { searchTerm, status, gender } = req.query as {
        searchTerm?: string;
        status?: PatientStatus;
        gender?: string;
    };
    
    const whereClause: any = { clinicId };
    
    if (searchTerm) {
        whereClause.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { phoneNumber: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } }
        ];
    }
    
    if (status) {
        whereClause.status = status;
    }
    
    if (gender) {
        whereClause.gender = gender;
    }
    
    const patients = await prisma.patient.findMany({
        where: whereClause,
        include: {
            assignedDoctors: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true
                }
            },
            _count: {
                select: {
                    feedbacks: true,
                    assignedDoctors: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
    ResponseHelper.success(res, patients, "Patients searched successfully");
});

export const getPatientFeedbacks = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params as { patientId: string };
    
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true, name: true }
    });
    
    if (!patient) {
        throw AppError.notFound("Patient");
    }
    
    const feedbacks = await prisma.feedback.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' }
    });
    
    ResponseHelper.success(res, feedbacks, "Patient feedbacks fetched successfully");
});

export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params as { patientId: string };
    
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true, name: true }
    });
    
    if (!patient) {
        throw AppError.notFound("Patient");
    }
    
    // Delete patient (this will cascade delete feedbacks due to Prisma relations)
    await prisma.patient.delete({
        where: { id: patientId }
    });
    
    ResponseHelper.success(res, null, "Patient deleted successfully");
});