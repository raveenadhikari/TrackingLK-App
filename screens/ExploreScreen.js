import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { EXPO_URL } from '../config/api';

const EXPLORE_URL = EXPO_URL;

export default function ExploreScreen({ route, navigation }) {
  const { token } = route.params;
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchExplore();
  }, []);

  const fetchExplore = async () => {
    try {
      const res = await axios.get(`${EXPLORE_URL}/explore`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PlaceDetails', { postID: item.postID, token })}
    >
      <View style={styles.post}>
        {item.imageURL && <Image source={{ uri: item.imageURL }} style={styles.photo} />}
        <Text style={styles.placeName}>{item.placeName}</Text>
        <Text style={styles.placeDescription}>{item.placeDescription}</Text>
        {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Explore Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postID.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <Button title="Logout" onPress={() => navigation.navigate('Login')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  post: { padding: 12, borderBottomWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 12, backgroundColor: '#fafafa' },
  photo: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
  placeName: { fontWeight: 'bold', fontSize: 18 },
  placeDescription: { fontSize: 14, color: '#555', marginBottom: 4 },
  caption: { fontSize: 16, marginTop: 4, marginBottom: 4 },
  date: { fontSize: 12, color: '#aaa' },
});
