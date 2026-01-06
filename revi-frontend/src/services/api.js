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

// History from reviews.js: GET /api/history returns an array
export const getHistory = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/history`, {
    headers,
  });
  return response.data; // plain array
};
export const changePassword = async (newPassword) => {
  // Supabase client-side update password for signed-in user [web:23]
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return { success: true };
};

export const deleteAccount = async (confirmText) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_URL}/account`, {
    headers,
    data: { confirmText },
  });
  return response.data;
};
