export var ErrorCode;
(function (ErrorCode) {
    // Authentication & Authorization
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    // Validation
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["MISSING_REQUIRED_FIELD"] = "MISSING_REQUIRED_FIELD";
    // Resource Management
    ErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ErrorCode["RESOURCE_ALREADY_EXISTS"] = "RESOURCE_ALREADY_EXISTS";
    ErrorCode["RESOURCE_CONFLICT"] = "RESOURCE_CONFLICT";
    // Business Logic
    ErrorCode["DOCTOR_ALREADY_EXISTS"] = "DOCTOR_ALREADY_EXISTS";
    ErrorCode["CLINIC_ALREADY_EXISTS"] = "CLINIC_ALREADY_EXISTS";
    ErrorCode["ALREADY_APPLIED"] = "ALREADY_APPLIED";
    ErrorCode["INVALID_OPERATION"] = "INVALID_OPERATION";
    ErrorCode["PITCH_NOT_PENDING"] = "PITCH_NOT_PENDING";
    // Database
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["QUERY_FAILED"] = "QUERY_FAILED";
    // External Services
    ErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCode["FILE_UPLOAD_ERROR"] = "FILE_UPLOAD_ERROR";
    // Internal
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
})(ErrorCode || (ErrorCode = {}));
