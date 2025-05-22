import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { supabase } from './supabaseClient';
import { jlptWords } from './data/jlptWords';

export default function App() {
  const [cards, setCards] = useState(jlptWords);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [mode, setMode] = useState<'practice' | 'test' | 'review'>('practice');
  const [testCards, setTestCards] = useState<any[]>([]);
  const [wrongCards, setWrongCards] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [choices, setChoices] = useState<string[]>([]);
  const [newCard, setNewCard] = useState({
    japanese: '',
    romaji: '',
    english: '',
    category: 'N5',
  });

  const fetchUserFlashcards = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('User fetch error:', userError.message);
      return;
    }

    if (user) {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user flashcards:', error.message);
      } else {
        setCards([...jlptWords, ...data]);
      }
    }
  };

  useEffect(() => {
    fetchUserFlashcards();
  }, []);

  useEffect(() => {
    if (mode === 'test' && filteredCards.length >= 10) {
      const shuffled = [...filteredCards].sort(() => Math.random() - 0.5).slice(0, 10);
      setTestCards(shuffled);
      setWrongCards([]);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedChoice(null);
      setShowResult(false);
    }
  }, [mode, selectedLevel]);

  const filteredCards = selectedLevel
    ? cards.filter(card => card.category === selectedLevel)
    : cards;

  const currentCard =
    (mode === 'test' || mode === 'review') && testCards.length > currentQuestion
      ? testCards[currentQuestion]
      : filteredCards[currentQuestion % filteredCards.length];

  const generateChoices = (correct: string) => {
    const incorrect = cards
      .filter(c => c.english !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.english);
    return [...incorrect, correct].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if ((mode === 'test' || mode === 'review') && currentCard) {
      setChoices(generateChoices(currentCard.english));
    }
  }, [currentCard]);

  const handleChoice = (choice: string) => {
    setSelectedChoice(choice);
    if (choice === currentCard.english) {
      setScore(score + 1);
    } else {
      setWrongCards(prev => [...prev, currentCard]);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < testCards.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedChoice(null);
      } else {
        setShowResult(true);
      }
    }, 500);
  };

  const handleRestart = () => {
    setMode('practice');
    setSelectedChoice(null);
    setShowResult(false);
    setCurrentQuestion(0);
  };

  const handleReviewMistakes = () => {
    if (wrongCards.length === 0) {
      Alert.alert('No mistakes to review yet!');
      return;
    }
    setTestCards(wrongCards);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedChoice(null);
    setShowResult(false);
    setMode('review');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Alert.alert('Logged out!');
  };

  const handleAddCard = async () => {
    console.log('🚀 handleAddCard triggered');
    console.log('New card:', newCard);

    if (!newCard.japanese || !newCard.romaji || !newCard.english || !newCard.category) {
      Alert.alert('Please fill out all fields');
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      console.error('⚠️ No user:', userError?.message || 'Not logged in');
      Alert.alert('Not logged in');
      return;
    }

    const { error: insertError } = await supabase.from('flashcards').insert([
      {
        user_id: user.id,
        japanese: newCard.japanese,
        romaji: newCard.romaji,
        english: newCard.english,
        category: newCard.category,
      },
    ]);

    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
      Alert.alert('Error: ' + insertError.message);
    } else {
      console.log('✅ Card added to DB');
      Alert.alert('Flashcard added!');
      setNewCard({ japanese: '', romaji: '', english: '', category: 'N5' });
      fetchUserFlashcards(); // refresh after insert
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ position: 'absolute', top: 40, left: 20, zIndex: 10 }}>
        <Button title="Logout" onPress={handleLogout} />
      </View>

      <Text style={styles.title}>Flashcard App ({mode.toUpperCase()} MODE)</Text>

      <View style={styles.modeButtons}>
        <Button title="Practice Mode" onPress={() => setMode('practice')} />
        <Button title="Test Mode" onPress={() => setMode('test')} />
        <Button title="Review Mistakes" onPress={handleReviewMistakes} />
      </View>

      <View style={styles.levelButtons}>
        {['N5', 'N4', 'N3'].map(level => (
          <Button key={level} title={level} onPress={() => setSelectedLevel(level)} />
        ))}
        <Button title="All" onPress={() => setSelectedLevel(null)} />
      </View>

      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Add Your Own Flashcard</Text>

        <TextInput
          placeholder="Japanese"
          value={newCard.japanese}
          onChangeText={text => setNewCard({ ...newCard, japanese: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Romaji"
          value={newCard.romaji}
          onChangeText={text => setNewCard({ ...newCard, romaji: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="English"
          value={newCard.english}
          onChangeText={text => setNewCard({ ...newCard, english: text })}
          style={styles.input}
        />
        <TextInput
          placeholder="Category (e.g., N5)"
          value={newCard.category}
          onChangeText={text => setNewCard({ ...newCard, category: text })}
          style={styles.input}
        />
        <Button title="Add Flashcard" onPress={handleAddCard} />
      </View>

      {(mode === 'test' || mode === 'review') && showResult ? (
        <View>
          <Text style={styles.result}>You scored {score} / {testCards.length}</Text>
          <Button title="Back to Practice" onPress={handleRestart} />
        </View>
      ) : (mode === 'test' || mode === 'review') && currentCard && choices.length > 0 ? (
        <View>
          <Text style={styles.japanese}>{currentCard.japanese}</Text>
          {choices.map(choice => (
            <TouchableOpacity
              key={choice}
              style={[
                styles.choice,
                selectedChoice === choice &&
                (choice === currentCard.english ? styles.correct : styles.wrong),
              ]}
              onPress={() => handleChoice(choice)}
              disabled={!!selectedChoice}
            >
              <Text>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : mode === 'practice' ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.japanese}>{currentCard.japanese}</Text>
          <Text style={styles.romaji}>{currentCard.romaji}</Text>
          <Text style={styles.english}>{currentCard.english}</Text>
          <Button
            title="Next"
            onPress={() => setCurrentQuestion((prev) => (prev + 1) % filteredCards.length)}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: 250,
  },
  japanese: { fontSize: 36, fontWeight: 'bold', marginVertical: 20 },
  romaji: { fontSize: 20, color: '#888', marginBottom: 8 },
  english: { fontSize: 20, color: '#333' },
  modeButtons: { flexDirection: 'row', marginBottom: 10, justifyContent: 'space-around', width: '100%' },
  levelButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  choice: { backgroundColor: '#eee', padding: 12, borderRadius: 8, marginVertical: 5 },
  correct: { backgroundColor: '#a4f9a4' },
  wrong: { backgroundColor: '#f9a4a4' },
  result: { fontSize: 20, fontWeight: 'bold', marginVertical: 20 },
});
