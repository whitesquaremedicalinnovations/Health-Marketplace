import { prisma } from './prisma.ts';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class QueryBuilder {
  // Optimized clinic queries
  static async getClinicById(clinicId: string) {
    return await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: {
        id: true,
        clinicName: true,
        clinicAddress: true,
        clinicPhoneNumber: true,
        clinicAdditionalDetails: true,
        latitude: true,
        longitude: true,
        ownerName: true,
        ownerPhoneNumber: true,
        email: true,
        isVerified: true,
        createdAt: true,
        clinicProfileImage: {
          select: {
            docUrl: true
          }
        },
        documents: {
          select: {
            id: true,
            docUrl: true,
            name: true
          },
          take: 10 // Limit documents
        },
        // Get job requirements with minimal data
        jobRequirements: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            specialization: true,
            date: true,
            location: true,
            requirementStatus: true,
            createdAt: true,
            additionalInformation: true,
            _count: {
              select: {
                pitches: true
              }
            }
          },
          where: {
            requirementStatus: 'POSTED'
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        galleryImages: {
          select: {
            id: true,
            imageUrl: true,
            caption: true
          },
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 6 // Limit gallery images
        }
      }
    });
  }

  static async getDoctorById(doctorId: string) {
    return await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        email: true,
        fullName: true,
        gender: true,
        dateOfBirth: true,
        phoneNumber: true,
        address: true,
        latitude: true,
        longitude: true,
        specialization: true,
        additionalInformation: true,
        experience: true,
        about: true,
        certifications: true,
        isVerified: true,
        createdAt: true,
        profileImage: {
          select: {
            docUrl: true
          }
        },
        documents: {
          select: {
            id: true,
            docUrl: true,
            name: true,
            type: true
          },
          take: 10
        },
        // Get recent pitches with minimal data
        pitches: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            jobRequirement: {
              select: {
                title: true,
                clinic: {
                  select: {
                    clinicName: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        // Get accepted work
        accepted: {
          select: {
            id: true,
            connectedAt: true,
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
            job: {
              select: {
                title: true,
                type: true
              }
            }
          }
        }
      }
    });
  }

  // Paginated queries
  static async getPaginatedClinics(options: PaginationOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        select: {
          id: true,
          clinicName: true,
          clinicAddress: true,
          latitude: true,
          longitude: true,
          isVerified: true,
          clinicProfileImage: {
            select: {
              docUrl: true
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
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.clinic.count()
    ]);

    return {
      data: clinics,
      meta: {
        total,
        page,
        limit,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  static async getPaginatedDoctors(options: PaginationOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        select: {
          id: true,
          fullName: true,
          specialization: true,
          experience: true,
          latitude: true,
          longitude: true,
          isVerified: true,
          profileImage: {
            select: {
              docUrl: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.doctor.count()
    ]);

    return {
      data: doctors,
      meta: {
        total,
        page,
        limit,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  static async getPaginatedJobRequirements(clinicId?: string, options: PaginationOptions = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where = clinicId ? { clinicId } : {};

    const [requirements, total] = await Promise.all([
      prisma.jobRequirement.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          specialization: true,
          date: true,
          location: true,
          requirementStatus: true,
          createdAt: true,
          clinic: {
            select: {
              id: true,
              clinicName: true,
              clinicAddress: true,
              clinicProfileImage: {
                select: {
                  docUrl: true
                }
              }
            }
          },
          _count: {
            select: {
              pitches: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.jobRequirement.count({ where })
    ]);

    return {
      data: requirements,
      meta: {
        total,
        page,
        limit,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Optimized dashboard queries
  static async getClinicDashboardOverview(clinicId: string) {
    const [
      totalRequirements,
      requirementsByStatus,
      totalPitches,
      pitchesByStatus,
      recentPitches,
      totalAccepted
    ] = await Promise.all([
      prisma.jobRequirement.count({
        where: { clinicId }
      }),
      prisma.jobRequirement.groupBy({
        by: ['requirementStatus'],
        where: { clinicId },
        _count: {
          requirementStatus: true
        }
      }),
      prisma.pitch.count({
        where: {
          jobRequirement: {
            clinicId
          }
        }
      }),
      prisma.pitch.groupBy({
        by: ['status'],
        where: {
          jobRequirement: {
            clinicId
          }
        },
        _count: {
          status: true
        }
      }),
      prisma.pitch.findMany({
        where: {
          jobRequirement: {
            clinicId
          }
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
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
          jobRequirement: {
            select: {
              title: true
            }
          }
        }
      }),
      prisma.acceptedWork.count({
        where: { clinicId }
      })
    ]);

    return {
      totalRequirements,
      requirementsByStatus,
      totalPitches,
      pitchesByStatus,
      recentPitches,
      totalAccepted
    };
  }

  static async getDoctorDashboardOverview(doctorId: string) {
    const [
      totalApplications,
      applicationsByStatus,
      totalAccepted,
      recentApplications
    ] = await Promise.all([
      prisma.pitch.count({
        where: { doctorId }
      }),
      prisma.pitch.groupBy({
        by: ['status'],
        where: { doctorId },
        _count: {
          status: true
        }
      }),
      prisma.acceptedWork.count({
        where: { doctorId }
      }),
      prisma.pitch.findMany({
        where: { doctorId },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          jobRequirement: {
            select: {
              title: true,
              type: true,
              clinic: {
                select: {
                  clinicName: true,
                  clinicProfileImage: {
                    select: {
                      docUrl: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    ]);

    return {
      totalApplications,
      applicationsByStatus,
      totalAccepted,
      recentApplications
    };
  }
} 