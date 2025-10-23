// ProfileScreen_Styled.js
import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { EXPO_URL } from "../config/api";

export default function ProfileScreen({ route, navigation }) {
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
        fullName: res.data.fullName || "",
        bio: res.data.bio || "",
        location: res.data.location || "",
        birthDate: res.data.birthDate || "",
        gender: res.data.gender || "",
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImageAndUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Error", "No image selected.");
        return;
      }

      const localUri = asset.uri;
      const filename = localUri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : "jpg";

      const formData = new FormData();
      formData.append("photo", {
        uri: localUri,
        name: `photo.${ext}`,
        type: `image/${ext}`,
      });

      setUploading(true);
      const res = await axios.post(`${EXPO_URL}/profile/me/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.photo) {
        setProfile(prev => ({ ...prev, photo: res.data.photo }));
        Alert.alert("Success", "Photo updated successfully!");
      } else {
        Alert.alert("Upload failed", "Server did not return photo path.");
      }
    } catch (err) {
      console.error("pickImageAndUpload error:", err);
      Alert.alert("Error", err.response?.data?.message || err.message);
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
      Alert.alert("Success", "Profile updated");
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      Alert.alert("Update error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏔️ My Profile</Text>
        <Text style={styles.headerSubtitle}>Trek explorer</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {profile?.photo ? (
              <Image source={{ uri: `${EXPO_URL}${profile.photo}` }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderIcon}>👤</Text>
              </View>
            )}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.changePhotoBtn} 
            onPress={pickImageAndUpload} 
            disabled={uploading}
          >
            <Text style={styles.changePhotoIcon}>📷</Text>
            <Text style={styles.changePhotoText}>
              {uploading ? "Uploading..." : "Change Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Name Display */}
        <Text style={styles.profileName}>
          {form.fullName || "Trekker"}
        </Text>

        {/* Info Fields */}
        <View style={styles.fieldsContainer}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>👤 Full Name</Text>
            <TextInput
              style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
              value={form.fullName}
              onChangeText={v => setForm({ ...form, fullName: v })}
              editable={editing}
              placeholder="Enter your full name"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>📝 Bio</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMultiline, !editing && styles.fieldInputDisabled]}
              value={form.bio}
              onChangeText={v => setForm({ ...form, bio: v })}
              editable={editing}
              multiline
              placeholder="Tell us about your trekking adventures..."
              placeholderTextColor="#95a5a6"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>📍 Location</Text>
            <TextInput
              style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
              value={form.location}
              onChangeText={v => setForm({ ...form, location: v })}
              editable={editing}
              placeholder="Your location"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>⚧ Gender</Text>
            <TextInput
              style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
              value={form.gender}
              onChangeText={v => setForm({ ...form, gender: v })}
              editable={editing}
              placeholder="Your gender"
              placeholderTextColor="#95a5a6"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {editing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>💾 Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditing(false);
                  setForm({
                    fullName: profile.fullName || "",
                    bio: profile.bio || "",
                    location: profile.location || "",
                    birthDate: profile.birthDate || "",
                    gender: profile.gender || "",
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
                <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.logoutButtonText}>🚪 Logout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Footer Spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#e8f5e9",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#27ae60",
  },
  header: {
    backgroundColor: "#2d5e3d",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#a8d5ba",
  },
  profileCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 12,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#27ae60",
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#a8d5ba",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#27ae60",
  },
  photoPlaceholderIcon: {
    fontSize: 60,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a8d5ba",
  },
  changePhotoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  changePhotoText: {
    color: "#27ae60",
    fontSize: 15,
    fontWeight: "600",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  fieldsContainer: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d5e3d",
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: "#f8faf9",
    borderWidth: 1,
    borderColor: "#d5e8dd",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#2c3e50",
  },
  fieldInputMultiline: {
    height: 100,
    textAlignVertical: "top",
  },
  fieldInputDisabled: {
    backgroundColor: "#ecf0f1",
    color: "#7f8c8d",
  },
  actionsContainer: {
    gap: 12,
  },
  editButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ecf0f1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e74c3c",
  },
  logoutButtonText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    height: 20,
  },
});