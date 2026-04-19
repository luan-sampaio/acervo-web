# 📚 Acervo Web

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13-blue?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Uma aplicação web full-stack para registro e acompanhamento de leitura pessoal. O sistema permite cadastrar livros, acompanhar o status de leitura (quero ler, lendo, lido), marcar favoritos, registrar notas, resenhas e datas de leitura, além de visualizar métricas do acervo em um painel dedicado. O frontend foi construído com React e TanStack Query, oferecendo uma experiência fluida com paginação server-side, filtros dinâmicos e feedback visual em tempo real.

## ✨ Funcionalidades

### 📖 Coleção
- **CRUD completo de livros:** cadastro, edição inline e remoção com modal de confirmação
- **Status de leitura:** controle por livro entre "Quero ler", "Lendo" e "Lido", com badges coloridos por status
- **Favoritos:** marcação e filtragem de livros favoritos
- **Anotações de leitura:** notas, resenhas e datas de início/término vinculadas ao livro
- **Feedback imediato:** atualização otimista das anotações com TanStack Query
- **Busca e filtros:** busca por título/autor e filtros rápidos por status, com debounce
- **Paginação e ordenação server-side:** por data de cadastro, título ou autor, com controle de itens por página

### 📊 Painel
- Métricas agregadas do acervo (total de livros, distribuição por status, favoritos)
- Resumo de leitura com livros anotados, média de nota, histórico e resenhas
- Listagem dos registros mais recentes
- Navegação direta para a coleção

---

## 📂 Estrutura do Projeto

```text
acervo-web/
├── backend/
│   ├── app/
│   │   ├── main.py              # Configuração FastAPI e CORS
│   │   ├── models.py            # Modelos SQLAlchemy
│   │   ├── schemas.py           # Schemas Pydantic
│   │   ├── database.py          # Conexão com o banco
│   │   ├── config.py            # Variáveis de ambiente
│   │   └── routers/
│   │       ├── annotations.py   # Endpoints de anotações de leitura
│   │       ├── auth.py          # Endpoints de autenticação
│   │       ├── books.py         # Endpoints de livros
│   │       └── search.py        # Busca externa de livros
│   ├── alembic/                 # Migrations do banco
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/               # Páginas (Home, Coleção, Painel)
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── services/
│   │   │   └── api.js           # Cliente Axios e chamadas à API
│   │   ├── constants.js         # Constantes da aplicação
│   │   ├── utils.js             # Funções utilitárias
│   │   └── index.css            # Design system (CSS customizado)
│   ├── package.json
│   └── Dockerfile
├── .env                         # Variáveis de ambiente (não versionado)
├── .env.example                 # Exemplo de variáveis de ambiente
└── docker-compose.yml           # Orquestração dos serviços
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Linguagem:** Python 3.11
- **Framework:** FastAPI
- **Banco de dados:** PostgreSQL 13
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Validação:** Pydantic v2

### Frontend
- **Framework:** React 18
- **Roteamento:** React Router v6
- **Requisições e cache:** TanStack Query v5
- **HTTP Client:** Axios
- **Estilização:** CSS customizado com design system próprio

### Infraestrutura
- **Containerização:** Docker + Docker Compose

---

## 💻 Pré-requisitos

- [Docker](https://www.docker.com/get-started) e Docker Compose
- [Git](https://git-scm.com)

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
   Edite o `.env` com as credenciais do banco de dados.

3. **Suba os containers:**
   ```bash
   docker-compose up --build
   ```
   Isso irá iniciar o banco PostgreSQL, aplicar as migrations automaticamente, subir a API e o frontend.

4. **Acesse a aplicação:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - API: [http://localhost:8000](http://localhost:8000)
   - Documentação da API (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

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
