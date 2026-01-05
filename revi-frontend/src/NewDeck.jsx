// src/NewDeck.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadFile,
  generateFlashcards,
  createDeck,
  createCard,
} from "./services/api";

const MODES = [
  { id: "upload", label: "Upload file" },
  { id: "ai", label: "Use AI with text" },
  { id: "manual", label: "Enter manually" },
];

export default function NewDeck() {
  const [mode, setMode] = useState("upload"); // "upload" | "ai" | "manual"
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState("");
  const [manualCards, setManualCards] = useState([
    { question: "", answer: "" },
  ]);
  const [previewCards, setPreviewCards] = useState([]);
  const [generating, setGenerating] = useState(false);
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

  const handleGeneratePreview = async () => {
    try {
      setError("");
      setGenerating(true);
      let cards = [];

      if (mode === "upload") {
        if (!file) throw new Error("Please select a file.");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("numCards", "10");
        const uploadRes = await uploadFile(formData);
        cards = uploadRes.flashcards || [];
      } else if (mode === "ai") {
        if (!rawText.trim()) throw new Error("Please paste some text.");
        const aiRes = await generateFlashcards(rawText, 10);
        cards = aiRes.flashcards || [];
      } else {
        cards = manualCards.filter(
          (c) => c.question.trim() && c.answer.trim()
        );
      }

      if (!cards.length) {
        throw new Error("No cards generated. Try adding more content.");
      }

      setPreviewCards(cards);
    } catch (err) {
      console.error("Error generating preview:", err);
      setPreviewCards([]);
      setError(err.message || "Failed to generate cards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      if (!name.trim()) {
        throw new Error("Please enter a deck name.");
      }

      // If no preview yet, generate once (for upload/ai)
      if ((mode === "upload" || mode === "ai") && previewCards.length === 0) {
        await handleGeneratePreview();
        if (previewCards.length === 0) {
          throw new Error("No cards to create yet.");
        }
      }

      let cardsToCreate = [];

      if (mode === "manual") {
        cardsToCreate = manualCards.filter(
          (c) => c.question.trim() && c.answer.trim()
        );
        if (!cardsToCreate.length) {
          throw new Error("Add at least one card.");
        }
      } else {
        cardsToCreate = previewCards;
      }

      // 1) Create deck
      const deck = await createDeck({ name, description });

      // 2) Create cards
      for (const card of cardsToCreate) {
        await createCard({
          deck_id: deck.id,
          question: card.question,
          answer: card.answer,
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

  const renderModeFields = () => {
    if (mode === "upload") {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Upload study material (PDF, DOCX, etc.)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500">
            The server will extract text and generate flashcards.
          </p>
        </div>
      );
    }

    if (mode === "ai") {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Paste text for AI to summarize into cards
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 h-40"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste lecture notes, an article, or any study material..."
          />
          <p className="text-xs text-gray-500">
            AI will generate about 10 cards from this text.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">
            Cards (question & answer)
          </label>
          <button
            type="button"
            onClick={handleAddManualCard}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add card
          </button>
        </div>

        <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
          {manualCards.map((card, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 bg-gray-50 space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">
                  Card {index + 1}
                </span>
              </div>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Question"
                value={card.question}
                onChange={(e) =>
                  handleManualChange(index, "question", e.target.value)
                }
              />
              <textarea
                className="w-full border rounded px-2 py-1 text-sm h-16"
                placeholder="Answer"
                value={card.answer}
                onChange={(e) =>
                  handleManualChange(index, "answer", e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">New deck</h1>
        <p className="text-gray-600">
          Choose how you want to create this deck: upload, use AI, or enter
          cards manually.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Deck name/description */}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Deck name
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Biology – Cell Structure"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 h-20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this deck..."
            />
          </div>
        </div>

        {/* Mode tabs + fields */}
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <div className="flex gap-2 mb-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  setPreviewCards([]);
                  setError("");
                }}
                className={
                  "px-3 py-1.5 rounded-full text-sm border " +
                  (mode === m.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          {renderModeFields()}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGeneratePreview}
              disabled={generating || saving}
              className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Preview cards"}
            </button>
          </div>
        </div>

        {/* Preview */}
        {previewCards.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Preview ({previewCards.length} cards)
              </h2>
              <p className="text-xs text-gray-500">
                These will be created when you save the deck.
              </p>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {previewCards.map((card, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 bg-gray-50 text-sm"
                >
                  <p className="font-semibold mb-1">
                    Q{index + 1}: {card.question}
                  </p>
                  <p className="text-gray-700">
                    A: {card.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Creating deck..." : "Create deck"}
          </button>
        </div>
      </form>
    </div>
  );
}
