import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.ts";
import getDistance from "../utils/distance.ts";
import { AppError } from "../utils/app-error.ts";
import { ErrorCode } from "../types/errors.ts";
import { ResponseHelper, asyncHandler } from "../utils/response.ts";
import { QueryBuilder } from "../utils/query-builder.ts";
import { sendBulkMultiChannelNotification, sendMultiChannelNotification } from "../utils/send-notification.ts";

export const getClinics = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit > 100) {
        throw AppError.badRequest(ErrorCode.INVALID_INPUT, "Limit cannot exceed 100");
    }

    const result = await QueryBuilder.getPaginatedClinics({ page, limit });
    
    ResponseHelper.paginated(
        res,
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
        "Clinics retrieved successfully"
    );
});

export const getClinicById = asyncHandler(async (req: Request, res: Response) => {
    const { clinicId } = req.params;
    
    if (!clinicId) {
        throw AppError.badRequest(ErrorCode.MISSING_REQUIRED_FIELD, "Clinic ID is required");
    }

    const clinic = await QueryBuilder.getClinicById(clinicId);
    
    if (!clinic) {
        throw AppError.notFound("Clinic");
    }
    
    const clinicData = {
        ...clinic,
        profileImage: clinic.clinicProfileImage,
        documents: clinic.documents
    };

    ResponseHelper.success(res, clinicData, "Clinic retrieved successfully");
});

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
        const { title, description, type, additionalInformation, specialization, date, clinicId, time } = req.body;
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
                clinicId,
                time
            }
        });

        //find the doctors who have same specialization and requirment's location is within the users preffered radius of the location

        const doctors = await prisma.doctor.findMany({
            where: {
                specialization,
            },
            select: {
                notificationToken: true,
                email: true,
                phoneNumber: true,
                latitude: true,
                longitude: true,
                preferredRadius: true,
            }
        });

        const nearbyDoctors = doctors.filter(doctor=>{
            if (
                doctor.latitude == null ||
                doctor.longitude == null ||
                doctor.preferredRadius == null ||
                !clinic.latitude ||
                !clinic.longitude
            ) {
                return false;
            }

            const distance = getDistance(clinic.latitude, clinic.longitude, doctor.latitude, doctor.longitude);
            return distance <= doctor.preferredRadius
        });

        if (nearbyDoctors.length > 0) {
            const recipients = nearbyDoctors
                .filter(doctor => doctor.notificationToken || doctor.email || doctor.phoneNumber)
                .map(doctor => ({
                    notificationToken: doctor.notificationToken || undefined,
                    email: doctor.email || undefined,
                    phoneNumber: doctor.phoneNumber || undefined,
                }));

            if (recipients.length > 0) {
                await sendBulkMultiChannelNotification(
                    recipients,
                    "New Requirement",
                    `${title} requirement posted near you`,
                    { requirementId: requirement.id }
                );
            }
        }

        res.status(201).json({ requirement });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const updateRequirement = async (req: Request, res: Response) => {
    try {
        const { requirementId } = req.params;
        const { title, description, type, additionalInformation, specialization, date, requirementStatus, clinicId, time } = req.body;

        const requirement = await prisma.jobRequirement.findUnique({ where: { id: requirementId } });

        if (!requirement) {
            return res.status(404).json({ message: "Requirement not found" });
        }

        if (requirement.clinicId !== clinicId) {
            return res.status(403).json({ message: "You are not authorized to update this requirement" });
        }

        const updatedRequirement = await prisma.jobRequirement.update({
            where: { id: requirementId },
            data: { title, description, type, additionalInformation, specialization, date, requirementStatus, time }
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
                doctor: {
                    select: {
                        id: true,
                        fullName: true,
                        notificationToken: true,
                        email: true,
                        phoneNumber: true,
                    }
                },
                jobRequirement: {
                    select: {
                        title: true,
                    }
                }
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
        await prisma.jobRequirement.update({
            where: { id: requirementId },
            data: { requirementStatus: "COMPLETED" }
        });

        // Send multi-channel notification to doctor
        if (pitch.doctor.notificationToken || pitch.doctor.email || pitch.doctor.phoneNumber) {
            await sendMultiChannelNotification(
                {
                    notificationToken: pitch.doctor.notificationToken || undefined,
                    email: pitch.doctor.email || undefined,
                    phoneNumber: pitch.doctor.phoneNumber || undefined,
                },
                `Pitch Accepted`,
                `Your application has been accepted for ${pitch.jobRequirement.title}`,
                { pitchId: pitch.id }
            );
        }
        
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

export const getDashboardOverview = asyncHandler(async (req: Request, res: Response) => {
        const { clinicId } = req.params;

    if (!clinicId) {
        throw AppError.badRequest(ErrorCode.MISSING_REQUIRED_FIELD, "Clinic ID is required");
    }

    // Verify clinic exists
    const clinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
        select: { id: true }
    });

    if (!clinic) {
        throw AppError.notFound("Clinic");
    }

    const overview = await QueryBuilder.getClinicDashboardOverview(clinicId);

    // Get latest news (this is global data)
        const latestNews = await prisma.news.findMany({
            take: 3,
            orderBy: {
                createdAt: 'desc'
        },
        select: {
            id: true,
            title: true,
            content: true,
            imageUrl: true,
            createdAt: true
            }
        });

    ResponseHelper.success(res, {
        ...overview,
        latestNews
    }, "Dashboard overview retrieved successfully");
});

// Document Management
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { clinicId, docUrl, name, type } = req.body;
        
        const document = await prisma.document.create({
            data: {
                docUrl,
                name,
                type,
                clinicId
            }
        });
        
        res.status(201).json({ document });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params;
        
        await prisma.document.delete({
            where: { id: documentId }
        });
        
        res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

// Gallery Management
export const addGalleryImage = async (req: Request, res: Response) => {
    try {
        const { clinicId, imageUrl, caption } = req.body;
        
        const galleryImage = await prisma.clinicGalleryImage.create({
            data: {
                imageUrl,
                caption,
                clinicId
            }
        });
        
        res.status(201).json({ galleryImage });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const updateGalleryImage = async (req: Request, res: Response) => {
    try {
        const { imageId } = req.params;
        const { caption, isActive } = req.body;
        
        const galleryImage = await prisma.clinicGalleryImage.update({
            where: { id: imageId },
            data: {
                ...(caption !== undefined && { caption }),
                ...(isActive !== undefined && { isActive })
            }
        });
        
        res.status(200).json({ galleryImage });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
}

export const deleteGalleryImage = async (req: Request, res: Response) => {
    try {
        const { imageId } = req.params;
        
        await prisma.clinicGalleryImage.delete({
            where: { id: imageId }
        });
        
        res.status(200).json({ message: "Gallery image deleted successfully" });
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

export const getConnectedDoctors = asyncHandler(async (req: Request, res: Response) => {
    const { clinicId } = req.params as { clinicId: string };
    
    // Get doctors who have accepted pitches from this clinic
    const connectedDoctors = await prisma.doctor.findMany({
        where: {
            pitches: {
                some: {
                    status: "ACCEPTED",
                    jobRequirement: {
                        clinicId: clinicId
                    }
                }
            }
        },
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
        },
        orderBy: {
            fullName: 'asc'
        }
    });
    
    ResponseHelper.success(res, connectedDoctors, "Connected doctors fetched successfully");
});


export const getMeetingsByClinic = async (req: Request, res: Response) => {
    try {
        const { clinicId } = req.params;
        const { date } = req.query;
        let meetings = []

        if(typeof(date) === 'string'){
            meetings = await prisma.acceptedWork.findMany({
                where: { 
                    clinicId: clinicId as string, 
                    connectedAt: {
                        gte: new Date(date as string)
                    }
                },
                include: {
                    clinic: {
                        select: {
                            clinicName: true,
                        }
                    },
                    doctor: {
                        select: {
                            fullName: true,
                            specialization: true,
                            profileImage: {
                                select: {
                                    docUrl: true
                                }
                            }
                        }
                    },
                    job: {
                        select: {
                            title: true,
                            date: true,
                            time: true,
                            clinic: {
                                select: {
                                    clinicAddress: true,
                                    latitude: true,
                                    longitude: true
                                }
                            }   
                        }
                    }
                }
            });
        }else{
            meetings = await prisma.acceptedWork.findMany({
                where: { 
                    clinicId: clinicId as string, 
                },
                include: {
                    clinic: {
                        select: {
                            clinicName: true,
                        }
                    },
                    doctor: {
                        select: {
                            fullName: true,
                            specialization: true,
                            profileImage: {
                                select: {
                                    docUrl: true
                                }
                            }
                        }
                    },
                    job: {
                        select: {
                            title: true,
                            date: true,
                            time: true,
                            clinic: {
                                select: {
                                    clinicName: true,
                                    clinicAddress: true,
                                    latitude: true,
                                    longitude: true
                                }
                            }
                        }
                    }
                }
            });
        }
        
        const response = meetings.map((meeting)=>{
            // Format the job date if it exists
            const jobDate = meeting.job.date ? 
                new Date(meeting.job.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : null;

            // Use the time field from the job requirement
            const jobTime = meeting.job.time || null;

            return {
                id: meeting.id,
                title: meeting.job.title,
                clinic: meeting.clinic.clinicName,
                doctor: {
                    fullName: meeting.doctor.fullName,
                    specialization: meeting.doctor.specialization,
                    profileImage: meeting.doctor.profileImage?.docUrl || null
                },
                jobDate: jobDate,
                jobTime: jobTime,
                jobLocation: meeting.job.clinic.clinicAddress,
                jobLatitude: meeting.job.clinic.latitude,
                jobLongitude: meeting.job.clinic.longitude,
            }
        })
        res.status(200).json({ meetings: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
}