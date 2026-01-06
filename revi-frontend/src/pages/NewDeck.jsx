import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, generateFlashcards, createDeck, createCard } from '../services/api';

export default function NewDeck() {
  const [mode, setMode] = useState('upload');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [manualCards, setManualCards] = useState([{ question: '', answer: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddManualCard = () => {
    setManualCards([...manualCards, { question: '', answer: '' }]);
  };

  const handleManualChange = (index, field, value) => {
    const next = [...manualCards];
    next[index][field] = value;
    setManualCards(next);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      if (!name.trim()) {
        throw new Error('Please enter a deck name.');
      }

      let cardsToCreate = [];

      if (mode === 'upload') {
        if (!file) throw new Error('Please select a file.');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('numCards', 10);
        
        const uploadRes = await uploadFile(formData);
        cardsToCreate = uploadRes.flashcards || [];
      } else if (mode === 'ai') {
        if (!rawText.trim()) throw new Error('Please paste some text.');
        
        const aiRes = await generateFlashcards(rawText, 10);
        cardsToCreate = aiRes.flashcards || [];
      } else {
        cardsToCreate = manualCards.filter(c => c.question.trim() && c.answer.trim());
      }

      if (!cardsToCreate || cardsToCreate.length === 0) {
        throw new Error('No cards to create. Please add at least one card.');
      }

      const deck = await createDeck({ name, description });

      for (const cardData of cardsToCreate) {
        await createCard({
          deck_id: deck.id,
          question: cardData.question,
          answer: cardData.answer,
        });
      }

      navigate(`/decks/${deck.id}`);
    } catch (err) {
      console.error('Error creating deck:', err);
      setError(err.message || 'Failed to create deck.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 mb-2">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-2">Create New Deck</h1>
      <p className="text-gray-600">
        Choose how you want to create this deck: upload, use AI, or enter cards manually.
      </p>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1 rounded ${mode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          📤 Upload AI
        </button>
        <button
          type="button"
          onClick={() => setMode('ai')}
          className={`px-3 py-1 rounded ${mode === 'ai' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          ✨ Paste Text AI
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`px-3 py-1 rounded ${mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          ✏️ Manual
        </button>
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {mode === 'upload' && (
          <div>
            <label className="block text-sm font-medium mb-1">Upload file (PDF, DOCX)</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        )}

        {mode === 'ai' && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Paste text for AI to generate flashcards
            </label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Manual flashcards</label>
              <button
                type="button"
                onClick={handleAddManualCard}
                className="text-sm text-blue-600"
              >
                + Add Card
              </button>
            </div>
            {manualCards.map((card, idx) => (
              <div key={idx} className="border rounded p-3 space-y-2 bg-gray-50">
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="Question"
                  value={card.question}
                  onChange={(e) => handleManualChange(idx, 'question', e.target.value)}
                />
                <textarea
                  className="w-full border rounded px-2 py-1 text-sm"
                  placeholder="Answer"
                  rows={2}
                  value={card.answer}
                  onChange={(e) => handleManualChange(idx, 'answer', e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Deck'}
        </button>
      </form>
    </div>
  );
}
