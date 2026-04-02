from fastapi import FastAPI, Depends
from fastapi import status
from sqlalchemy.orm import Session
from sqlalchemy import text

from . import database
from . import models
from . import schemas
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Book Registry API",
    description="API para gerenciar um registro de livros.",
    version="0.1.0"
)

# Configuração do CORS
origins = [
    "http://localhost",
    "http://localhost:3000", # Porta padrão do React
    "http://localhost:5173", # Porta padrão do Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health Check"])
def health_check(db: Session = Depends(database.get_db)):
    """Verifica se a API e a conexão com o banco de dados estão no ar."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
        db_error = None
    except Exception as e:
        db_status = "error"
        db_error = str(e)
    
    return {"api_status": "ok", "db_status": db_status, "db_error": db_error}


@app.post("/books", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED, tags=["Books"])
def create_book(book: schemas.BookCreate, db: Session = Depends(database.get_db)):
    db_book = models.Book(titulo=book.titulo, autor=book.autor)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@app.get("/books", response_model=list[schemas.BookResponse], tags=["Books"])
def list_books(db: Session = Depends(database.get_db)):
    return db.query(models.Book).all()
