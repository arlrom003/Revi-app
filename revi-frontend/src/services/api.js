// frontend/src/services/api.js
import axios from "axios";
import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL; // e.g. "http://localhost:3000/api"

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  return {
    Authorization: `Bearer ${session.access_token}`,
    "X-User-Id": session.user.id,
  };
};

// Upload & AI
export const uploadFile = async (formData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_URL}/upload-file`, formData, {
    headers: {
      ...headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const generateFlashcards = async (text, numCards = 10) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_URL}/generate-flashcards`,
    { text, numCards },
    { headers }
  );
  return response.data;
};

// Decks
export const createDeck = async (deckData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_URL}/decks`, deckData, {
    headers,
  });
  return response.data.deck || response.data;
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

export const deleteDeck = async (deckId) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_URL}/decks/${deckId}`, {
    headers,
  });
  return response.data;
};

export const bulkDeleteDecks = async (deckIds) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_URL}/decks`, {
    headers,
    data: { deckIds },
  });
  return response.data;
};

// Cards
export const createCard = async (cardData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_URL}/cards`, cardData, {
    headers,
  });
  return response.data.card || response.data;
};

export const getCards = async (deckId) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/decks/${deckId}`, {
    headers,
  });
  return response.data;
};

// Reviews
export const saveReviewSession = async (sessionData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_URL}/review-sessions`,
    sessionData,
    { headers }
  );
  return response.data;
};

// Analytics
export const getDashboard = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/analytics/dashboard`, {
    headers,
  });
  return response.data;
};

export const getAnalyticsOverview = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/analytics/overview`, {
    headers,
  });
  return response.data;
};

export const getHistory = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/analytics/history`, {
    headers,
  });
  return response.data;
};
