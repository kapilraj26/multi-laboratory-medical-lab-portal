import os
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.core.database import engine, Base


# =====================================================
# ENVIRONMENT
# =====================================================

load_dotenv()


# =====================================================
# LOGGING
# =====================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =====================================================
# IMPORT MODELS
# =====================================================

from app.models.lab import Lab
from app.models.user import User
from app.models.lab_test import LabTest
from app.models.booking import Booking
from app.models.report import Report
from app.models.feedback import Feedback


# =====================================================
# IMPORT ROUTERS
# =====================================================

from app.api.lab import router as lab_router
from app.api.user import router as user_router
from app.api.auth import router as auth_router
from app.api.lab_test import router as lab_test_router
from app.api.booking import router as booking_router
from app.api.report import router as report_router
from app.api.feedback import router as feedback_router


# =====================================================
# APPLICATION CONFIGURATION
# =====================================================

APP_TITLE = "Multi-Laboratory Medical Lab Portal"
APP_VERSION = "1.0.0"

# Set FRONTEND_URL in Render to your production Vercel URL.
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://multi-laboratory-medical-lab-portal.vercel.app"
).strip().rstrip("/")

# Include the production domain and the specific preview URL
# shown in the browser's CORS error.
ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "https://multi-laboratory-medical-lab-portal.vercel.app",
    "https://multi-laboratory-medical-lab-portal-fg7hw5hq6.vercel.app",
]

# Remove duplicate origins and empty values.
ALLOWED_ORIGINS = list(
    dict.fromkeys(origin for origin in ALLOWED_ORIGINS if origin)
)


# =====================================================
# CREATE FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION
)


# =====================================================
# CORS CONFIGURATION
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# GLOBAL EXCEPTION HANDLER
# =====================================================

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    logger.exception(
        "Unhandled exception on %s %s",
        request.method,
        request.url.path
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error"
        }
    )


# =====================================================
# DATABASE TABLE CREATION
# =====================================================

Base.metadata.create_all(bind=engine)


# =====================================================
# API ROUTES
# =====================================================

app.include_router(lab_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(lab_test_router)
app.include_router(booking_router)
app.include_router(report_router)
app.include_router(feedback_router)


# =====================================================
# ROOT ENDPOINT
# =====================================================

@app.get("/")
def home():
    return {
        "success": True,
        "message": (
            "Multi-Laboratory Medical Lab Portal "
            "Backend is Running"
        )
    }


# =====================================================
# DATABASE HEALTH CHECK
# =====================================================

@app.get("/db-test")
def database_test():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "success": True,
            "message": "Database connection successful"
        }

    except Exception:
        logger.exception("Database health check failed")

        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "message": "Database unavailable"
            }
        )
