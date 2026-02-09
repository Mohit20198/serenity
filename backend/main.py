from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from textblob import TextBlob
import google.generativeai as genai
import os
from dotenv import load_dotenv
import datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
class GoogleLoginRequest(BaseModel):
    token: str

# --- 1. CONFIGURATION ---
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# Use the model that worked for you previously
model = genai.GenerativeModel('gemini-2.0-flash-lite-preview-09-2025') 

# Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./aura_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. DATABASE MODELS ---

# Existing Chat Log Table
class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_input = Column(String)
    bot_response = Column(String)
    sentiment_score = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# NEW: User Table
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String) # NOTE: In a real app, you must HASH this password!

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. REQUEST MODELS ---
class ChatRequest(BaseModel):
    user_input: str
    emotion: str = "neutral"

class UserSignup(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# --- 4. AI LOGIC ---
def get_ai_response(user_text: str, detected_emotion: str):
    try:
        prompt = f"""
        You are Serenity, an empathetic AI therapist.
        The user is communicating via video chat.
        Their facial expression analysis detects: [{detected_emotion.upper()}].
        
        INSTRUCTIONS:
        1. Acknowledge their visible emotion subtly.
        2. Keep responses short, warm, and supportive.
        
        User: {user_text}
        Serenity:
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return "I'm having trouble connecting, but I'm here for you."

# --- 5. ENDPOINTS ---

# NEW: Sign Up Endpoint
@app.post("/signup")
async def signup(user: UserSignup, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(full_name=user.full_name, email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}

# NEW: Login Endpoint (Simple check)
@app.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email")
    if db_user.password != user.password:
        raise HTTPException(status_code=400, detail="Invalid password")
    
    return {"message": "Login successful", "user": db_user.full_name}
# --- GOOGLE LOGIN ENDPOINT ---
@app.post("/google-login")
async def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # 1. Verify the token with Google
        CLIENT_ID = "601971777704-mgda14dlttkrs0h0jl6l0chmn6sbcbrp.apps.googleusercontent.com" # <--- PASTE YOUR CLIENT ID HERE
        id_info = id_token.verify_oauth2_token(request.token, google_requests.Request(), CLIENT_ID)

        # 2. Get user info
        email = id_info['email']
        name = id_info.get('name', 'Google User')
        
        # 3. Check if user exists in DB
        db_user = db.query(User).filter(User.email == email).first()
        
        if not db_user:
            # Create new user automatically (Password is None for Google users)
            new_user = User(full_name=name, email=email, password=None)
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return {"message": "User created", "user": name}
            
        return {"message": "Login successful", "user": db_user.full_name}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google Token")
# Chat Endpoint
@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    blob = TextBlob(request.user_input)
    sentiment = blob.sentiment.polarity 
    bot_reply = get_ai_response(request.user_input, request.emotion)
    
    new_log = ChatLog(
        user_input=request.user_input, 
        bot_response=bot_reply, 
        sentiment_score=sentiment
    )
    db.add(new_log)
    db.commit()
    
    return {"response": bot_reply, "sentiment": sentiment}

@app.get("/mood-history")
async def get_mood_history(db: Session = Depends(get_db)):
    logs = db.query(ChatLog).order_by(ChatLog.timestamp.desc()).limit(7).all()
    history = [{"score": log.sentiment_score, "time": log.timestamp} for log in reversed(logs)]
    return history