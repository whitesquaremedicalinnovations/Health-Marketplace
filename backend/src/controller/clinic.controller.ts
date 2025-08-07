import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.ts";
import getDistance from "../utils/distance.ts";

export const getClinics = async (req: Request, res: Response) => {
    const clinics = await prisma.clinic.findMany();
    res.status(200).json({ clinics });
}

export const getClinicById = async (req: Request, res: Response) => {
    const { clinicId } = req.params;
    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, include: { clinicProfileImage: true, documents: true } });
    if(!clinic){
        return res.status(404).json({ message: "Clinic not found" });
    }
    const clinicData = {
        ...clinic,
        clinicProfileImage: clinic.clinicProfileImage ? clinic.clinicProfileImage.docUrl : null,
        documents: clinic.documents.map((doc: any) => doc.url),
    }
    res.status(200).json({ clinic: clinicData });
}

export const getDoctorsByLocation = async (req: Request, res: Response) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng || !radius) {
            return res.status(400).json({ message: "Latitude, longitude, and radius are required" });
        }

        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const searchRadius = parseFloat(radius as string);

        const doctors = await prisma.doctor.findMany({
            include: {
                profileImage: true,
            }
        });

        const doctorsNearby = doctors.filter(doctor => {
            if (doctor.latitude && doctor.longitude) {
                const distance = getDistance(latitude, longitude, doctor.latitude, doctor.longitude);
                return distance <= searchRadius;
            }
            return false;
        });
        
        const doctorsData = doctorsNearby.map(doctor => ({
            id: doctor.id,
            fullName: doctor.fullName,
            specialization: doctor.specialization,
            experience: doctor.experience,
            profileImage: doctor.profileImage ? doctor.profileImage.docUrl : null,
        }));

        res.status(200).json({ doctors: doctorsData });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getRequirementsByClinic = async (req: Request, res: Response) => {
    try {
        const { clinicId } = req.params;
        const requirements = await prisma.jobRequirement.findMany({ 
            where: { clinicId },
            orderBy: { createdAt: "desc" }
        });
        res.status(200).json({ requirements });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getRequirementById = async (req: Request, res: Response) => {
    try {
        const { requirementId } = req.params;
        const requirement = await prisma.jobRequirement.findUnique({ where: { id: requirementId } });

        if (!requirement) {
            return res.status(404).json({ message: "Requirement not found" });
        }

        res.status(200).json({ requirement });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const postRequirement = async (req: Request, res: Response) => {
    try {
        const { title, description, type, additionalInformation, specialization, date, clinicId } = req.body;
        console.log(req.body)

        const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });

        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found" });
        }

        const requirement = await prisma.jobRequirement.create({
            data: {
                title,
                description,
                location: clinic.clinicAddress,
                type,
                specialization,
                date,
                additionalInformation,
                requirementStatus: "POSTED",
                clinicId
            }
        });
        res.status(201).json({ requirement });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const updateRequirement = async (req: Request, res: Response) => {
    try {
        const { requirementId } = req.params;
        const { title, description, type, additionalInformation, specialization, date, requirementStatus, clinicId } = req.body;

        const requirement = await prisma.jobRequirement.findUnique({ where: { id: requirementId } });

        if (!requirement) {
            return res.status(404).json({ message: "Requirement not found" });
        }

        if (requirement.clinicId !== clinicId) {
            return res.status(403).json({ message: "You are not authorized to update this requirement" });
        }

        const updatedRequirement = await prisma.jobRequirement.update({
            where: { id: requirementId },
            data: { title, description, type, additionalInformation, specialization, date, requirementStatus }
        });
        res.status(200).json({ requirement: updatedRequirement });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const deleteRequirement = async (req: Request, res: Response) => {
    try {
        const { requirementId } = req.params;
        const { clinicId } = req.body;

        const requirement = await prisma.jobRequirement.findUnique({ where: { id: requirementId } });

        if (!requirement) {
            return res.status(404).json({ message: "Requirement not found" });
        }

        if (requirement.clinicId !== clinicId) {
            return res.status(403).json({ message: "You are not authorized to delete this requirement" });
        }

        await prisma.jobRequirement.delete({ where: { id: requirementId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getPitchesByRequirement = async (req: Request, res: Response) => {
    try {
        const { requirementId } = req.params;
        const pitches = await prisma.pitch.findMany({ 
            where: { jobRequirementId: requirementId },
            include: {
                doctor: {
                    include: {
                        profileImage: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ pitches });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const acceptPitch = async (req: Request, res: Response) => {
    try {
        const { pitchId } = req.params;
        const { clinicId, requirementId } = req.body;
        
        // Update pitch status to ACCEPTED
        const pitch = await prisma.pitch.update({ 
            where: { id: pitchId }, 
            data: { status: "ACCEPTED" },
            include: {
                doctor: true
            }
        });
        
        // Create accepted work connection
        await prisma.acceptedWork.create({
            data: {
                doctorId: pitch.doctorId,
                clinicId: clinicId,
                jobId: requirementId
            }
        });
        
        // Optionally update requirement status to COMPLETED if needed
        // await prisma.jobRequirement.update({
        //     where: { id: requirementId },
        //     data: { requirementStatus: "COMPLETED" }
        // });
        
        res.status(200).json({ message: "Pitch accepted successfully", pitch });
    } catch (error) {
        console.error("Error accepting pitch:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const rejectPitch = async (req: Request, res: Response) => {
    try {
        const { pitchId } = req.params;
        const pitch = await prisma.pitch.update({ 
            where: { id: pitchId }, 
            data: { status: "REJECTED" },
            include: {
                doctor: true
            }
        });
        res.status(200).json({ message: "Pitch rejected successfully", pitch });
    } catch (error) {
        console.error("Error rejecting pitch:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getDashboardOverview = async (req: Request, res: Response) => {
    try {
        const { clinicId } = req.params;

        const totalRequirements = await prisma.jobRequirement.count({
            where: { clinicId },
        });

        const requirementsByStatus = await prisma.jobRequirement.groupBy({
            by: ['requirementStatus'],
            where: { clinicId },
            _count: {
                requirementStatus: true,
            }
        });

        const totalPitches = await prisma.pitch.count({
            where: {
                jobRequirement: {
                    clinicId,
                }
            }
        });

        const pitchesByStatus = await prisma.pitch.groupBy({
            by: ['status'],
            where: {
                jobRequirement: {
                    clinicId,
                }
            },
            _count: {
                status: true,
            }
        });

        const recentPitches = await prisma.pitch.findMany({
            where: {
                jobRequirement: {
                    clinicId,
                }
            },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                doctor: {
                    select: {
                        fullName: true,
                        profileImage: {
                            select: {
                                docUrl: true,
                            }
                        }
                    }
                },
                jobRequirement: {
                    select: {
                        title: true,
                    }
                }
            }
        });

        const totalAccepted = await prisma.acceptedWork.count({
            where: { clinicId },
        });

        const latestNews = await prisma.news.findMany({
            take: 3,
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            totalRequirements,
            requirementsByStatus,
            totalPitches,
            pitchesByStatus,
            recentPitches,
            totalAccepted,
            latestNews,
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const getConnections = async (req: Request, res: Response) => {
    try {
        const { clinicId } = req.params;

        const acceptedPitches = await prisma.pitch.findMany({
            where: {
                status: "ACCEPTED",
                jobRequirement: {
                    clinicId,
                }
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        fullName: true,
                        specialization: true,
                        experience: true,
                        profileImage: {
                            select: {
                                docUrl: true,
                            }
                        }
                    }
                },
                jobRequirement: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group pitches by doctor
        const connectionsMap = new Map();

        acceptedPitches.forEach(pitch => {
            const doctorId = pitch.doctor.id;
            if (!connectionsMap.has(doctorId)) {
                connectionsMap.set(doctorId, {
                    doctor: pitch.doctor,
                    acceptedPitches: [],
                    connectionCount: 0,
                    latestConnection: pitch.createdAt,
                });
            }
            connectionsMap.get(doctorId).acceptedPitches.push({
                id: pitch.id,
                jobRequirement: pitch.jobRequirement,
                createdAt: pitch.createdAt,
            });
            connectionsMap.get(doctorId).connectionCount++;
        });

        const connections = Array.from(connectionsMap.values());

        res.status(200).json({ connections });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}