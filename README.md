# 📚 Acervo Web

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13-blue?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

Uma aplicação web full-stack para registro, organização e acompanhamento de leitura pessoal. O sistema permite cadastrar livros manualmente ou por busca externa, acompanhar status de leitura, marcar favoritos, registrar notas, resenhas e períodos de leitura, além de visualizar métricas, conquistas e meta anual em um painel dedicado.

O frontend foi construído com React, Vite e TanStack Query, oferecendo uma experiência fluida com cache, atualizações otimistas, paginação server-side, filtros dinâmicos e feedback visual. O backend usa FastAPI, PostgreSQL, SQLAlchemy e Alembic, concentrando regras de negócio, validações e agregações no servidor.

## 🎬 Preview



## ✨ Funcionalidades

### 🔐 Autenticação

- **Cadastro e login com JWT:** acesso seguro por usuário.
- **Rotas privadas:** painel e coleção exigem autenticação.
- **Logout automático em `401`:** tokens expirados ou inválidos limpam a sessão local.
- **Preferências do usuário:** meta anual de leitura configurável pelo próprio usuário.

### 📊 Painel

- **KPIs principais:** total no acervo, lidos, lendo e quero ler.
- **Leitura em andamento:** card de destaque para o livro com status `Lendo`.
- **Fila de próximas leituras:** lista baseada nos livros marcados como `Quero ler`.
- **Métricas agregadas no backend:** o painel não depende de buscar apenas os primeiros livros da coleção.
- **Conquistas:** trilhas de progresso para leitor, crítico, curador e memorialista.
- **Níveis nomeados:** conquistas usam nomes como `Primeiro passo`, `Ritmo constante` e `Leitor veterano`.
- **Meta anual configurável:** o usuário define quantos livros quer ler no ano e acompanha o progresso.

### 📖 Coleção

- **CRUD completo de livros:** cadastro, edição e remoção com modal de confirmação.
- **Cadastro manual ou por busca externa:** integração com Google Books e fallback para Open Library.
- **Capas dos livros:** miniaturas nos cards com placeholder quando não houver imagem.
- **Status de leitura:** controle entre `Quero ler`, `Lendo` e `Lido`, com pills visuais.
- **Favoritos:** marcação e filtro rápido de livros favoritos.
- **Anotações de leitura:** nota, resenha, data de início e data de término.
- **Menu de ações refinado:** ações por card em menu de três pontos com ícones.
- **Busca e filtros:** busca por título/autor, filtros rápidos por status e favorito.
- **Paginação e ordenação server-side:** por data de cadastro, título ou autor.
- **Feedback visual:** snackbars e estados de erro padronizados.

### 🧠 Regras de negócio

- **Acervo isolado por usuário:** cada livro pertence a um usuário autenticado.
- **Duplicidade bloqueada:** evita duplicatas por `external_id` e por título + autor normalizados.
- **Anotações apenas para livros lidos:** a API impede nota, resenha ou período de leitura em livros que ainda não estão como `Lido`.
- **Validação de datas:** a data de término não pode ser anterior à data de início.
- **Uma anotação por livro:** cada usuário pode manter uma anotação por livro.

---

## 📂 Estrutura do Projeto

