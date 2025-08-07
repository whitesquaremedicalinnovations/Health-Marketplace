"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  experience: number;
  profileImage: string | null;
  about: string;
  certifications: string[];
}

interface Requirement {
    id: string;
    title: string;
    requirementStatus: string;
}

interface AcceptedPitch {
    id: string;
    jobRequirement: {
        id: string;
        title: string;
        type: string;
        createdAt: string;
    };
    createdAt: string;
}

interface Connection {
    doctor: {
        id: string;
    }
    acceptedPitches: AcceptedPitch[];
}

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [acceptedPitches, setAcceptedPitches] = useState<AcceptedPitch[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const isFromConnections = searchParams.get('from') === 'connections';

  useEffect(() => {
    const fetchDoctor = async () => {
      const response = await axiosInstance.get(`/api/doctor/get-doctor/${doctorId}`);
      setDoctor(response.data.doctor);
      setLoading(false);
    };

    const fetchRequirements = async () => {
        if(userId){
            const response = await axiosInstance.get(`/api/clinic/get-requirements-by-clinic/${userId}`);
            setRequirements(response.data.requirements.filter((req: Requirement) => req.requirementStatus === 'POSTED'));
            console.log(response.data.requirements)
        }
    }

    const fetchAcceptedPitches = async () => {
        if(userId && isFromConnections) {
            const response = await axiosInstance.get(`/api/clinic/get-connections/${userId}`);
            const connections = response.data.connections;
            const connection = connections.find((conn: Connection) => conn.doctor.id === doctorId);
            if(connection) {
                setAcceptedPitches(connection.acceptedPitches);
            }
        }
    }

    if (doctorId) {
      fetchDoctor();
      fetchRequirements();
      fetchAcceptedPitches();
    }
  }, [doctorId, userId, isFromConnections]);

  const handlePitch = async () => {
    await axiosInstance.post(`/api/doctor/pitch-requirement/${selectedRequirement}`, {
        message,
        doctorId,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return <div>Doctor not found</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardContent className="p-8 flex flex-col lg:flex-row items-center gap-8">
          <ProfileAvatar
            src={doctor.profileImage}
            fallback={doctor.fullName[0]}
            size="xl"
            profileId={doctor.id}
            profileType="doctor"
            className="h-40 w-40"
          />
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold">{doctor.fullName}</h1>
            <p className="text-xl text-muted-foreground mt-2">
              {doctor.specialization}
            </p>
            <p className="text-lg text-muted-foreground mt-1">
              {doctor.experience} years of experience
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4">Pitch Requirement</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pitch a Requirement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Select onValueChange={setSelectedRequirement}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a requirement" />
                        </SelectTrigger>
                        <SelectContent>
                            {requirements.map(req => (
                                <SelectItem key={req.id} value={req.id}>{req.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Textarea placeholder="Add a message (optional)" value={message} onChange={e => setMessage(e.target.value)} />
                    <Button onClick={handlePitch}>Send Pitch</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <Card>
            <CardHeader>
                <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{doctor.about}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside">
                    {doctor.certifications.map(cert => (
                        <li key={cert}>{cert}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>
      {isFromConnections && acceptedPitches.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Accepted Pitches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {acceptedPitches.map((pitch) => (
                  <div key={pitch.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-bold">{pitch.jobRequirement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Type: {pitch.jobRequirement.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Accepted on: {new Date(pitch.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">Accepted</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}