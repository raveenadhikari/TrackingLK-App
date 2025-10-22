import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import { EXPO_URL } from '../config/api';
export default function ProfileScreen({ route }) {
  const token = route?.params?.token;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${EXPO_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setForm({
        fullName: res.data.fullName || '',
        bio: res.data.bio || '',
        location: res.data.location || '',
        birthDate: res.data.birthDate || '',
        gender: res.data.gender || '',
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImageAndUpload = async () => {
  // Request permission
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permission required', 'We need permission to access your photos.');
    return;
  }

  // ✅ Use the new API (result.assets[0].uri)
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: [ImagePicker.MediaType.Images], // ✅ use new enum
    allowsEditing: true,
    quality: 0.8,
  });

  // ✅ New API uses result.canceled
  if (result.canceled) return;

  const localUri = result.assets[0].uri; // ✅ fixed
  const filename = localUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1] : 'jpg';
  const formData = new FormData();

  formData.append('photo', {
    uri: localUri,
    name: `photo.${ext}`,
    type: `image/${ext}`,
  });

  try {
    setUploading(true);
    const res = await axios.post(`${EXPO_URL}/profile/me/photo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ important
        'Content-Type': 'multipart/form-data',
      },
    });

    // ✅ Server returns { photo: '/uploads/file.jpg' }
    const photoPath = res.data.photo;
    setProfile(prev => ({ ...prev, photo: photoPath }));

    Alert.alert('Success', 'Photo uploaded successfully');
  } catch (err) {
    console.error('Upload error:', err);
    Alert.alert('Upload error', err.response?.data?.message || err.message);
  } finally {
    setUploading(false);
  }
};

  const saveProfile = async () => {
    try {
      setLoading(true);
      await axios.put(`${EXPO_URL}/profile/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Profile updated');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      Alert.alert('Update error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" /></View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{form.fullName ? form.fullName : 'Your Profile'}</Text>

      <View style={styles.photoWrap}>
        {profile?.photo ? (
          <Image source={{ uri: `${EXPO_URL}${profile.photo}` }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.greenButton} onPress={pickImageAndUpload} disabled={uploading}>
        <Text style={styles.greenButtonText}>{uploading ? 'Uploading...' : 'Change Photo'}</Text>
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} value={form.fullName} onChangeText={v => setForm({ ...form, fullName: v })} editable={editing} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={form.bio} onChangeText={v => setForm({ ...form, bio: v })} editable={editing} multiline />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={form.location} onChangeText={v => setForm({ ...form, location: v })} editable={editing} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Gender</Text>
        <TextInput style={styles.input} value={form.gender} onChangeText={v => setForm({ ...form, gender: v })} editable={editing} />
      </View>

      <View style={styles.actions}>
        {editing ? (
          <>
            <TouchableOpacity style={styles.greenButton} onPress={saveProfile}>
              <Text style={styles.greenButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.grayButton} onPress={() => { setEditing(false); setForm({ ...form, ...profile }); }}>
              <Text style={styles.grayButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.greenButton} onPress={() => setEditing(true)}>
              <Text style={styles.greenButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.grayButton} onPress={() => { /* optional logout */ }}>
              <Text style={styles.grayButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: 'gray' }}>Email: {route?.params?.email || '—'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  photoWrap: { marginBottom: 12 },
  photo: { width: 140, height: 140, borderRadius: 70 },
  placeholder: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#999' },
  field: { width: '100%', marginTop: 10 },
  label: { color: '#666', marginBottom: 6 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#fafafa' },
  actions: { marginTop: 16, width: '100%', alignItems: 'center' },
  greenButton: { backgroundColor: '#28a745', paddingVertical: 12, borderRadius: 10, width: '90%', alignItems: 'center', marginVertical: 6 },
  greenButtonText: { color: '#fff', fontWeight: 'bold' },
  grayButton: { backgroundColor: '#e0e0e0', paddingVertical: 12, borderRadius: 10, width: '90%', alignItems: 'center', marginVertical: 6 },
  grayButtonText: { color: '#333', fontWeight: '600' },
});