const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use a vision-capable model (gemini-flash-latest supports images)
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function urlToGenerativePart(url, mimeType) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return {
    inlineData: {
      data: Buffer.from(response.data).toString("base64"),
      mimeType
    },
  };
}

exports.analyzeSymptom = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const imagePart = await urlToGenerativePart(req.file.path, req.file.mimetype);
    
    const prompt = `
      You are a medical AI assistant. Analyze this image of a symptom.
      1. Describe what you see (e.g., rash, swelling, wound).
      2. Suggest potential causes (common conditions).
      3. Recommend immediate home care steps (first aid).
      4. Advise when to see a doctor (red flags).
      
      IMPORTANT: Start with a clear DISCLAIMER that this is not a medical diagnosis and they should consult a professional.
      Format the response with clear headings and bullet points. Use plain text (no markdown).
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      analysis: text
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);

    res.status(500).json({
      success: false,
      message: 'Error analyzing image',
      error: error.message
    });
  }
};
