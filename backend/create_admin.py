from app.core.database import SessionLocal
from app.services.user_service import create_admin_for_lab


db = SessionLocal()

try:
    admin, error = create_admin_for_lab(
        db=db,
        lab_id=2,
        name="Lab 2 Administrator",
        email="admin.lab2@example.com",
        password="Admin@12345",
        phone="9876543214"
    )

    if error:
        print("Error:", error)
    else:
        print("Admin created successfully!")
        print("User ID:", admin.user_id)
        print("Lab ID:", admin.lab_id)
        print("Email:", admin.email)
        print("Role:", admin.role)

finally:
    db.close()
