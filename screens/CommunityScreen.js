// CommunityScreen_with_likes_comments.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { EXPO_URL } from "../config/api";

export default function CommunityScreen({ route }) {
  const routeToken = route?.params?.token;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [image, setImage] = useState(null);
  const [authors, setAuthors] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({}); // { postID: true/false }
  const [comments, setComments] = useState({}); // { postID: [comments] }
  const [commentInputs, setCommentInputs] = useState({}); // { postID: text }

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await fetchCurrentUser();
    await fetchPosts();
  };

  const getToken = async () => {
    if (routeToken) return routeToken;
    return await AsyncStorage.getItem("token");
  };

  const fetchCurrentUser = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${EXPO_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCurrentUserId(data?.profileID || data?.id || data?._id || null);
    } catch (err) {
      console.log("fetchCurrentUser err:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("No token found");

      const res = await fetch(`${EXPO_URL}/community/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const textBody = await res.text();
      let data;
      try {
        data = JSON.parse(textBody);
      } catch {
        data = textBody;
      }

      if (!res.ok) throw new Error(`Failed to fetch posts: ${JSON.stringify(data)}`);
      const postsArray = Array.isArray(data) ? data : [];

      setPosts(postsArray);

      // fetch authors if needed (re-use your existing logic)
      const uniqueAuthorIds = new Set();
      postsArray.forEach((p) => {
        const id = p.profileID || p.profileId || null;
        if (id) uniqueAuthorIds.add(id);
      });
      await Promise.all(Array.from(uniqueAuthorIds).map((id) => fetchAuthor(id, token)));
    } catch (err) {
      console.log("❌ Fetch error:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthor = async (authorId, token) => {
    if (!authorId || authors[authorId]) return;
    try {
      const res = await fetch(`${EXPO_URL}/profile/${authorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setAuthors((prev) => ({ ...prev, [authorId]: { username: data.username || data.fullName || data.name, fullName: data.fullName || data.name, photo: data.photo } }));
    } catch (err) {
      console.log("fetchAuthor err:", err);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Permission to access photos is required to pick images.");
        return;
      }

      const mediaTypes =
        (ImagePicker?.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images) ||
        (ImagePicker?.MediaType && ImagePicker.MediaType.Images) ||
        undefined;

      const result = await ImagePicker.launchImageLibraryAsync({
        ...(mediaTypes ? { mediaTypes } : {}),
        allowsEditing: true,
        quality: 0.7,
      });

      const cancelled = result?.canceled ?? result?.cancelled;
      if (cancelled) return;
      const uri = result?.assets?.[0]?.uri ?? result?.uri;
      if (uri) setImage(uri);
    } catch (err) {
      console.log("pickImage error:", err);
      Alert.alert("Error", "Failed to open image picker.");
    }
  };

  // Create post
  const handleAddPost = async () => {
    if (!newPostText.trim() && !image) return;
    try {
      const token = await getToken();
      if (!token) return Alert.alert("Error", "No token available");
      const formData = new FormData();
      formData.append("content", newPostText);
      if (image) {
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : "jpg";
        formData.append("image", { uri: image, name: filename, type: `image/${ext}` });
      }

      const res = await fetch(`${EXPO_URL}/community/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const txt = await res.text();
      console.log("handleAddPost status:", res.status, "body:", txt);
      if (!res.ok) throw new Error(txt || "Failed to add post");
      setNewPostText("");
      setImage(null);
      fetchPosts();
    } catch (err) {
      console.log("❌ Add post error:", err.message || err);
      Alert.alert("Error", err.message || "Failed to add post");
    }
  };

  // Toggle like
  const handleToggleLike = async (postID, likedByMe) => {
    try {
      const token = await getToken();
      if (!token) return;
      // optimistic UI update
      setPosts(prev =>
        prev.map(p =>
          p.postID === postID ? { ...p, likedByMe: !likedByMe, likeCount: (p.likeCount || 0) + (likedByMe ? -1 : 1) } : p
        )
      );

      const res = await fetch(`${EXPO_URL}/community/posts/${postID}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Like failed");
      }
      // backend toggled successfully — fetch fresh counts if you want:
      // fetchPosts();
    } catch (err) {
      console.log("like err:", err);
      Alert.alert("Error", err.message || "Failed to toggle like");
      // revert UI on error
      fetchPosts();
    }
  };

  // Comments: fetch
  const fetchComments = async (postID) => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${EXPO_URL}/community/posts/${postID}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to fetch comments");
      }
      const data = await res.json();
      setComments(prev => ({ ...prev, [postID]: data }));
    } catch (err) {
      console.log("fetchComments err:", err);
      Alert.alert("Error", err.message || "Failed to fetch comments");
    }
  };

  // Toggle expand comments (and fetch when opening)
  const toggleComments = async (postID) => {
    const isOpen = !!expandedComments[postID];
    if (!isOpen) {
      await fetchComments(postID);
    }
    setExpandedComments(prev => ({ ...prev, [postID]: !isOpen }));
  };

  // Post a comment
  const handlePostComment = async (postID) => {
    try {
      const text = (commentInputs[postID] || "").trim();
      if (!text) return;
      const token = await getToken();
      const res = await fetch(`${EXPO_URL}/community/posts/${postID}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Comment failed");
      }
      // clear input & refresh comments and counts
      setCommentInputs(prev => ({ ...prev, [postID]: "" }));
      await fetchComments(postID);
      await fetchPosts();
    } catch (err) {
      console.log("post comment err:", err);
      Alert.alert("Error", err.message || "Failed to post comment");
    }
  };

  const renderPost = ({ item, index }) => {
    const postID = item.postID || item.id || String(index);
    const authorId = item.profileID || item.profileId || null;
    const author = authors[authorId];
    const username = author?.username || item?.fullName || "Anonymous";
    const imageUri = item?.image ? (item.image.startsWith("http") ? item.image : `${EXPO_URL}${item.image}`) : null;
    const likeCount = item.likeCount || 0;
    const commentCount = item.commentCount || 0;
    const likedByMe = !!item.likedByMe;
    const isOwner = currentUserId && authorId && String(currentUserId) === String(authorId);

    return (
      <View style={styles.postCard} key={postID}>
        {/* Header with user info */}
        <View style={styles.postHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.timestamp}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Today"}
              </Text>
            </View>
          </View>
          {isOwner && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Delete post", "Are you sure you want to delete this post?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDeletePost(postID, authorId),
                  },
                ])
              }
            >
              <Text style={styles.deleteBtn}>⋮</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Post content */}
        {item.content ? <Text style={styles.postText}>{item.content}</Text> : null}
        {imageUri && <Image source={{ uri: imageUri }} style={styles.postImage} />}

        {/* Actions row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleLike(postID, likedByMe)}
          >
            <Text style={styles.actionIcon}>{likedByMe ? "❤️" : "🤍"}</Text>
            <Text style={[styles.actionText, likedByMe && styles.actionTextActive]}>
              {likeCount} {likeCount === 1 ? "Like" : "Likes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleComments(postID)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>
              {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments section */}
        {expandedComments[postID] && (
          <View style={styles.commentsSection}>
            <View style={styles.commentsDivider} />
            
            {(comments[postID] || []).length > 0 ? (
              <ScrollView style={styles.commentsList} nestedScrollEnabled>
                {(comments[postID] || []).map((c) => (
                  <View key={c.commentID} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {(c.fullName || "U").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentContent}>
                      <Text style={styles.commentAuthor}>{c.fullName || "User"}</Text>
                      <Text style={styles.commentText}>{c.comment}</Text>
                      <Text style={styles.commentTime}>
                        {new Date(c.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noComments}>No comments yet. Be the first!</Text>
            )}

            {/* Comment input */}
            <View style={styles.commentInputContainer}>
              <TextInput
                placeholder="Write a comment..."
                placeholderTextColor="#95a5a6"
                value={commentInputs[postID] || ""}
                onChangeText={(t) => setCommentInputs(prev => ({ ...prev, [postID]: t }))}
                style={styles.commentInput}
                multiline
              />
              <TouchableOpacity 
                onPress={() => handlePostComment(postID)} 
                style={styles.sendButton}
                disabled={!(commentInputs[postID] || "").trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Deleting post (re-use your earlier handler — kept minimal here)
  const handleDeletePost = async (postId, postAuthorId) => {
    try {
      if (!currentUserId || String(currentUserId) !== String(postAuthorId)) return Alert.alert("Error", "Not allowed");
      const token = await getToken();
      const res = await fetch(`${EXPO_URL}/community/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Delete failed");
      }
      fetchPosts();
      Alert.alert("Success", "Post deleted successfully");
    } catch (err) {
      console.log("delete err:", err);
      Alert.alert("Error", err.message || "Failed to delete");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏔️ Trek Community</Text>
          <Text style={styles.headerSubtitle}>Share your adventures</Text>
        </View>

        {/* New post card */}
        <View style={styles.newPostCard}>
          <TextInput
            style={styles.newPostInput}
            placeholder="Share your trekking experience..."
            placeholderTextColor="#95a5a6"
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
          />
          
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageBtn} 
                onPress={() => setImage(null)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.newPostActions}>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              <Text style={styles.imagePickerIcon}>📷</Text>
              <Text style={styles.imagePickerText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.postButton, (!newPostText.trim() && !image) && styles.postButtonDisabled]} 
              onPress={handleAddPost}
              disabled={!newPostText.trim() && !image}
            >
              <Text style={styles.postButtonText}>Share Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27ae60" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🌲</Text>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share your trek!</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.postID || item.id || item._id || Math.random())}
            renderItem={renderPost}
            contentContainerStyle={styles.postsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f5e9",
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
  newPostCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newPostInput: {
    fontSize: 15,
    color: "#2c3e50",
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 12,
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  newPostActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imagePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f4",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a8d5ba",
  },
  imagePickerIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  imagePickerText: {
    color: "#27ae60",
    fontSize: 15,
    fontWeight: "600",
  },
  postButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  postButtonDisabled: {
    backgroundColor: "#95a5a6",
    shadowOpacity: 0,
    elevation: 0,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  postsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#27ae60",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  deleteBtn: {
    fontSize: 24,
    color: "#95a5a6",
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  postText: {
    fontSize: 15,
    color: "#34495e",
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  actionTextActive: {
    color: "#e74c3c",
  },
  commentsSection: {
    marginTop: 12,
  },
  commentsDivider: {
    height: 1,
    backgroundColor: "#ecf0f1",
    marginBottom: 12,
  },
  commentsList: {
    maxHeight: 300,
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#a8d5ba",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  commentAvatarText: {
    color: "#2d5e3d",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#f8faf9",
    padding: 10,
    borderRadius: 10,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 11,
    color: "#95a5a6",
  },
  noComments: {
    textAlign: "center",
    color: "#95a5a6",
    fontSize: 14,
    fontStyle: "italic",
    marginVertical: 12,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8faf9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d5e8dd",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: "#2c3e50",
    maxHeight: 80,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#27ae60",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#7f8c8d",
  },
});