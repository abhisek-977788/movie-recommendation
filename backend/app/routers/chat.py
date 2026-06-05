from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat_service
from app.utils.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(
    chat_in: ChatRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ai_response = await chat_service.get_ai_chat_response(chat_in.message, db)
    return {"response": ai_response}
