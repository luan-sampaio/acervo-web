import re
import unicodedata


_BRACKETED_TEXT_RE = re.compile(r"\([^)]*\)|\[[^]]*\]|\{[^}]*\}")
_TITLE_SEPARATOR_RE = re.compile(r"\s+[-:–—]\s+")
_EDITION_WORDS_RE = re.compile(
    r"\b("
    r"edicao|edição|ed|especial|comentada|comentado|revista|revisto|"
    r"ampliada|ampliado|ilustrada|ilustrado|brochura|capa dura|"
    r"volume|vol|colecao|coleção"
    r")\b"
)
_EDITION_NUMBER_RE = re.compile(r"\b\d+\s*(a|ª|o|º)?\s*(edicao|edição|ed)\b")
_AUTHOR_SEPARATOR_RE = re.compile(r"\s*[,;]\s*")
_PUNCTUATION_RE = re.compile(r"[^a-z0-9]+")
_SPACE_RE = re.compile(r"\s+")


def normalize_identity_text(value: str) -> str:
    without_accents = unicodedata.normalize("NFKD", value)
    ascii_value = without_accents.encode("ascii", "ignore").decode("ascii")
    lowered = ascii_value.lower()
    without_punctuation = _PUNCTUATION_RE.sub(" ", lowered)
    return _SPACE_RE.sub(" ", without_punctuation).strip()


def normalize_book_title(value: str) -> str:
    title = _BRACKETED_TEXT_RE.sub(" ", value)
    title = _TITLE_SEPARATOR_RE.split(title, maxsplit=1)[0]
    title = _EDITION_NUMBER_RE.sub(" ", title)
    title = _EDITION_WORDS_RE.sub(" ", title)
    return normalize_identity_text(title)


def normalize_book_author(value: str) -> str:
    primary_author = _AUTHOR_SEPARATOR_RE.split(value, maxsplit=1)[0]
    return normalize_identity_text(primary_author)


def build_book_identity(titulo: str, autor: str) -> tuple[str, str]:
    return normalize_book_title(titulo), normalize_book_author(autor)
