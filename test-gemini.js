const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load env
require('dotenv').config({ path: '.env.local', override: true });

const API_KEY = process.env.GOOGLE_API_KEY;
console.log("API Key (first 10 chars):", API_KEY?.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(API_KEY);

// Test specific models that should work
async function testModels() {
  const modelsToTest = [
    "gemini-2.5-flash",      // Latest flash model
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\nTesting: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      console.log(`PASS ${modelName} WORKS:`, result.response.text().substring(0, 50));
      return modelName;
    } catch (error) {
      console.log(`FAIL ${modelName}: ${error.message}`);
    }
  }
  return null;
}

testModels().then(working => {
  console.log("\n=== RESULT ===");
  if (working) {
    console.log(`USE THIS MODEL: ${working}`);
  } else {
    console.log("All models rate-limited. Wait 1 minute and try gemini-2.5-flash");
  }
  process.exit(0);
});
