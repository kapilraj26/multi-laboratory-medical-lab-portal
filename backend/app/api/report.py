from pathlib import Path
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile
)

from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.core.dependencies import (
    get_current_user,
    require_role
)

from app.models.user import User

from app.schemas.report import (
    ReportCreate,
    ReportResponse
)

from app.services.report_service import (
    create_report,
    get_patient_reports,
    get_lab_reports,
    get_report_by_id
)


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# =====================================================
# FILE CONFIGURATION
# =====================================================

MAX_PDF_SIZE = 5 * 1024 * 1024

CHUNK_SIZE = 64 * 1024

BASE_DIR = Path(__file__).resolve().parents[2]

UPLOAD_DIRECTORY = BASE_DIR / "uploads"

UPLOAD_DIRECTORY.mkdir(
    parents=True,
    exist_ok=True
)


# =====================================================
# STAFF / ADMIN - UPLOAD REPORT
# =====================================================

@router.post(
    "/",
    response_model=ReportResponse
)
def upload_report(
    booking_id: int = Form(...),

    result: str = Form(...),

    remarks: str | None = Form(None),

    report_pdf: UploadFile = File(...),

    current_user: User = Depends(
        require_role("Staff", "Admin")
    ),

    db: Session = Depends(get_db)
):

    # =================================================
    # 1. CHECK MIME TYPE
    # =================================================

    if report_pdf.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )


    # =================================================
    # 2. GENERATE SAFE SERVER-SIDE FILENAME
    # =================================================

    filename = f"{uuid.uuid4().hex}.pdf"

    file_path = UPLOAD_DIRECTORY / filename


    # =================================================
    # 3. READ UPLOAD IN CHUNKS
    # =================================================

    total_size = 0

    # Store only the first 5 bytes for signature validation
    pdf_header = bytearray()

    try:

        with open(
            file_path,
            "wb"
        ) as output_file:

            while True:

                chunk = report_pdf.file.read(
                    CHUNK_SIZE
                )

                if not chunk:
                    break


                # -------------------------------------
                # Capture first 5 bytes
                # -------------------------------------

                if len(pdf_header) < 5:

                    remaining = 5 - len(pdf_header)

                    pdf_header.extend(
                        chunk[:remaining]
                    )


                # -------------------------------------
                # Calculate total size
                # -------------------------------------

                total_size += len(chunk)


                # -------------------------------------
                # Reject files > 5 MB
                # -------------------------------------

                if total_size > MAX_PDF_SIZE:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "PDF file size must not "
                            "exceed 5 MB"
                        )
                    )


                # -------------------------------------
                # Write chunk
                # -------------------------------------

                output_file.write(chunk)


    except HTTPException:

        if file_path.exists():
            file_path.unlink()

        raise


    except Exception:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=400,
            detail="Unable to read uploaded file"
        )


    finally:

        try:
            report_pdf.file.close()

        except Exception:
            pass


    # =================================================
    # 4. CHECK EMPTY FILE
    # =================================================

    if total_size == 0:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty"
        )


    # =================================================
    # 5. VERIFY PDF MAGIC NUMBER
    # =================================================
    #
    # A PDF must begin with:
    #
    # %PDF-
    #
    # This prevents a normal text file renamed
    # to .pdf from being accepted.
    #
    # =================================================

    if bytes(pdf_header) != b"%PDF-":

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file"
        )


    # =================================================
    # 6. PREPARE REPORT DATA
    # =================================================

    report_data = ReportCreate(
        booking_id=booking_id,
        result=result,
        report_file=str(file_path),
        remarks=remarks
    )


    # =================================================
    # 7. CREATE DATABASE REPORT
    # =================================================

    try:

        report, error = create_report(
            db=db,
            staff_user=current_user,
            report_data=report_data
        )

    except Exception:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail="Unable to create report"
        )


    # =================================================
    # 8. HANDLE SERVICE VALIDATION ERROR
    # =================================================

    if error:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=400,
            detail=error
        )


    # =================================================
    # 9. RETURN REPORT
    # =================================================

    return report


