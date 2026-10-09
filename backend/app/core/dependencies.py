from typing import Callable

from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)

from jose import (
    JWTError,
    jwt
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.core.security import (
    SECRET_KEY,
    ALGORITHM
)

from app.models.user import User


security = HTTPBearer()


# =====================================================
# GET CURRENT AUTHENTICATED USER
# =====================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db)
):

    token = credentials.credentials


    # =================================================
    # DECODE JWT
    # =================================================

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


    # =================================================
    # GET JWT VALUES
    # =================================================

    user_id = payload.get("sub")

    token_role = payload.get("role")

    token_lab_id = payload.get("lab_id")


    # =================================================
    # CHECK REQUIRED CLAIMS
    # =================================================

    if (
        user_id is None
        or token_role is None
        or token_lab_id is None
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


    # =================================================
    # VALIDATE CLAIM TYPES
    # =================================================

    try:

        user_id = int(user_id)

        token_lab_id = int(token_lab_id)

    except (
        ValueError,
        TypeError
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


    # =================================================
    # FIND ACTIVE USER
    # =================================================

    user = db.query(User).filter(
        User.user_id == user_id,
        User.is_active == True
    ).first()


    if user is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )


    # =================================================
    # VERIFY USER ROLE
    # =================================================

    if user.role != token_role:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user role"
        )


    # =================================================
    # VERIFY LABORATORY ISOLATION
    # =================================================

    if user.lab_id != token_lab_id:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid laboratory access"
        )


    # =================================================
    # RETURN AUTHENTICATED USER
    # =================================================

    return user


# =====================================================
# ROLE AUTHORIZATION
# =====================================================

def require_role(
    *allowed_roles: str
) -> Callable:

    def role_checker(
        current_user: User = Depends(
            get_current_user
        )
    ):

        if current_user.role not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission "
                    "to access this resource"
                )
            )

        return current_user


    return role_checker