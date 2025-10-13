import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, SafeAreaView } from 'react-native';
import axios from 'axios';

const EXPLORE_URL = 'http://192.168.1.101:5000';

export default function ExploreScreen({ route, navigation }) {
  const { token } = route.params;
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchExplore();
  }, []);

  const fetchExplore = async () => {
    try {
      const res = await axios.get(`${EXPLORE_URL}/explore`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Explore Items</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
      <Button title="Logout" onPress={() => navigation.navigate('Login')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemTitle: { fontWeight: 'bold', fontSize: 16 },
});
