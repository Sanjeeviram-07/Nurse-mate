const OLLAMA_API_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "llama3";

// Fallback responses for when Ollama is not available
const FALLBACK_RESPONSES = {
  greeting: "Hello! I'm Cuddles, your friendly NurseMate Assistant. I'm currently running in offline mode. I can help you with basic information about NurseMate features like clinical logs, shift planning, resume building, and job searching.",
  clinical_logs: "To add a clinical log, go to the Clinical Logs section and click 'Add New Log'. Fill in the patient details, procedures performed, and any notes. This helps track your clinical experience.",
  shift_planner: "The Shift Planner helps you organize your work schedule. You can add shifts, edit existing ones, and view your calendar. Click 'Add Shift' to schedule a new shift.",
  resume_builder: "Use the Resume Builder to create a professional nursing resume. Add your education, experience, certifications, and skills. You can download your resume as a PDF.",
  job_board: "The Job Board shows available nursing positions. You can search by location, specialty, and other criteria. Click on a job to view details and apply.",
  admin_tools: "Hospital administrators can manage staff, view reports, and handle administrative tasks through the admin dashboard.",
  profile: "You can update your profile information including your phone number and personal details in the Profile section.",
  default: "I'm Cuddles, your NurseMate Assistant! I can help you with clinical logs, shift planning, resume building, job searching, and profile management. What would you like to know about?"
};

/**
 * Simple keyword-based response system for offline mode
 */
const getFallbackResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return FALLBACK_RESPONSES.greeting;
  }
  
  if (message.includes('clinical log') || message.includes('log') || message.includes('patient') || message.includes('procedure')) {
    return FALLBACK_RESPONSES.clinical_logs;
  }
  
  if (message.includes('shift') || message.includes('schedule') || message.includes('work') || message.includes('calendar')) {
    return FALLBACK_RESPONSES.shift_planner;
  }
  
  if (message.includes('resume') || message.includes('cv') || message.includes('application') || message.includes('profile')) {
    return FALLBACK_RESPONSES.resume_builder;
  }
  
  if (message.includes('job') || message.includes('position') || message.includes('career') || message.includes('employment')) {
    return FALLBACK_RESPONSES.job_board;
  }
  
  if (message.includes('admin') || message.includes('manage') || message.includes('hospital') || message.includes('staff')) {
    return FALLBACK_RESPONSES.admin_tools;
  }
  
  if (message.includes('profile') || message.includes('settings') || message.includes('account')) {
    return FALLBACK_RESPONSES.profile;
  }
  
  // If the message doesn't match any NurseMate topics, redirect to NurseMate
  if (!message.includes('nursemate') && !message.includes('nurse') && !message.includes('clinical') && 
      !message.includes('shift') && !message.includes('resume') && !message.includes('job') && 
      !message.includes('admin') && !message.includes('profile')) {
    return "I'm Cuddles, your NurseMate Assistant! I'm here to help you with the NurseMate platform. How can I assist you with clinical logs, shift planning, resume building, job searching, or other NurseMate features?";
  }
  
  return FALLBACK_RESPONSES.default;
};

/**
 * Sends a user prompt to the Ollama API and returns the model's reply.
 * Falls back to simple responses if Ollama is not available.
 * @param {string} prompt - The user's message or full conversation
 * @param {string} model - The model name (defaults to llama3)
 * @param {string} systemPrompt - Optional system prompt to include
 * @returns {Promise<string|null>} - The model's response or fallback response
 */
export const chatWithOllama = async (prompt, model = MODEL_NAME, systemPrompt = null) => {
  const headers = { "Content-Type": "application/json" };
  
  // Prepare messages array
  const messages = [];
  
  // Add system prompt if provided
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  
  // Add user message
  messages.push({ role: "user", content: prompt });
  
  const payload = {
    model: model,
    messages: messages,
    stream: false // Use false for easier JSON parsing
  };

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return data.message?.content?.trim() || "";
    } else {
      console.error(`❌ API Error [${response.status}]: ${response.statusText}`);
      // Return fallback response instead of null
      return getFallbackResponse(prompt);
    }
  } catch (error) {
    console.error(`❌ Connection error: ${error.message}`);
    // Return fallback response instead of null
    return getFallbackResponse(prompt);
  }
};

/**
 * Check if Ollama is running and accessible
 * @returns {Promise<boolean>} - True if Ollama is available
 */
export const checkOllamaStatus = async () => {
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: "test" }],
        stream: false
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout for status check
    });
    return response.ok;
  } catch (error) {
    console.error('Ollama status check failed:', error.message);
    return false;
  }
};

/**
 * Get installation instructions for Ollama
 * @returns {string} - Installation instructions
 */
export const getOllamaInstallInstructions = () => {
  return `
To enable full AI capabilities, please install Ollama:

1. Visit https://ollama.ai and download the installer
2. Install Ollama for your operating system
3. Open a terminal/command prompt and run: ollama pull llama3
4. Start Ollama (it will run on localhost:11434)
5. Refresh this page

For now, I'm running in offline mode with basic responses.
  `.trim();
}; 