import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TextInput, Button, Image, TouchableOpacity, Modal } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { getClinic } from '../../lib/utils';
import { axiosInstance } from '../../lib/axios';
import Toast from 'react-native-toast-message';
import { Edit, Save, Camera, Building, Mail, Phone, MapPin, Briefcase, Users, Star, FileText, Upload, Trash2, Plus, Image as ImageIcon, UserIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import GooglePlacesAutocomplete from '@/components/ui/google-places-autocomplete';

interface Clinic {
  id: string;
  email: string;
  ownerName: string;
  ownerPhoneNumber: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string | null;
  profileImage: { docUrl: string } | null;
  documents?: Document[];
  galleryImages?: GalleryImage[];
  reviews?: Review[];
}

interface PlaceDetails {
  formatted_address: string;
}

interface Document {
  id: string;
  docUrl: string;
  name: string;
  type: string;
}

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  doctor: {
    fullName: string;
    profileImage: { docUrl: string } | null;
  };
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  editing: boolean;
  onChange: (value: string) => void;
  multiline?: boolean;
}

export default function ProfileScreen() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Clinic>>({});
  const [saving, setSaving] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [showDeleteDocDialog, setShowDeleteDocDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const response = await getClinic(user.id);
      const clinic = response.data?.success ? response.data.data : response.data.clinic;
      setProfile(clinic || null);
      setEditData(clinic || {});
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const updateData = { ...editData, role: "CLINIC" };
      await axiosInstance.post(`/api/user/profile/update/${user.id}`, updateData);
      await fetchProfile();
      setEditing(false);
      Toast.show({ type: 'success', text1: 'Profile updated!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      Toast.show({ type: 'error', text1: 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const formData = new FormData();
      result.assets.forEach((asset) => {
        formData.append('files', {
          uri: asset.uri,
          name: asset.fileName,
          type: asset.mimeType,
        } as any);
      });

      try {
        const uploadResponse = await axiosInstance.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const documentsToCreate = uploadResponse.data.uploaded.map((uploadedFile: any, index: number) => ({
          clinicId: profile?.id,
          docUrl: uploadedFile.url,
          name: result.assets![index].fileName,
          type: result.assets![index].mimeType,
        }));

        for (const doc of documentsToCreate) {
          await axiosInstance.post('/api/clinic/upload-document', doc);
        }

        await fetchProfile();
        Toast.show({ type: 'success', text1: 'Documents uploaded!' });
      } catch (error) {
        console.error('Error uploading documents:', error);
        Toast.show({ type: 'error', text1: 'Upload failed.' });
      }
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDoc) return;
    try {
      await axiosInstance.delete(`/api/clinic/delete-document/${selectedDoc.id}`);
      await fetchProfile();
      Toast.show({ type: 'success', text1: 'Document deleted.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete document.' });
    } finally {
      setShowDeleteDocDialog(false);
      setSelectedDoc(null);
    }
  };

  const handleGalleryUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const formData = new FormData();
      result.assets.forEach((asset) => {
        formData.append('files', {
          uri: asset.uri,
          name: asset.fileName,
          type: asset.mimeType,
        } as any);
      });

      try {
        const uploadResponse = await axiosInstance.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const imagesToCreate = uploadResponse.data.uploaded.map((uploadedFile: any) => ({
          clinicId: profile?.id,
          imageUrl: uploadedFile.url,
        }));

        for (const image of imagesToCreate) {
          await axiosInstance.post('/api/clinic/add-gallery-image', image);
        }

        await fetchProfile();
        Toast.show({ type: 'success', text1: 'Images uploaded!' });
      } catch (error) {
        console.error('Error uploading images:', error);
        Toast.show({ type: 'error', text1: 'Upload failed.' });
      }
    }
  };

  const handleDeleteGalleryImage = async () => {
    if (!selectedImage) return;
    try {
      await axiosInstance.delete(`/api/clinic/delete-gallery-image/${selectedImage.id}`);
      await fetchProfile();
      Toast.show({ type: 'success', text1: 'Image deleted.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to delete image.' });
    } finally {
      setShowDeleteImageDialog(false);
      setSelectedImage(null);
    }
  };


  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" />;
  }

  if (!profile) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>Could not load profile.</Text>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ padding: 24, backgroundColor: '#3b82f6', borderRadius: 16, marginBottom: 16, alignItems: 'center' }}>
          <Image source={{ uri: profile.profileImage?.docUrl }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'white' }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 12 }}>{profile.clinicName}</Text>
          <Text style={{ color: 'white', opacity: 0.8 }}>{profile.ownerName}</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}>
            {editing ? <Save size={16} color="#3b82f6" /> : <Edit size={16} color="#3b82f6" />}
            <Text style={{ color: '#3b82f6', marginLeft: 8, fontWeight: 'bold' }}>{saving ? 'Saving...' : editing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {/* Clinic Info */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Clinic Information</Text>
          <InfoRow icon={<Building size={20} color="gray" />} label="Clinic Name" value={editData.clinicName} editing={editing} onChange={(val: string) => setEditData({...editData, clinicName: val})} />
          {editing ? (
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <MapPin size={20} color="gray" />
                <Text style={{ marginLeft: 8, color: 'gray' }}>Address</Text>
              </View>
              <GooglePlacesAutocomplete
                onPlaceSelect={(details: PlaceDetails) => {
                  if (details?.formatted_address) {
                    setEditData({ ...editData, clinicAddress: details.formatted_address });
                  }
                }}
              />
            </View>
          ) : (
            <InfoRow icon={<MapPin size={20} color="gray" />} label="Address" value={editData.clinicAddress} editing={editing} onChange={(val: string) => setEditData({...editData, clinicAddress: val})} multiline />
          )}
          <InfoRow icon={<Phone size={20} color="gray" />} label="Phone" value={editData.clinicPhoneNumber} editing={editing} onChange={(val: string) => setEditData({...editData, clinicPhoneNumber: val})} />
          <InfoRow icon={<Building size={20} color="gray" />} label="About" value={editData.clinicAdditionalDetails} editing={editing} onChange={(val: string) => setEditData({...editData, clinicAdditionalDetails: val})} multiline />
        </View>

        {/* Owner Info */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Owner Information</Text>
          <InfoRow icon={<UserIcon size={20} color="gray" />} label="Owner Name" value={editData.ownerName} editing={editing} onChange={(val: string) => setEditData({...editData, ownerName: val})} />
          <InfoRow icon={<Mail size={20} color="gray" />} label="Email" value={profile.email} editing={false} onChange={() => {}} />
          <InfoRow icon={<Phone size={20} color="gray" />} label="Owner Phone" value={editData.ownerPhoneNumber} editing={editing} onChange={(val: string) => setEditData({...editData, ownerPhoneNumber: val})} />
        </View>

        {/* Documents */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Documents</Text>
            <TouchableOpacity onPress={handleDocumentUpload}>
              <Upload size={22} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          {profile.documents?.map(doc => (
            <View key={doc.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 6 }}>
              <FileText size={20} color="gray" />
              <Text style={{ flex: 1, marginLeft: 8 }}>{doc.name}</Text>
              <TouchableOpacity onPress={() => { setSelectedDoc(doc); setShowDeleteDocDialog(true); }}>
                <Trash2 size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Modal visible={showDeleteDocDialog} transparent>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Delete Document</Text>
              <Text style={{ marginVertical: 10 }}>Are you sure you want to delete {selectedDoc?.name}?</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                <Button title="Cancel" onPress={() => setShowDeleteDocDialog(false)} />
                <View style={{width: 10}}/>
                <Button title="Delete" color="red" onPress={handleDeleteDocument} />
              </View>
            </View>
          </View>
        </Modal>

        {/* Gallery */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Gallery</Text>
            <TouchableOpacity onPress={handleGalleryUpload}>
              <Plus size={22} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
            {profile.galleryImages?.map(img => (
              <View key={img.id} style={{ position: 'relative', width: '30%', margin: '1.66%' }}>
                <Image source={{ uri: img.imageUrl }} style={{ width: '100%', height: 100, borderRadius: 8 }} />
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 2 }}
                  onPress={() => { setSelectedImage(img); setShowDeleteImageDialog(true); }}
                >
                  <Trash2 size={16} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Reviews</Text>
          {profile.reviews?.map(review => (
            <View key={review.id} style={{ marginTop: 12, padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: review.doctor.profileImage?.docUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                <Text style={{ fontWeight: 'bold', marginLeft: 8 }}>{review.doctor.fullName}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} color={i < review.rating ? 'gold' : 'gray'} />)}
              </View>
              <Text>{review.comment}</Text>
            </View>
          ))}
        </View>

        <Modal visible={showDeleteImageDialog} transparent>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Delete Image</Text>
              <Text style={{ marginVertical: 10 }}>Are you sure you want to delete this image?</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                <Button title="Cancel" onPress={() => setShowDeleteImageDialog(false)} />
                <View style={{width: 10}}/>
                <Button title="Delete" color="red" onPress={handleDeleteGalleryImage} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const InfoRow = ({ icon, label, value, editing, onChange, multiline = false }: InfoRowProps) => (
  <View style={{ marginBottom: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
      {icon}
      <Text style={{ marginLeft: 8, color: 'gray' }}>{label}</Text>
    </View>
    <TextInput
      style={{
        padding: 8,
        borderWidth: editing ? 1 : 0,
        borderColor: '#ddd',
        borderRadius: 6,
        backgroundColor: editing ? 'white' : '#f0f4f8',
      }}
      value={value || ''}
      onChangeText={(text) => onChange(text)}
      editable={editing}
      multiline={multiline}
    />
  </View>
); 