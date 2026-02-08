from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import google.generativeai as genai
import datetime
import os

# --- CONFIGURATION ---
MONGO_URI = "mongodb+srv://kavyansh1509_db_user:0WHWODGnWuGPLLLC@cluster-ai-therapist.tl3wq6k.mongodb.net/?appName=cluster-ai-therapist" 
GEMINI_API_KEY = "AIzaSyDktgy2bz-9vfJ8gbqeF7kdRvhmKz6_iws"

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# --- THE PERSONA ---
# Using system_instruction is the "correct" way to do this in the new version.
THERAPIST_INSTRUCTIONS = """
You are Aura, a mental health companion designed specifically for college students. You understand the unique challenges of university life (finals, roommate conflicts, career anxiety, loneliness).

CRITICAL RULES:
1. DETECT EMOTION FIRST: Before answering, assess if the user is happy, sad, or stressed.
2. NO TOXIC POSITIVITY: If the user shares bad news (like low grades, breakup, stress), DO NOT say "That's great!" or "Good job!". Instead, say "I'm so sorry," or "That sounds really hard."
3. BE CONCISE: Keep responses under 3 sentences.
4. VALIDATE: Always validate their feeling first. ex: "It makes sense that you feel disappointed."
5. SAFETY: If suicide/self-harm is mentioned, output ONLY the 988 safety message.

### METHODOLOGY
1.  **Validate First:** Always acknowledge the emotion behind the text before responding (e.g., "It makes sense that you're feeling overwhelmed by finals.").
2.  **Reflective Listening:** Paraphrase what the user said to show you understand.
3.  **Low Friction:** Keep responses under 50 words. Be conversational, not lecture-heavy.

### CONSTRAINTS
- **No Advice Bombing:** Do not offer solutions unless explicitly asked. instead, ask: "Do you want to vent, or are you looking for strategies?"
- **No Diagnosis:** You are a companion, not a doctor. Use phrases like "It sounds like you are experiencing..." rather than "You have..."
- **Tone:** Soothing, patient, and peer-like.

### CRITICAL SAFETY INTERVENTION
If the user indicates an immediate intent to harm themselves or others, stop your persona immediately and return this exact text:
"I am hearing a lot of pain in your words, and I want you to be safe. Please contact the Suicide & Crisis Lifeline by calling or texting 988, or text HOME to 741741. There is help available 24/7."
"""

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE ---
try:
    client = MongoClient(MONGO_URI)
    db = client["aura_db"]
    chats_collection = db["chats"]
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")

# --- AI MODEL SETUP ---
# We can now use 'gemini-1.5-flash' with system_instruction
generation_config = {
    "temperature": 0.7, # High creativity for empathy
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 200,
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", 
    system_instruction=THERAPIST_INSTRUCTIONS, # <--- NATIVE SUPPORT
    generation_config=generation_config
)

class ChatRequest(BaseModel):
    user_input: str
    user_id: str = "guest_user"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        user_msg = request.user_input
        user_id = request.user_id

        # 1. Fetch History
        recent_chats = list(chats_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(10))
        recent_chats.reverse()
        
        # 2. Convert to Gemini History Format
        history_objs = []
        for msg in recent_chats:
            role = "user" if msg["sender"] == "user" else "model"
            history_objs.append({"role": role, "parts": [msg["text"]]})

        # 3. Start Chat
        chat_session = model.start_chat(history=history_objs)

        # 4. Get Response
        response = chat_session.send_message(user_msg)
        bot_reply = response.text

        # 5. Save to DB
        chats_collection.insert_one({"user_id": user_id, "sender": "user", "text": user_msg, "timestamp": datetime.datetime.utcnow()})
        chats_collection.insert_one({"user_id": user_id, "sender": "bot", "text": bot_reply, "timestamp": datetime.datetime.utcnow()})

        return {"response": bot_reply}

    except Exception as e:
        print(f"Error: {e}")
        # Detailed error printing to help debug
        return {"response": f"Connection error. If you see this, check your terminal for the exact error message."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)