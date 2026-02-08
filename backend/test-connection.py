import os
from pymongo import MongoClient
import google.generativeai as genai
from pymongo.errors import ConnectionFailure

# --- 1. PASTE YOUR CONFIG HERE ---
MONGO_URI = "mongodb+srv://kavyansh1509_db_user:0WHWODGnWuGPLLLC@cluster-ai-therapist.tl3wq6k.mongodb.net/?appName=cluster-ai-therapist" 
GEMINI_API_KEY = "AIzaSyDktgy2bz-9vfJ8gbqeF7kdRvhmKz6_iws"      # <--- PASTE YOUR KEY HERE

print("--- DIAGNOSTIC STARTING ---")

# --- TEST 1: DATABASE ---
print("\n1. Testing MongoDB Connection...")
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Force a connection check
    client.admin.command('ping')
    print("✅ MongoDB: SUCCESS! Connected to Atlas.")
except Exception as e:
    print(f"❌ MongoDB: FAILED. \nError: {e}")
    print("TIP: Did you Whitelist your IP (0.0.0.0/0) in Atlas Network Access?")
    print("TIP: Did you remove the '<' and '>' around your password?")

# --- TEST 2: AI API ---
print("\n2. Testing Gemini API...")
try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Say hello")
    print(f"✅ Gemini API: SUCCESS! Response: {response.text.strip()}")
except Exception as e:
    print(f"❌ Gemini API: FAILED. \nError: {e}")

print("\n--- DIAGNOSTIC FINISHED ---")