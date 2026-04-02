from fastapi import FastAPI
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
def health_check():
    """Verifica se a API está no ar."""
    return {"status": "ok"}
