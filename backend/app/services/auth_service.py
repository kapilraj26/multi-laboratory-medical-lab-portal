from sqlalchemy.orm import Session

from app.models.user import User

from app.core.security import (
    verify_password,
    create_access_token
)


# =====================================================
# USER LOGIN
# =====================================================

def login_user(
    db: Session,
    email: str,
    password: str
):
    # -------------------------------------------------
    # Normalize email
    # -------------------------------------------------

    normalized_email = email.strip().lower()


    # -------------------------------------------------
    # Find active user
    # -------------------------------------------------

    user = db.query(User).filter(
        User.email == normalized_email,
        User.is_active == True
    ).first()


    # -------------------------------------------------
    # Do not reveal whether email exists
    # -------------------------------------------------

    if user is None:

        return None, (
            "Invalid email or password"
        )


    # -------------------------------------------------
    # Verify password
    # -------------------------------------------------

    if not verify_password(
        password,
        user.password_hash
    ):

        return None, (
            "Invalid email or password"
        )


    # -------------------------------------------------
    # Create JWT
    #
    # Role and lab_id come directly from
    # the database user.
    # -------------------------------------------------

    access_token = create_access_token(
        user_id=user.user_id,
        role=user.role,
        lab_id=user.lab_id
    )


    # -------------------------------------------------
    # Return login response
    # -------------------------------------------------

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "role": user.role,
        "lab_id": user.lab_id
    }, None
