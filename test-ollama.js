const OLLAMA_API_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "llama3";

/**
 * Test script to verify Ollama integration
 */
async function testOllama() {
  console.log("🤖 Testing Ollama Integration for NurseMate");
  console.log("==========================================\n");

  // Test 1: Check if Ollama is running
  console.log("1. Checking if Ollama is running...");
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: "Hello" }],
        stream: false
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.ok) {
      console.log("✅ Ollama is running and accessible");
    } else {
      console.log(`❌ Ollama responded with status: ${response.status}`);
      return;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to Ollama: ${error.message}`);
    console.log("💡 Make sure Ollama is running on localhost:11434");
    return;
  }

  // Test 2: Test with a simple prompt
  console.log("\n2. Testing with a simple prompt...");
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: "Say hello in one word" }],
        stream: false
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.message?.content?.trim();
      console.log(`✅ Ollama responded: "${content}"`);
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
      return;
    }
  } catch (error) {
    console.log(`❌ Error testing prompt: ${error.message}`);
    return;
  }

  // Test 3: Test with NurseMate system prompt
  console.log("\n3. Testing with NurseMate system prompt...");
  const systemPrompt = `
You are Cuddles, a friendly and helpful NurseMate Assistant for nursing students and hospital administrators. 

Your job is to help users understand how to use NurseMate features like clinical logs, shift planning, resume building, job searching, and hospital admin tools. Always speak in natural, conversational language without any special formatting or symbols.

Important rules:
- Never give medical advice or clinical recommendations
- Focus only on how to use the NurseMate platform
- Keep answers clear and step-by-step
- Use simple, everyday language
- Avoid technical jargon

Current user role: nurse

User: How do I add a clinical log?
`;

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: systemPrompt }],
        stream: false
      }),
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.message?.content?.trim();
      console.log("✅ Ollama responded to NurseMate prompt:");
      console.log(`"${content.substring(0, 200)}${content.length > 200 ? '...' : ''}"`);
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Error testing NurseMate prompt: ${error.message}`);
  }

  console.log("\n🎉 Ollama integration test completed!");
  console.log("💡 If all tests passed, your NurseMate chatbot should work with Ollama.");
}

// Run the test
testOllama().catch(console.error); 