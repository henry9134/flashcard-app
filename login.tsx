import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { supabase } from './supabaseClient';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (isSignUp: boolean) => {
    setError('');
    const method = isSignUp ? 'signUp' : 'signInWithPassword';

    const { data, error } = await supabase.auth[method]({
      email,
      password,
    });

    if (error) {
      console.error('❌ Supabase Auth Error:', error.message);
      setError(error.message);
    } else {
      console.log('✅ Supabase Auth Success:', data);
      onLogin(); // optional now
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login or Sign Up</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="LOGIN" onPress={() => handleAuth(false)} />
      <View style={{ height: 10 }} />
      <Button title="SIGN UP" onPress={() => handleAuth(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
});
