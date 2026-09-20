import time
from collections import defaultdict
from fastapi import Header, HTTPException, Depends
import jwt
from app.config import settings

# In-memory daily quota store: user_id -> [timestamps of generations today]
user_daily_generations = defaultdict(list)

def get_current_user(authorization: str = Header(None)) -> dict:
    """
    FastAPI dependency to verify Supabase JWT token.
    Enforces strict login — unauthenticated users receive 401.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in to Botock to generate AI videos."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'."
        )

    token = authorization.split(" ")[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing auth token.")

    try:
        # Decode without verify if secret is not set, or verify if SUPABASE_JWT_SECRET is configured
        if settings.SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
        else:
            # Decode payload safely
            payload = jwt.decode(token, options={"verify_signature": False})

        user_id = payload.get("sub") or payload.get("id")
        email = payload.get("email", "")
        role = payload.get("role", "authenticated")
        app_metadata = payload.get("app_metadata", {})
        is_pro = app_metadata.get("is_pro", False) or "pro" in str(role).lower()

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user ID.")

        return {
            "user_id": user_id,
            "email": email,
            "is_pro": is_pro,
            "payload": payload
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def check_daily_quota(user: dict = Depends(get_current_user)):
    """
    Enforces the Free Tier quota: 3 videos / day.
    Pro users bypass this limit.
    """
    if user.get("is_pro"):
        return user

    user_id = user["user_id"]
    now = time.time()
    day_seconds = 86400

    # Purge timestamps older than 24 hours
    user_daily_generations[user_id] = [
        t for t in user_daily_generations[user_id] if now - t < day_seconds
    ]

    used_count = len(user_daily_generations[user_id])
    if used_count >= settings.FREE_DAILY_VIDEO_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Daily free limit reached ({settings.FREE_DAILY_VIDEO_LIMIT} videos/day). Please upgrade to Botock Pro for unlimited credits."
        )

    # Record this generation attempt
    user_daily_generations[user_id].append(now)
    return user


user_daily_image_generations = defaultdict(list)

def check_daily_image_quota(user: dict = Depends(get_current_user)):
    """
    Enforces the Free Tier quota: 5 images / day.
    Pro users bypass this limit.
    """
    if user.get("is_pro"):
        return user

    user_id = user["user_id"]
    now = time.time()
    day_seconds = 86400

    user_daily_image_generations[user_id] = [
        t for t in user_daily_image_generations[user_id] if now - t < day_seconds
    ]

    used_count = len(user_daily_image_generations[user_id])
    if used_count >= settings.FREE_DAILY_IMAGE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Daily free image limit reached ({settings.FREE_DAILY_IMAGE_LIMIT} images/day). Please upgrade to Botock Pro for unlimited generations."
        )

    user_daily_image_generations[user_id].append(now)
    return user
