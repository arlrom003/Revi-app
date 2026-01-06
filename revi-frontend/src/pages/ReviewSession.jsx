// src/pages/ReviewSession.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCards, saveReviewSession } from "../services/api";
import { Pie } from "react-chartjs-2";
import "../chartSetup";

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
        const data = await getCards(deckId); // expects { cards }
        setCards(data.cards || []);
      } catch (error) {
        console.error("Error loading cards:", error);
        alert("Failed to load cards.");
      }
    };

    if (deckId) loadCards();
  }, [deckId]);

  const handleRating = (rating) => {
    const current = cards[currentIndex];
    const newRatings = [...ratings, { card_id: current.id, rating }];
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
      alert("Failed to save session.");
    }
  };

  if (cards.length === 0 && !sessionComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-500 text-lg font-medium">
          Loading cards…
        </div>
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
          backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <section className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Session complete</h1>
          <p className="text-sm text-gray-600">
            Here is how you rated the cards in this session.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="w-56 mx-auto">
            <Pie data={chartData} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-emerald-700">Easy</span>
              <span className="text-emerald-600">{easy} cards</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-amber-700">Medium</span>
              <span className="text-amber-600">{medium} cards</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-rose-700">Hard</span>
              <span className="text-rose-600">{hard} cards</span>
            </div>
          </div>

          {improvement && improvement.change && (
            <div className="p-4 bg-indigo-50 rounded-xl text-xs space-y-1">
              <h2 className="font-semibold text-indigo-900">
                Improvement vs last session
              </h2>
              <p
                className={
                  improvement.change.easy >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                Easy: {improvement.change.easy > 0 ? "+" : ""}
                {improvement.change.easy}%
              </p>
              <p
                className={
                  improvement.change.medium >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                Medium: {improvement.change.medium > 0 ? "+" : ""}
                {improvement.change.medium}%
              </p>
              <p
                className={
                  improvement.change.hard >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                Hard: {improvement.change.hard > 0 ? "+" : ""}
                {improvement.change.hard}%
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Go to dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Study again
            </button>
          </div>
        </section>
      </div>
    );
  }

  const current = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Progress */}
      <section>
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {/* Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[260px] flex flex-col justify-between">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4 text-gray-900">
            {current.question}
          </p>
          {showAnswer && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-base text-gray-700 whitespace-pre-wrap">
                {current.answer}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleRating("hard")}
              className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-600"
            >
              Hard
            </button>
            <button
              onClick={() => handleRating("medium")}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600"
            >
              Medium
            </button>
            <button
              onClick={() => handleRating("easy")}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600"
            >
              Easy
            </button>
          </div>

          {!showAnswer && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Show answer
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
