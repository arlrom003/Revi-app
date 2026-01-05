import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Authorization': `Bearer ${session.access_token}`
  };
};

export const uploadFile = async (formData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_URL}/upload-file`, formData, {
    headers: { ...headers, 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const generateFlashcards = async (text, numCards = 10) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_URL}/generate-flashcards`, 
    { text, numCards }, 
    { headers }
  );
  return response.data;
};

export const createDeck = async (deckData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_URL}/decks`, deckData, { headers });
  return response.data.deck;
};

export const getDecks = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/decks`, { headers });
  return response.data;
};

export const getDeck = async (id) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/decks/${id}`, { headers });
  return response.data;
};

export const getCards = async (deckId) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/decks/${deckId}`, { headers });
  return response.data;
};

export const saveReviewSession = async (sessionData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_URL}/review-sessions`, sessionData, { headers });
  return response.data;
};


export const getDashboard = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/dashboard`, { headers });
  return response.data;
};

export const getHistory = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/history`, { headers });
  return response.data;
};
