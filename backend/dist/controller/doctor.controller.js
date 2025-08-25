import { prisma } from "../utils/prisma.js";
import getDistance from "../utils/distance.js";
import { ResponseHelper, asyncHandler } from "../utils/response.js";
import { AppError } from "../utils/app-error.js";
import { ErrorCode } from "../types/errors.js";
export const getDoctors = async (req, res) => {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                profileImage: true,
            }
        });
        res.status(200).json({ doctors });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getDoctorById = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            include: {
                profileImage: true,
                documents: true,
                pitches: {
                    include: {
                        jobRequirement: {
                            include: {
                                clinic: {
                                    select: {
                                        clinicName: true,
                                    }
                                }
                            }
                        }
                    }
                },
                accepted: {
                    include: {
                        clinic: {
                            select: {
                                clinicName: true,
                                clinicProfileImage: true,
                            }
                        },
                        job: {
                            select: {
                                title: true,
                                type: true,
                            }
                        }
                    }
                }
            }
        });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        const doctorData = {
            ...doctor,
            profileImage: doctor.profileImage ? doctor.profileImage.docUrl : null,
        };
        res.status(200).json({ doctor: doctorData });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getClinicsByLocation = async (req, res) => {
    try {
        const { lat, lng, radius, sortBy, location } = req.query;
        let clinics = await prisma.clinic.findMany({
            include: {
                clinicProfileImage: true,
                jobRequirements: {
                    where: {
                        requirementStatus: 'POSTED'
                    }
                },
                _count: {
                    select: {
                        jobRequirements: {
                            where: {
                                requirementStatus: 'POSTED'
                            }
                        }
                    }
                }
            }
        });
        // Filter by location if provided
        if (location) {
            clinics = clinics.filter(clinic => clinic.clinicAddress.toLowerCase().includes(location.toLowerCase()) ||
                clinic.clinicName.toLowerCase().includes(location.toLowerCase()));
        }
        // Filter by radius if lat, lng, and radius are provided
        if (lat && lng && radius) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const searchRadius = parseFloat(radius);
            clinics = clinics.filter(clinic => {
                if (clinic.latitude && clinic.longitude) {
                    const distance = getDistance(latitude, longitude, clinic.latitude, clinic.longitude);
                    return distance <= searchRadius;
                }
                return false;
            });
        }
        // Sort clinics
        switch (sortBy) {
            case 'date_desc':
                clinics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'jobs_desc':
                clinics.sort((a, b) => b._count.jobRequirements - a._count.jobRequirements);
                break;
            case 'name_asc':
                clinics.sort((a, b) => a.clinicName.localeCompare(b.clinicName));
                break;
            case 'name_desc':
                clinics.sort((a, b) => b.clinicName.localeCompare(a.clinicName));
                break;
            default:
                clinics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        const clinicsData = clinics.map(clinic => ({
            id: clinic.id,
            owner: {
                email: clinic.email,
                ownerName: clinic.ownerName,
                ownerPhoneNumber: clinic.ownerPhoneNumber,
            },
            clinicName: clinic.clinicName,
            clinicAddress: clinic.clinicAddress,
            latitude: clinic.latitude,
            longitude: clinic.longitude,
            profileImage: clinic.clinicProfileImage ? clinic.clinicProfileImage.docUrl : null,
            activeJobs: clinic._count.jobRequirements,
            jobRequirements: clinic.jobRequirements.slice(0, 3), // Show only first 3 jobs
        }));
        res.status(200).json({ clinics: clinicsData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getRequirementsByLocation = async (req, res) => {
    try {
        const { lat, lng, radius, sortBy, specialization, type, search, doctorId, experienceLevel } = req.query;
        let requirements = await prisma.jobRequirement.findMany({
            where: {
                requirementStatus: 'POSTED'
            },
            include: {
                clinic: {
                    include: {
                        clinicProfileImage: true,
                    }
                },
                _count: {
                    select: {
                        pitches: true
                    }
                },
                pitches: doctorId ? {
                    where: {
                        doctorId: doctorId
                    }
                } : false
            }
        });
        // Filter out jobs the doctor has already applied to
        if (doctorId) {
            requirements = requirements.filter(req => req.pitches.length === 0);
        }
        // Filter by specialization (support multiple specializations)
        if (specialization && specialization !== 'all') {
            const specializations = specialization.split(',');
            requirements = requirements.filter(req => req.specialization && specializations.includes(req.specialization));
        }
        // Filter by type
        if (type && type !== 'all') {
            requirements = requirements.filter(req => req.type === type);
        }
        // Filter by search term
        if (search) {
            requirements = requirements.filter(req => req.title.toLowerCase().includes(search.toLowerCase()) ||
                req.description.toLowerCase().includes(search.toLowerCase()) ||
                req.clinic.clinicName.toLowerCase().includes(search.toLowerCase()));
        }
        // Filter by location radius if provided
        if (lat && lng && radius) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const searchRadius = parseFloat(radius);
            requirements = requirements.filter(req => {
                if (req.clinic.latitude && req.clinic.longitude) {
                    const distance = getDistance(latitude, longitude, req.clinic.latitude, req.clinic.longitude);
                    return distance <= searchRadius;
                }
                return false;
            });
        }
        // Sort requirements
        switch (sortBy) {
            case 'date_desc':
                requirements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'date_asc':
                requirements.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'applications_desc':
                requirements.sort((a, b) => b._count.pitches - a._count.pitches);
                break;
            case 'applications_asc':
                requirements.sort((a, b) => a._count.pitches - b._count.pitches);
                break;
            case 'type_asc':
                requirements.sort((a, b) => a.type.localeCompare(b.type));
                break;
            default:
                requirements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        const requirementsData = requirements.map(req => ({
            id: req.id,
            title: req.title,
            description: req.description,
            type: req.type,
            specialization: req.specialization,
            location: req.location,
            date: req.date,
            additionalInformation: req.additionalInformation,
            createdAt: req.createdAt,
            clinic: {
                id: req.clinic.id,
                clinicName: req.clinic.clinicName,
                clinicAddress: req.clinic.clinicAddress,
                profileImage: req.clinic.clinicProfileImage ? req.clinic.clinicProfileImage.docUrl : null,
                latitude: req.clinic.latitude,
                longitude: req.clinic.longitude,
            },
            applicationsCount: req._count.pitches,
        }));
        res.status(200).json({ requirements: requirementsData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const pitchRequirement = async (req, res) => {
    try {
        const { requirementId } = req.params;
        const { message, doctorId } = req.body;
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        // Check if doctor already applied
        const existingPitch = await prisma.pitch.findFirst({
            where: {
                doctorId: doctor.id,
                jobRequirementId: requirementId
            }
        });
        if (existingPitch) {
            return res.status(400).json({ message: "You have already applied for this position" });
        }
        const pitch = await prisma.pitch.create({
            data: {
                doctorId: doctor.id,
                jobRequirementId: requirementId,
                message
            },
            include: {
                jobRequirement: {
                    include: {
                        clinic: {
                            select: {
                                clinicName: true,
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({ message: "Application submitted successfully", pitch });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const rejectRequirement = async (req, res) => {
    try {
        const { requirementId } = req.params;
        const { doctorId } = req.body;
        // This could be used to track rejected requirements for analytics
        // For now, we'll just return success
        res.status(200).json({ message: "Requirement marked as not interested" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getMyPitches = async (req, res) => {
    try {
        const { doctorId } = req.query;
        if (!doctorId) {
            return res.status(400).json({ message: "Doctor ID is required" });
        }
        const pitches = await prisma.pitch.findMany({
            where: { doctorId: doctorId },
            include: {
                jobRequirement: {
                    include: {
                        clinic: {
                            select: {
                                id: true,
                                clinicName: true,
                                clinicAddress: true,
                                clinicProfileImage: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const pitchesData = pitches.map(pitch => ({
            id: pitch.id,
            message: pitch.message,
            status: pitch.status,
            createdAt: pitch.createdAt,
            jobRequirement: {
                id: pitch.jobRequirement.id,
                title: pitch.jobRequirement.title,
                description: pitch.jobRequirement.description,
                type: pitch.jobRequirement.type,
                specialization: pitch.jobRequirement.specialization,
                location: pitch.jobRequirement.location,
                clinic: {
                    ...pitch.jobRequirement.clinic,
                    profileImage: pitch.jobRequirement.clinic.clinicProfileImage ?
                        pitch.jobRequirement.clinic.clinicProfileImage.docUrl : null,
                }
            }
        }));
        res.status(200).json({ pitches: pitchesData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const withdrawPitch = async (req, res) => {
    try {
        const { pitchId } = req.params;
        const { doctorId } = req.body;
        const pitch = await prisma.pitch.findUnique({
            where: { id: pitchId }
        });
        if (!pitch) {
            return res.status(404).json({ message: "Application not found" });
        }
        if (pitch.doctorId !== doctorId) {
            return res.status(403).json({ message: "You are not authorized to withdraw this application" });
        }
        if (pitch.status === 'ACCEPTED') {
            return res.status(400).json({ message: "Cannot withdraw an accepted application" });
        }
        const updatedPitch = await prisma.pitch.update({
            where: { id: pitchId },
            data: { status: 'WITHDRAWN' }
        });
        res.status(200).json({ message: "Application withdrawn successfully", pitch: updatedPitch });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getMyAcceptedPitches = asyncHandler(async (req, res) => {
    const { doctorId } = req.query;
    if (!doctorId) {
        throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, "Doctor ID is required");
    }
    const acceptedWork = await prisma.acceptedWork.findMany({
        where: { doctorId: doctorId },
        include: {
            clinic: {
                select: {
                    id: true,
                    clinicName: true,
                    clinicAddress: true,
                    clinicPhoneNumber: true,
                    clinicProfileImage: {
                        select: {
                            docUrl: true
                        }
                    }
                }
            },
            job: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    type: true,
                    specialization: true,
                    location: true,
                    additionalInformation: true,
                    createdAt: true,
                }
            }
        },
        orderBy: {
            connectedAt: 'desc'
        }
    });
    const uniqueClinicsMap = new Map();
    for (const work of acceptedWork) {
        if (!uniqueClinicsMap.has(work.clinic.id)) {
            uniqueClinicsMap.set(work.clinic.id, work);
        }
    }
    const uniqueConnectionsData = Array.from(uniqueClinicsMap.values()).map(work => ({
        id: work.id,
        connectedAt: work.connectedAt,
        clinic: {
            ...work.clinic,
            profileImage: work.clinic.clinicProfileImage?.docUrl || null,
        },
        job: work.job, // or you can remove job if you're only interested in clinics
    }));
    ResponseHelper.success(res, { connections: uniqueConnectionsData }, "Connected clinics fetched successfully");
});
// Add a dashboard overview for doctors
export const getDoctorDashboardOverview = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const totalApplications = await prisma.pitch.count({
            where: { doctorId },
        });
        const applicationsByStatus = await prisma.pitch.groupBy({
            by: ['status'],
            where: { doctorId },
            _count: {
                status: true,
            }
        });
        const totalConnections = await prisma.acceptedWork.count({
            where: { doctorId },
        });
        const recentApplications = await prisma.pitch.findMany({
            where: { doctorId },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                jobRequirement: {
                    include: {
                        clinic: {
                            select: {
                                clinicName: true,
                                clinicProfileImage: true,
                            }
                        }
                    }
                }
            }
        });
        const availableJobs = await prisma.jobRequirement.count({
            where: {
                requirementStatus: 'POSTED'
            }
        });
        const latestNews = await prisma.news.findMany({
            take: 3,
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({
            totalApplications,
            applicationsByStatus,
            totalConnections,
            recentApplications,
            availableJobs,
            latestNews,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getAllDoctors = async (req, res) => {
    try {
        const { sortBy, location } = req.query;
        let doctors = await prisma.doctor.findMany({
            include: {
                profileImage: true,
                accepted: true,
            }
        });
        if (location) {
            doctors = doctors.filter(doctor => doctor.address.toLowerCase().includes(location.toLowerCase()));
        }
        switch (sortBy) {
            case 'date_desc':
                doctors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'acceptances_desc':
                doctors.sort((a, b) => b.accepted.length - a.accepted.length);
                break;
            case 'experience_asc':
                doctors.sort((a, b) => a.experience - b.experience);
                break;
            case 'experience_desc':
                doctors.sort((a, b) => b.experience - a.experience);
                break;
            case 'name_asc':
                doctors.sort((a, b) => a.fullName.localeCompare(b.fullName));
                break;
            case 'name_desc':
                doctors.sort((a, b) => b.fullName.localeCompare(a.fullName));
                break;
            default:
                doctors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        const doctorsData = doctors.map(doctor => ({
            id: doctor.id,
            fullName: doctor.fullName,
            specialization: doctor.specialization,
            experience: doctor.experience,
            latitude: doctor.latitude,
            longitude: doctor.longitude,
            profileImage: doctor.profileImage ? doctor.profileImage.docUrl : null,
        }));
        res.status(200).json({ doctors: doctorsData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getDoctorsByLocationForClinic = async (req, res) => {
    try {
        const { lat, lng, radius, sortBy, search, experience_min, experience_max, specializations } = req.query;
        let doctors = await prisma.doctor.findMany({
            include: {
                profileImage: true,
                accepted: true,
            }
        });
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            doctors = doctors.filter(doctor => doctor.fullName.toLowerCase().includes(searchLower) ||
                doctor.specialization.toLowerCase().includes(searchLower) ||
                doctor.address.toLowerCase().includes(searchLower));
        }
        // Experience filter
        if (experience_min) {
            doctors = doctors.filter(doctor => doctor.experience >= parseInt(experience_min, 10));
        }
        if (experience_max) {
            doctors = doctors.filter(doctor => doctor.experience <= parseInt(experience_max, 10));
        }
        // Specialization filter
        if (specializations && specializations !== 'all') {
            const specializationArray = specializations.split(',').map(s => s.trim());
            doctors = doctors.filter(doctor => specializationArray.includes(doctor.specialization));
        }
        // Location filter
        if (lat && lng && radius) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const searchRadius = parseFloat(radius);
            doctors = doctors.filter(doctor => {
                if (doctor.latitude && doctor.longitude) {
                    const distance = getDistance(latitude, longitude, doctor.latitude, doctor.longitude);
                    return distance <= searchRadius;
                }
                return false;
            });
        }
        // Sorting
        switch (sortBy) {
            case 'experience_asc':
                doctors.sort((a, b) => a.experience - b.experience);
                break;
            case 'experience_desc':
                doctors.sort((a, b) => b.experience - a.experience);
                break;
            case 'name_asc':
                doctors.sort((a, b) => a.fullName.localeCompare(b.fullName));
                break;
            case 'name_desc':
                doctors.sort((a, b) => b.fullName.localeCompare(a.fullName));
                break;
            default: // Nearest by default
                if (lat && lng) {
                    const latitude = parseFloat(lat);
                    const longitude = parseFloat(lng);
                    doctors.sort((a, b) => {
                        const distA = a.latitude && a.longitude ? getDistance(latitude, longitude, a.latitude, a.longitude) : Infinity;
                        const distB = b.latitude && b.longitude ? getDistance(latitude, longitude, b.latitude, b.longitude) : Infinity;
                        return distA - distB;
                    });
                }
                break;
        }
        const doctorsData = doctors.map(doctor => ({
            id: doctor.id,
            fullName: doctor.fullName,
            specialization: doctor.specialization,
            experience: doctor.experience,
            address: doctor.address,
            latitude: doctor.latitude,
            longitude: doctor.longitude,
            profileImage: doctor.profileImage ? doctor.profileImage.docUrl : null,
            distance: lat && lng && doctor.latitude && doctor.longitude ? getDistance(parseFloat(lat), parseFloat(lng), doctor.latitude, doctor.longitude) : undefined,
        }));
        res.status(200).json({ doctors: doctorsData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getMeetings = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;
        let meetings = [];
        if (typeof (date) === 'string') {
            meetings = await prisma.acceptedWork.findMany({
                where: {
                    doctorId: doctorId,
                    connectedAt: {
                        gte: new Date(date)
                    }
                },
                include: {
                    clinic: {
                        select: {
                            clinicName: true,
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
        }
        else {
            meetings = await prisma.acceptedWork.findMany({
                where: {
                    doctorId: doctorId,
                },
                include: {
                    clinic: {
                        select: {
                            clinicName: true,
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
        const response = meetings.map((meeting) => {
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
                jobDate: jobDate,
                jobTime: jobTime,
                jobLocation: meeting.job.clinic.clinicAddress,
                jobLatitude: meeting.job.clinic.latitude,
                jobLongitude: meeting.job.clinic.longitude,
            };
        });
        res.status(200).json({ meetings: response });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
