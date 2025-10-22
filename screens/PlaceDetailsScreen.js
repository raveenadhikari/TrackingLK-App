import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { EXPO_URL } from '../config/api';

const EXPLORE_URL = EXPO_URL;

export default function PlaceDetailsScreen({ route }) {
  const { postID, token } = route.params;
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`${EXPLORE_URL}/explore/${postID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlace(res.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />;
  if (!place) return <Text style={{ textAlign: 'center', marginTop: 20 }}>No details found</Text>;

  return (
    <ScrollView style={styles.container}>
      {place.imageURL && <Image source={{ uri: place.imageURL }} style={styles.image} />}
      <Text style={styles.title}>{place.placeName}</Text>
      <Text style={styles.rating}>⭐ {place.placeRating ?? 'No rating yet'}</Text>
      <Text style={styles.desc}>{place.placeDescription}</Text>
      {place.caption && <Text style={styles.caption}>“{place.caption}”</Text>}
      <Text style={styles.date}>Posted on {new Date(place.createdAt).toLocaleString()}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  rating: { fontSize: 16, color: '#888', marginBottom: 8 },
  desc: { fontSize: 16, marginBottom: 12, color: '#333' },
  caption: { fontSize: 16, fontStyle: 'italic', color: '#555', marginBottom: 12 },
  date: { fontSize: 12, color: '#aaa' },
});
