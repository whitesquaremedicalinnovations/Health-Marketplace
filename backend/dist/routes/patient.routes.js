import { Router } from "express";
import { getPatientsByClinicId, getPatientsByDoctorId, getPatientById, createPatient, assignDoctorToPatient, updatePatient, deAssignDoctorFromPatient, updatePatientStatus, addFeedback, searchPatients, getPatientFeedbacks, deletePatient } from "../controller/patients.controller.js";
const router = Router();
router.get("/get-clinic-patients/:clinicId", getPatientsByClinicId);
router.get("/get-doctor-patients/:doctorId", getPatientsByDoctorId);
router.get("/get-patient-by-id/:patientId", getPatientById);
router.post("/create-patient", createPatient);
router.put("/update-patient/:patientId", updatePatient);
router.patch("/assign-doctor-to-patient/:patientId", assignDoctorToPatient);
router.patch("/de-assign-doctor-from-patient/:patientId", deAssignDoctorFromPatient);
router.patch("/update-patient-status/:patientId", updatePatientStatus);
router.post("/add-feedback/:patientId", addFeedback);
// Additional useful endpoints
router.get("/search-patients/:clinicId", searchPatients);
router.get("/get-patient-feedbacks/:patientId", getPatientFeedbacks);
router.delete("/delete-patient/:patientId", deletePatient);
export default router;
