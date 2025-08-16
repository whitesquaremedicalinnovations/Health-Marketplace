import { prisma } from "../utils/prisma.js";
import { getDoctor, getClinic, getDoctorById, getClinicById } from "../utils/get-user.js";
export const onboardingDoctor = async (req, res) => {
    const { doctorId, email, fullName, gender, dateOfBirth, phoneNumber, address, specialization, additionalInformation, experience, about, certifications, profileImage, documents, locationRange, location, preferredRadius } = req.body;
    try {
        const doctor = await getDoctor(email);
        if (doctor) {
            return res.status(400).json({ message: "Doctor already exists" });
        }
        // Create the doctor first
        const newDoctor = await prisma.doctor.create({
            data: {
                id: doctorId,
                email,
                fullName,
                gender,
                dateOfBirth: new Date(dateOfBirth),
                phoneNumber,
                address,
                specialization,
                additionalInformation,
                experience: Number(experience),
                about,
                certifications: certifications || [],
                locationRange: Number(locationRange),
                latitude: location?.lat || null,
                longitude: location?.lng || null,
                preferredRadius: preferredRadius ? Number(preferredRadius) : null,
            }
        });
        // Create profile image if provided
        if (profileImage) {
            const profileDoc = await prisma.document.create({
                data: {
                    docUrl: profileImage,
                    name: `doctor-profile-${doctorId}`,
                    type: "image",
                    doctorId: newDoctor.id,
                }
            });
            // Connect the profile image
            await prisma.doctor.update({
                where: { id: newDoctor.id },
                data: { profileImageId: profileDoc.id }
            });
        }
        // Create additional documents if provided
        if (documents && documents.length > 0) {
            await prisma.document.createMany({
                data: documents.map((document, index) => ({
                    docUrl: document,
                    name: `doctor-document-${doctorId}-${index}`,
                    type: "document",
                    doctorId: newDoctor.id,
                })),
            });
        }
        res.status(200).json({ message: "Doctor onboarded successfully", newDoctor });
    }
    catch (error) {
        console.error("Doctor onboarding error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const onboardingClinic = async (req, res) => {
    console.log("req.body", req.body);
    const { clinicId, email, ownerName, ownerPhoneNumber, clinicName, clinicAddress, clinicPhoneNumber, clinicAdditionalDetails, documents, clinicProfileImage, location, preferredRadius } = req.body;
    const clinic = await getClinic(email);
    if (clinic) {
        return res.status(400).json({ message: "Clinic already exists" });
    }
    const newClinic = await prisma.clinic.create({
        data: {
            id: clinicId,
            email,
            ownerName,
            ownerPhoneNumber,
            clinicName,
            clinicAddress,
            latitude: location?.lat,
            longitude: location?.lng,
            preferredRadius,
            clinicPhoneNumber,
            clinicAdditionalDetails,
            documents: {
                create: documents.map((document) => ({
                    docUrl: document,
                    name: `clinic-document-${clinicId}`,
                    type: "document",
                })),
            },
            clinicProfileImage: clinicProfileImage ? {
                create: {
                    docUrl: clinicProfileImage,
                    name: `clinic-profile-${clinicId}`,
                    type: "image"
                }
            } : undefined,
        }
    });
    console.log("newClinic", newClinic);
    res.status(200).json({ newClinic });
};
export const getProfile = async (req, res) => {
    const { doctorId, clinicId } = req.params;
    const doctor = await getDoctorById(doctorId);
    if (doctor) {
        return res.status(200).json({ doctor });
    }
    const clinic = await getClinicById(clinicId);
    if (clinic) {
        return res.status(200).json({ clinic });
    }
    return res.status(400).json({ message: "Doctor or clinic not found" });
};
export const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const doctorId = userId;
    const clinicId = userId;
    const { role, // 'DOCTOR' or 'CLINIC'
    email, fullName, gender, dateOfBirth, phoneNumber, address, latitude, longitude, specialization, additionalInformation, experience, about, certifications, ownerName, clinicName, clinicAddress, clinicPhoneNumber, clinicAdditionalDetails, profileImage, // optional, uploaded image URL
     } = req.body;
    try {
        // Update user email if present (only for doctors, clinics handle email differently)
        if (email && role === "DOCTOR") {
            await prisma.doctor.update({
                where: { id: doctorId },
                data: { email },
            });
        }
        if (role === "DOCTOR") {
            // Upload profile image as Document and connect
            let profileImageId;
            if (profileImage) {
                const doc = await prisma.document.create({
                    data: {
                        docUrl: profileImage,
                        name: `doctor-profile-${doctorId}`,
                        type: "image",
                        doctor: {
                            connect: { id: doctorId },
                        },
                    },
                });
                profileImageId = doc.id;
            }
            // Build update data object only with provided fields
            const updateData = {};
            if (fullName !== undefined)
                updateData.fullName = fullName;
            if (gender !== undefined)
                updateData.gender = gender;
            if (dateOfBirth !== undefined)
                updateData.dateOfBirth = new Date(dateOfBirth);
            if (phoneNumber !== undefined)
                updateData.phoneNumber = phoneNumber;
            if (address !== undefined)
                updateData.address = address;
            if (specialization !== undefined)
                updateData.specialization = specialization;
            if (additionalInformation !== undefined)
                updateData.additionalInformation = additionalInformation;
            if (experience !== undefined)
                updateData.experience = Number(experience);
            if (about !== undefined)
                updateData.about = about;
            if (certifications !== undefined)
                updateData.certifications = certifications;
            if (profileImageId) {
                updateData.profileImage = {
                    connect: { id: profileImageId },
                };
            }
            const updatedDoctor = await prisma.doctor.update({
                where: { id: doctorId },
                data: updateData,
                include: {
                    profileImage: true,
                },
            });
            return res.status(200).json({
                message: "Doctor profile updated successfully",
                doctor: updatedDoctor,
            });
        }
        else if (role === "CLINIC") {
            // Upload profile image as Document and connect
            let clinicProfileImageId;
            if (profileImage) {
                const doc = await prisma.document.create({
                    data: {
                        docUrl: profileImage,
                        name: `clinic-profile-${clinicId}`,
                        type: "image",
                        clinic: {
                            connect: { id: clinicId },
                        },
                    },
                });
                clinicProfileImageId = doc.id;
            }
            const updatedClinic = await prisma.clinic.update({
                where: { id: clinicId },
                data: {
                    ownerName,
                    clinicName,
                    clinicAddress,
                    ...(latitude !== undefined && { latitude: Number(latitude) }),
                    ...(longitude !== undefined && { longitude: Number(longitude) }),
                    clinicPhoneNumber,
                    clinicAdditionalDetails,
                    ownerPhoneNumber: phoneNumber,
                    ...(clinicProfileImageId && {
                        clinicProfileImage: {
                            connect: { id: clinicProfileImageId },
                        },
                    }),
                },
                include: {
                    clinicProfileImage: true,
                },
            });
            return res.status(200).json({
                message: "Clinic profile updated successfully",
                clinic: updatedClinic,
            });
        }
        else {
            return res.status(400).json({ error: "Invalid role" });
        }
    }
    catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};
export const updateDocuments = async (req, res) => {
    const { userId } = req.params;
    const { documents } = req.body; // Array of document URLs
    try {
        // Create documents and link to doctor
        const createdDocuments = await Promise.all(documents.map((docUrl, index) => prisma.document.create({
            data: {
                docUrl,
                name: `doctor-document-${userId}-${index}`,
                type: "document",
                doctor: {
                    connect: { id: userId },
                },
            },
        })));
        return res.status(200).json({
            message: "Documents uploaded successfully",
            documents: createdDocuments,
        });
    }
    catch (error) {
        console.error("Update Documents Error:", error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};
export const deleteDocument = async (req, res) => {
    const { userId, documentId } = req.params;
    try {
        // Verify document belongs to user
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                doctorId: userId,
            },
        });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        // Delete document
        await prisma.document.delete({
            where: { id: documentId },
        });
        return res.status(200).json({
            message: "Document deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete Document Error:", error);
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
};
export const getNews = async (req, res) => {
    try {
        const news = await prisma.news.findMany({
            include: {
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ news });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const getNewsById = async (req, res) => {
    try {
        const { newsId } = req.params;
        const news = await prisma.news.findUnique({
            where: { id: newsId },
            include: {
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    }
                },
                likes: {
                    include: {
                        clinic: true,
                        doctor: true
                    }
                }
            }
        });
        res.status(200).json({ news });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const likeNews = async (req, res) => {
    try {
        const { newsId } = req.params;
        const { clinicId, doctorId } = req.body;
        // Ensure at least one is present
        if (!clinicId && !doctorId) {
            return res.status(400).json({ message: "User not identified" });
        }
        // Check if like already exists
        const existingLike = await prisma.newsLike.findFirst({
            where: {
                newsId,
                ...(clinicId && { clinicId }),
                ...(doctorId && { doctorId }),
            }
        });
        // If already liked, remove it
        if (existingLike) {
            await prisma.newsLike.delete({ where: { id: existingLike.id } });
            return res.status(200).json({ message: "Unliked" });
        }
        // Create the like
        await prisma.newsLike.create({
            data: {
                ...(clinicId && {
                    clinic: {
                        connect: { id: clinicId }
                    }
                }),
                ...(doctorId && {
                    doctor: {
                        connect: { id: doctorId }
                    }
                }),
                news: {
                    connect: { id: newsId }
                }
            }
        });
        res.status(200).json({ message: "Liked" });
    }
    catch (error) {
        console.error("Error in likeNews:", error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};
export const commentOnNews = async (req, res) => {
    try {
        const { newsId } = req.params;
        const { content, clinicId, doctorId, parentId } = req.body;
        if (!clinicId && !doctorId) {
            return res.status(400).json({ message: "User not identified" });
        }
        const comment = await prisma.newsComment.create({
            data: {
                content,
                ...(clinicId && {
                    clinic: { connect: { id: clinicId } }
                }),
                ...(doctorId && {
                    doctor: { connect: { id: doctorId } }
                }),
                ...(parentId && { parent: { connect: { id: parentId } } }),
                news: { connect: { id: newsId } }
            }
        });
        res.status(201).json({ comment });
    }
    catch (error) {
        console.error("Error in commentOnNews:", error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};
export const getNewsComments = async (req, res) => {
    try {
        const { newsId } = req.params;
        const comments = await prisma.newsComment.findMany({
            where: { newsId, parentId: null },
            include: {
                clinic: {
                    select: {
                        clinicName: true,
                        clinicProfileImage: {
                            select: {
                                docUrl: true
                            }
                        }
                    }
                },
                doctor: {
                    select: {
                        fullName: true,
                        profileImage: {
                            select: {
                                docUrl: true
                            }
                        }
                    }
                },
                replies: {
                    include: {
                        clinic: {
                            select: {
                                clinicName: true,
                                clinicProfileImage: {
                                    select: {
                                        docUrl: true
                                    }
                                }
                            }
                        },
                        doctor: {
                            select: {
                                fullName: true,
                                profileImage: {
                                    select: {
                                        docUrl: true
                                    }
                                }
                            }
                        },
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({ comments });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
export const checkUserExists = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await prisma.doctor.findUnique({
            where: { id }
        });
        const clinic = await prisma.clinic.findUnique({
            where: { id }
        });
        res.status(200).json({ doctor, clinic });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
