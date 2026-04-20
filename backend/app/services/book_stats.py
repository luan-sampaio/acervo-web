ANNUAL_READING_GOAL = 12


def build_book_stats_response(stats) -> dict:
    total_books = stats.total_books or 0
    finished_count = stats.finished_count or 0
    annotation_count = stats.annotation_count or 0
    rated_count = stats.rated_count or 0
    review_count = stats.review_count or 0
    annual_finished_count = stats.annual_finished_count or 0

    return {
        "total_books": total_books,
        "favorite_count": stats.favorite_count or 0,
        "reading_now_count": stats.reading_now_count or 0,
        "finished_count": finished_count,
        "want_to_read_count": stats.want_to_read_count or 0,
        "annotation_count": annotation_count,
        "rated_count": rated_count,
        "unrated_finished_count": max(finished_count - rated_count, 0),
        "average_rating": float(stats.average_rating) if stats.average_rating is not None else None,
        "dated_reading_count": stats.dated_reading_count or 0,
        "review_count": review_count,
        "annual_finished_count": annual_finished_count,
        "annual_goal": ANNUAL_READING_GOAL,
        "completion_rate": _percentage(finished_count, total_books),
        "annotation_rate": _percentage(annotation_count, finished_count),
        "review_rate": _percentage(review_count, finished_count),
        "annual_goal_rate": min(_percentage(annual_finished_count, ANNUAL_READING_GOAL), 100),
    }


def _percentage(value: int, total: int) -> float:
    if total <= 0:
        return 0

    return round((value / total) * 100, 1)
