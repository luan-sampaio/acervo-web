from argparse import ArgumentParser
from random import Random

from app.database import SessionLocal
from app.models import Book

TITLE_PREFIXES = [
    "A Casa",
    "O Segredo",
    "Memorias",
    "Cidade",
    "Manual",
    "Caderno",
    "Atlas",
    "Noites",
    "Labirinto",
    "Horizonte",
    "Vento",
    "Arquivo",
]

TITLE_SUFFIXES = [
    "do Norte",
    "de Inverno",
    "dos Ecos",
    "de Vidro",
    "da Colina",
    "das Marcas",
    "do Amanhecer",
    "sem Nome",
    "das Estrelas",
    "de Ferro",
    "do Porto",
    "Final",
]

AUTHOR_FIRST_NAMES = [
    "Ana",
    "Bruno",
    "Carla",
    "Diego",
    "Elisa",
    "Fabio",
    "Gabriela",
    "Helena",
    "Igor",
    "Julia",
    "Karen",
    "Lucas",
]

AUTHOR_LAST_NAMES = [
    "Almeida",
    "Barbosa",
    "Cardoso",
    "Duarte",
    "Esteves",
    "Ferraz",
    "Gomes",
    "Henrique",
    "Ibrahim",
    "Junqueira",
    "Klein",
    "Lopes",
]


def build_book_payloads(count: int, seed: int) -> list[dict[str, str]]:
    randomizer = Random(seed)
    books = []

    for index in range(count):
        prefix = TITLE_PREFIXES[index % len(TITLE_PREFIXES)]
        suffix = TITLE_SUFFIXES[(index // len(TITLE_PREFIXES)) % len(TITLE_SUFFIXES)]
        author_first = AUTHOR_FIRST_NAMES[index % len(AUTHOR_FIRST_NAMES)]
        author_last = AUTHOR_LAST_NAMES[(index * 3) % len(AUTHOR_LAST_NAMES)]

        volume = randomizer.randint(1, 9)

        books.append(
            {
                "titulo": f"{prefix} {suffix} Vol. {volume}",
                "autor": f"{author_first} {author_last}",
            }
        )

    return books


def seed_books(count: int, reset: bool, seed: int) -> tuple[int, int]:
    db = SessionLocal()
    deleted_count = 0

    try:
        if reset:
            deleted_count = db.query(Book).delete()
            db.commit()

        payloads = build_book_payloads(count=count, seed=seed)
        db.add_all([Book(**payload) for payload in payloads])
        db.commit()
        return deleted_count, len(payloads)
    finally:
        db.close()


def main() -> None:
    parser = ArgumentParser(description="Popula o banco com livros mockados para testes manuais.")
    parser.add_argument("--count", type=int, default=36, help="Quantidade de livros a criar.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Remove os livros existentes antes de inserir os novos registros.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Semente usada para gerar volumes de forma reproduzivel.",
    )
    args = parser.parse_args()

    if args.count < 1:
        raise SystemExit("O valor de --count deve ser maior que zero.")

    deleted_count, created_count = seed_books(count=args.count, reset=args.reset, seed=args.seed)

    if args.reset:
        print(f"Livros removidos: {deleted_count}")
    print(f"Livros criados: {created_count}")


if __name__ == "__main__":
    main()
