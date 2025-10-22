import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EXPO_URL } from '../config/api';

export default function CommunityScreen({ navigation, route }) {
  const token = route?.params?.token;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace this with your backend URL
  

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(EXPO_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      {/* Top section — profile */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: item.photo
              ? `http://BASE_URL:3000${item.photo}`
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png", // dummy avatar
          }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{item.fullName}</Text>
      </View>

      {/* Content */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Image if available */}
      {item.image && (
        <Image
          source={{ uri: `http://BASE_URL:3000${item.image}` }}
          style={styles.postImage}
        />
      )}

      {/* Like & Comment buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#333" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#333" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#555" />
        <Text>Loading community feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Feed</Text>

      {posts.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: "gray" }}>No posts yet. Be the first!</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postID.toString()}
          renderItem={renderPost}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreatePostScreen", { token })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  postCard: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  profileSection: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontSize: 16, fontWeight: "600" },
  postContent: { fontSize: 15, marginBottom: 8, color: "#333" },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  actionButton: { flexDirection: "row", alignItems: "center" },
  actionText: { marginLeft: 6, fontSize: 14, color: "#333" },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007bff",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
