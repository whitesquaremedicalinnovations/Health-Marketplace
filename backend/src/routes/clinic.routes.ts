import { Router } from "express";   
import { 
    getClinics, 
    getClinicById, 
    getDoctorsByLocation, 
    getRequirementsByClinic, 
    postRequirement, 
    updateRequirement, 
    deleteRequirement, 
    getPitchesByRequirement, 
    acceptPitch, 
    rejectPitch,
    getRequirementById,
    getDashboardOverview,
    getConnections,
    getConnectedDoctors,
    uploadDocument,
    deleteDocument,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
} from "../controller/clinic.controller.ts";
import { getDoctorsByLocationForClinic } from "../controller/doctor.controller.ts";

const router = Router();

router.get("/get-doctors-by-location", getDoctorsByLocationForClinic);
router.get("/get-clinics", getClinics);
router.get("/get-clinic/:clinicId", getClinicById);
router.get("/get-requirements-by-clinic/:clinicId", getRequirementsByClinic);
router.get("/get-requirement/:requirementId", getRequirementById);
router.post("/post-requirement", postRequirement);
router.patch("/update-requirement/:requirementId", updateRequirement);
router.delete("/delete-requirement/:requirementId", deleteRequirement);
router.get("/get-pitches/:requirementId", getPitchesByRequirement);
router.patch("/accept-pitch/:pitchId", acceptPitch);
router.patch("/reject-pitch/:pitchId", rejectPitch);
router.get("/get-dashboard-overview/:clinicId", getDashboardOverview);
router.get("/get-connections/:clinicId", getConnections);
router.get("/connected-doctors/:clinicId", getConnectedDoctors);

// Document routes
router.post("/upload-document", uploadDocument);
router.delete("/delete-document/:documentId", deleteDocument);

// Gallery routes
router.post("/add-gallery-image", addGalleryImage);
router.patch("/update-gallery-image/:imageId", updateGalleryImage);
router.delete("/delete-gallery-image/:imageId", deleteGalleryImage);

export default router;