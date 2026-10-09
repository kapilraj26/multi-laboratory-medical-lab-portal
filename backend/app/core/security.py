import os
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt
from dotenv import load_dotenv


load_dotenv()


# =====================================================
# JWT CONFIGURATION
# =====================================================

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY is not configured"
    )

# Require a reasonably strong secret key.
# Do not use a short/default secret in production.
if len(SECRET_KEY) < 32:
    raise ValueError(
        "SECRET_KEY must contain at least 32 characters"
    )


ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# =====================================================
# PASSWORD HASHING
# =====================================================

def hash_password(password: str) -> str:

    if not password:
        raise ValueError(
            "Password cannot be empty"
        )

    password_bytes = password.encode(
        "utf-8"
    )

    hashed_password = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed_password.decode(
        "utf-8"
    )


# =====================================================
# PASSWORD VERIFICATION
# =====================================================

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    if not plain_password or not hashed_password:
        return False

    try:

        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )

    except (
        ValueError,
        TypeError
    ):

        return False


# =====================================================
# CREATE ACCESS TOKEN
# =====================================================

def create_access_token(
    user_id: int,
    role: str,
    lab_id: int
) -> str:

    now = datetime.now(
        timezone.utc
    )

    expire = now + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )


    payload = {

        # User ID
        "sub": str(user_id),

        # User role
        "role": role,

        # Laboratory ID
        "lab_id": lab_id,

        # Issued-at time
        "iat": now,

        # Expiration time
        "exp": expire

    }


    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )