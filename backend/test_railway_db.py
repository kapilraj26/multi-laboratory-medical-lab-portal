from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("DATABASE_URL")
if not url:
    raise RuntimeError("DATABASE_URL is missing from backend/.env")

engine = create_engine(url, pool_pre_ping=True)

try:
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT DATABASE(), VERSION()")
        )
        print("Railway connection successful!")
        print("Database and MySQL version:", result.fetchone())
except Exception as error:
    print("Connection failed:", error)
finally:
    engine.dispose()
