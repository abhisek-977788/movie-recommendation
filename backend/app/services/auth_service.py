from datetime import timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserProfileUpdate
from app.utils.security import hash_password, verify_password, create_access_token

def create_user(db: Session, user_in: UserCreate) -> User:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )

    # First user is admin (helps simplify development setup)
    is_admin = db.query(User).count() == 0

    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        is_admin=is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    return user

def update_user_profile(db: Session, user: User, profile_in: UserProfileUpdate) -> User:
    if profile_in.name is not None:
        user.name = profile_in.name
    
    if profile_in.email is not None and profile_in.email != user.email:
        # Check if email is already taken
        existing = db.query(User).filter(User.email == profile_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use."
            )
        user.email = profile_in.email

    if profile_in.password is not None:
        user.hashed_password = hash_password(profile_in.password)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
