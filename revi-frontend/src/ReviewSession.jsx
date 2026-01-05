// src/ReviewSession.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCards, saveReviewSession } from "./services/api";
import { Pie } from "react-chartjs-2";
import "./chartSetup";

export default function ReviewSession() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [improvement, setImprovement] = useState(null);
  const [startTime] = useState(new Date());

  useEffect(() => {
    const loadCards = async () => {
      try {
        const data = await getCards(deckId); // expects { cards } from backend
        setCards(data.cards || []);
      } catch (error) {
        console.error("Error loading cards:", error);
        alert("Failed to load cards");
      }
    };

    if (deckId) {
      loadCards();
    }
  }, [deckId]);

  const handleRating = (rating) => {
    const current = cards[currentIndex];
    const newRatings = [
      ...ratings,
      { card_id: current.id, rating },
    ];
    setRatings(newRatings);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setShowAnswer(false);
    } else {
      completeSession(newRatings);
    }
  };

  const completeSession = async (finalRatings) => {
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    try {
      const result = await saveReviewSession({
        deck_id: deckId,
        started_at: startTime.toISOString(),
        ended_at: endTime.toISOString(),
        card_ratings: finalRatings,
        duration_seconds: durationSeconds,
      });

      setImprovement(result.improvement || null);
      setSessionComplete(true);
    } catch (error) {
      console.error("Error saving session:", error);
      alert("Failed to save session");
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading cards...</div>
      </div>
    );
  }

  if (sessionComplete) {
    const easy = ratings.filter((r) => r.rating === "easy").length;
    const medium = ratings.filter((r) => r.rating === "medium").length;
    const hard = ratings.filter((r) => r.rating === "hard").length;

    const chartData = {
      labels: ["Easy", "Medium", "Hard"],
      datasets: [
        {
          data: [easy, medium, hard],
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center mb-4">
            Session Complete!
          </h1>

          <div className="w-64 mx-auto mb-6">
            <Pie data={chartData} />
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="font-semibold text-green-700">Easy</span>
              <span className="text-green-600">
                {easy} cards
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-yellow-700">Medium</span>
              <span className="text-yellow-600">
                {medium} cards
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-red-700">Hard</span>
              <span className="text-red-600">
                {hard} cards
              </span>
            </div>
          </div>

          {improvement && improvement.change && (
            <div className="p-4 bg-blue-50 rounded-lg text-sm space-y-1">
              <h2 className="font-semibold text-blue-900 mb-1">
                Improvement vs last session
              </h2>
              <p
                className={
                  improvement.change.easy >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                Easy: {improvement.change.easy > 0 ? "+" : ""}
                {improvement.change.easy}%
              </p>
              <p
                className={
                  improvement.change.medium >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                Medium: {improvement.change.medium > 0 ? "+" : ""}
                {improvement.change.medium}%
              </p>
              <p
                className={
                  improvement.change.hard >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                Hard: {improvement.change.hard > 0 ? "+" : ""}
                {improvement.change.hard}%
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Study Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-8 min-h-[280px] flex flex-col justify-between">
        <div className="text-center">
          <p className="text-2xl font-semibold mb-6">{current.question}</p>
          {showAnswer && (
            <div className="border-t border-gray-200 pt-6 mt-4">
              <p className="text-xl text-gray-700">{current.answer}</p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleRating("hard")}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
            >
              Hard
            </button>
            <button
              onClick={() => handleRating("medium")}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600"
            >
              Medium
            </button>
            <button
              onClick={() => handleRating("easy")}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
            >
              Easy
            </button>
          </div>

          {!showAnswer && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
              >
                Show Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
