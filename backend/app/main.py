from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from . import database
from .config import settings
from .routers import annotations, auth, books, search

app = FastAPI(
    title="Acervo Web API",
    description="API para gerenciar um acervo pessoal de livros.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Dados inválidos",
            "errors": [
                {
                    "field": ".".join(str(part) for part in error["loc"]),
                    "message": error["msg"],
                }
                for error in exc.errors()
            ],
        },
    )

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(annotations.router)
app.include_router(search.router)

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
