import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './login';
import FlashcardApp from './FlashcardApp';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return user ? <FlashcardApp /> : <Login onLogin={() => {}} />;
}
