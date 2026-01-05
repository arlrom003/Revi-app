import dotenv from 'dotenv';
dotenv.config();

console.log('🔑 OpenRouter API Key exists:', !!process.env.OPENROUTER_API_KEY);

// Free models ranked by quality and reliability
const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',            // Best quality
  'meta-llama/llama-3.2-3b-instruct:free',       // Most reliable
  'deepseek/deepseek-r1-distill-llama-70b:free', // Good reasoning
  'nousresearch/hermes-3-llama-3.1-405b:free'    // Backup
];

export async function generateFlashcardsFromText(text, numCards = 10) {
  console.log('🤖 Starting AI generation with OpenRouter...');
  console.log('📝 Text length:', text.length);
  console.log('🎯 Cards requested:', numCards);
  
  const prompt = `You are an expert educational assistant. Generate exactly ${numCards} flashcard question-answer pairs from the following text.

CRITICAL: Return ONLY valid JSON in this exact format with no other text:
{
  "flashcards": [
    { "question": "What is...", "answer": "..." },
    { "question": "How does...", "answer": "..." }
  ]
}

Rules:
- Focus on key concepts, definitions, and important facts
- Questions should be clear and specific
- Answers should be concise (1-3 sentences)
- Cover different aspects of the material
- Return ONLY the JSON, no markdown, no explanations

Text to analyze:
${text.substring(0, 8000)}

Return JSON only:`;

  // Try each model as fallback
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    console.log(`\n📤 Trying model ${i + 1}/${FREE_MODELS.length}: ${model}`);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Revi Flashcard App'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: 'system', 
              content: 'You are a flashcard generator. Return only JSON with no markdown formatting.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Model ${model} failed with status ${response.status}`);
        console.log(`❌ Error: ${errorText.substring(0, 200)}`);
        continue; // Try next model
      }

      const data = await response.json();
      console.log('✅ Got response from OpenRouter');
      
      const content = data.choices?.[0]?.message?.content ?? '';
      console.log('📥 Response length:', content.length);
      console.log('📥 First 200 chars:', content.substring(0, 200));
      
      // Clean up response (remove markdown code blocks if present)
      let cleaned = content.trim();
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}') + 1;
      cleaned = cleaned.substring(jsonStart, jsonEnd);
      
      console.log('🧹 After cleanup:', cleaned.substring(0, 200));
;
      
      // Parse JSON
      const parsed = JSON.parse(cleaned);
      
      if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
        console.log('❌ Invalid format from model, trying next...');
        continue;
      }
      
      // Validate flashcards
      const validCards = parsed.flashcards.filter(
        c => c.question && c.answer && 
             typeof c.question === 'string' && 
             typeof c.answer === 'string' &&
             c.question.trim().length > 0 &&
             c.answer.trim().length > 0
      );
      
      if (validCards.length === 0) {
        console.log('❌ No valid cards from model, trying next...');
        continue;
      }
      
      console.log(`✅ SUCCESS! Generated ${validCards.length} valid cards using ${model}`);
      return validCards.slice(0, numCards);
      
    } catch (error) {
      console.log(`❌ Error with model ${model}:`, error.message);
      if (i === FREE_MODELS.length - 1) {
        // Last model failed, return error
        console.error('❌ All models failed');
        throw error;
      }
      // Otherwise continue to next model
      continue;
    }
  }
  
  // If we get here, all models failed
  console.error('❌ All models exhausted');
  return [{
    question: "Error: Could not generate flashcards with any AI model",
    answer: "All AI models failed. Please check your internet connection and try again, or create flashcards manually."
  }];
}