```text
crud-book/
├── backend/
│   ├── alembic/
│   │   └── versions/                # Migrations do banco de dados
│   ├── app/
│   │   ├── main.py                  # Configuração FastAPI, CORS e handlers globais
│   │   ├── models.py                # Modelos SQLAlchemy
│   │   ├── schemas.py               # Schemas Pydantic
│   │   ├── database.py              # Conexão e sessão com o banco
│   │   ├── config.py                # Variáveis de ambiente
│   │   ├── providers/
│   │   │   ├── google_books.py      # Provider Google Books
│   │   │   └── open_library.py      # Provider Open Library
│   │   ├── services/
│   │   │   ├── books.py             # Regras e consultas de livros
│   │   │   ├── book_search.py       # Orquestração da busca externa
│   │   │   ├── book_stats.py        # Agregações do dashboard
│   │   │   └── book_identity.py     # Normalização de identidade do livro
│   │   └── routers/
│   │       ├── annotations.py       # Endpoints de anotações de leitura
│   │       ├── auth.py              # Endpoints de autenticação e preferências
│   │       ├── books.py             # Endpoints de livros e métricas
│   │       └── search.py            # Endpoint de busca externa
│   ├── tests/                       # Testes unitários do backend
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   ├── context/                 # Contextos globais, incluindo autenticação
│   │   ├── hooks/                   # Hooks de query, mutações e estado da coleção
│   │   ├── pages/                   # Páginas de login, coleção e painel
│   │   ├── services/                # Cliente Axios e helpers de API
│   │   ├── constants.js             # Constantes da aplicação
│   │   ├── utils.js                 # Funções utilitárias
│   │   └── index.css                # Design system em CSS customizado
│   ├── package.json
│   └── Dockerfile
├── .env                             # Variáveis de ambiente locais (não versionado)
├── .env.example                     # Exemplo de variáveis para Docker Compose
└── docker-compose.yml               # Orquestração de Postgres, backend e frontend
```

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **Linguagem:** Python
- **Framework:** FastAPI
- **Banco de dados:** PostgreSQL 13
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Validação:** Pydantic v2
- **Autenticação:** JWT com `python-jose`
- **HTTP externo:** `httpx`

### Frontend

- **Framework:** React 18
- **Build tool:** Vite
- **Roteamento:** React Router v6
- **Requisições e cache:** TanStack Query v5
- **HTTP Client:** Axios
- **Ícones:** Lucide React
- **Estilização:** CSS customizado com design system próprio

### Infraestrutura

- **Containerização:** Docker + Docker Compose
- **Banco local:** PostgreSQL 13 em container
- **Migrations automáticas:** `alembic upgrade head` ao iniciar o backend pelo Compose

---

## 💻 Pré-requisitos

- [Docker](https://www.docker.com/get-started) e Docker Compose
- [Git](https://git-scm.com)

---

## 🚀 Como executar o projeto

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/luan-sampaio/acervo-web.git
   cd acervo-web
   ```

2. **Configure as variáveis de ambiente:**

   ```bash
   cp .env.example .env
   ```

   Para desenvolvimento local com Docker, os valores padrão já funcionam. A chave do Google Books é opcional.

3. **Suba os containers:**

   ```bash
   docker-compose up --build
   ```

   Isso inicia o PostgreSQL, aplica as migrations, sobe a API e inicia o frontend.

4. **Acesse a aplicação:**

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - API: [http://localhost:8000](http://localhost:8000)
   - Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health check: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🔧 Variáveis de Ambiente

O `docker-compose.yml` usa o arquivo `.env` da raiz do projeto.

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=book_db
BACKEND_CORS_ORIGINS=http://localhost,http://localhost:3000,http://localhost:5173
JWT_SECRET_KEY=troque-por-uma-chave-segura-de-pelo-menos-32-chars
GOOGLE_BOOKS_API_KEY=sua_chave_aqui
```

Observações:

- **`JWT_SECRET_KEY`** deve ser trocada em qualquer ambiente que não seja local.
- **`GOOGLE_BOOKS_API_KEY`** é opcional. Sem ela, a busca externa ainda tenta usar endpoints públicos quando possível.
- **`POSTGRES_HOST` e `POSTGRES_PORT`** são definidos pelo Compose para o container do backend.
- Para rodar serviços fora do Docker, use também `backend/.env.example` e `frontend/.env.example` como referência.

---

## 📌 Endpoints Principais

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/me`

### Livros

- `GET /books`
- `GET /books/stats`
- `GET /books/{book_id}`
- `POST /books`
- `PUT /books/{book_id}`
- `DELETE /books/{book_id}`

### Anotações

- `POST /books/{book_id}/annotation`
- `GET /books/{book_id}/annotation`
- `PUT /books/{book_id}/annotation`
- `DELETE /books/{book_id}/annotation`

### Busca externa

- `GET /search?q=...`


---

## 👨‍💻 Autor

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/luan-sampaio">
        <img src="https://avatars.githubusercontent.com/luan-sampaio" width="100px;" alt="Foto de Luan Sampaio no GitHub"/>
        <br>
        <sub>
          <b>Luan Sampaio</b>
        </sub>
      </a>
    </td>
  </tr>
</table>
