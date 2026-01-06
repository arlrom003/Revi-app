// src/pages/NewDeck.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFile, createDeck, createCard } from "../services/api";

export default function NewDeck() {
  const [mode, setMode] = useState("upload");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [manualCards, setManualCards] = useState([
    { question: "", answer: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAddManualCard = () => {
    setManualCards([...manualCards, { question: "", answer: "" }]);
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
      setError("");

      if (!name.trim()) {
        throw new Error("Please enter a deck name.");
      }

      let cardsToCreate = [];

      if (mode === "upload") {
        if (!file) throw new Error("Please select a file.");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("numCards", 10);

        const uploadRes = await uploadFile(formData);
        cardsToCreate = uploadRes.flashcards || [];
      } else {
        cardsToCreate = manualCards.filter(
          (c) => c.question.trim() && c.answer.trim()
        );
      }

      if (!cardsToCreate || cardsToCreate.length === 0) {
        throw new Error("No cards to create. Please add at least one card.");
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
      console.error("Error creating deck:", err);
      setError(err.message || "Failed to create deck.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create new deck</h1>
          <p className="text-sm text-gray-600">
            Upload material for AI flashcards or enter cards manually.
          </p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
            mode === "upload"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 bg-white hover:border-indigo-200"
          }`}
        >
          <span className="text-xl mb-1">📤</span>
          <span className="text-sm font-semibold text-gray-900">
            Upload AI
          </span>
          <span className="text-xs text-gray-600 mt-1">
            Upload a PDF or DOCX and let Revi generate flashcards for you.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
            mode === "manual"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 bg-white hover:border-indigo-200"
          }`}
        >
          <span className="text-xl mb-1">✏️</span>
          <span className="text-sm font-semibold text-gray-900">
            Manual cards
          </span>
          <span className="text-xs text-gray-600 mt-1">
            Type your own questions and answers for full control.
          </span>
        </button>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        {/* Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-800">
            Name
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-800">
            Description
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What is this deck about?"
          />
        </div>

        {/* Upload mode */}
        {mode === "upload" && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-800">
              Upload file (PDF, DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              Revi will extract text and generate up to 10 flashcards.
            </p>
          </div>
        )}

        {/* Manual mode */}
        {mode === "manual" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-800">
                Manual flashcards
              </label>
              <button
                type="button"
                onClick={handleAddManualCard}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                + Add card
              </button>
            </div>

            {manualCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2"
              >
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Question"
                  value={card.question}
                  onChange={(e) =>
                    handleManualChange(idx, "question", e.target.value)
                  }
                />
                <textarea
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Answer"
                  rows={2}
                  value={card.answer}
                  onChange={(e) =>
                    handleManualChange(idx, "answer", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create deck"}
        </button>
      </form>
    </div>
  );
}