# =====================================================
# PATIENT - MY REPORTS
# =====================================================

@router.get(
    "/my-reports",
    response_model=list[ReportResponse]
)
def my_reports(
    current_patient: User = Depends(
        require_role("Patient")
    ),

    db: Session = Depends(get_db)
):

    return get_patient_reports(
        db=db,
        patient_id=current_patient.user_id,
        lab_id=current_patient.lab_id
    )


# =====================================================
# STAFF / ADMIN - LAB REPORTS
# =====================================================

@router.get(
    "/lab/all",
    response_model=list[ReportResponse]
)
def lab_reports(
    current_user: User = Depends(
        require_role("Staff", "Admin")
    ),

    db: Session = Depends(get_db)
):

    return get_lab_reports(
        db=db,
        lab_id=current_user.lab_id
    )


# =====================================================
# DOWNLOAD REPORT
# =====================================================

@router.get(
    "/{report_id}/download"
)
def download_report(
    report_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)
):

    # -------------------------------------------------
    # Find report inside current laboratory
    # -------------------------------------------------

    report = get_report_by_id(
        db=db,
        report_id=report_id,
        lab_id=current_user.lab_id
    )


    if report is None:

        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )


    # -------------------------------------------------
    # Patient -> own report only
    # -------------------------------------------------

    if current_user.role == "Patient":

        if report.patient_id != current_user.user_id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not allowed to "
                    "access this report"
                )
            )


    # -------------------------------------------------
    # Staff / Admin -> same laboratory only
    # -------------------------------------------------

    elif current_user.role in [
        "Staff",
        "Admin"
    ]:

        if report.lab_id != current_user.lab_id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not allowed to "
                    "access this report"
                )
            )


    # -------------------------------------------------
    # Unknown role
    # -------------------------------------------------

    else:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )


    # -------------------------------------------------
    # Check report file path
    # -------------------------------------------------

    if not report.report_file:

        raise HTTPException(
            status_code=404,
            detail="Report PDF not available"
        )


    file_path = Path(
        report.report_file
    ).resolve()


    # -------------------------------------------------
    # Prevent path traversal
    # -------------------------------------------------

    upload_directory = (
        UPLOAD_DIRECTORY.resolve()
    )

    try:

        file_path.relative_to(
            upload_directory
        )

    except ValueError:

        raise HTTPException(
            status_code=403,
            detail="Invalid report file path"
        )


    # -------------------------------------------------
    # Check file exists
    # -------------------------------------------------

    if not file_path.is_file():

        raise HTTPException(
            status_code=404,
            detail="Report PDF file not found"
        )


    # -------------------------------------------------
    # Return PDF
    # -------------------------------------------------

    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=(
            f"medical-report-"
            f"{report.report_id}.pdf"
        )
    )


# =====================================================
# VIEW ONE REPORT
# =====================================================

@router.get(
    "/{report_id}",
    response_model=ReportResponse
)
def get_report(
    report_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)
):

    # -------------------------------------------------
    # Laboratory isolation
    # -------------------------------------------------

    report = get_report_by_id(
        db=db,
        report_id=report_id,
        lab_id=current_user.lab_id
    )


    if report is None:

        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )


    # -------------------------------------------------
    # Patient -> own report only
    # -------------------------------------------------

    if current_user.role == "Patient":

        if report.patient_id != current_user.user_id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not allowed to "
                    "access this report"
                )
            )


    # -------------------------------------------------
    # Staff / Admin -> same laboratory
    # -------------------------------------------------

    elif current_user.role in [
        "Staff",
        "Admin"
    ]:

        if report.lab_id != current_user.lab_id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not allowed to "
                    "access this report"
                )
            )


    # -------------------------------------------------
    # Unknown role
    # -------------------------------------------------

    else:

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )


    return report