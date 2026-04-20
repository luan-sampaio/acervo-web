from pathlib import Path
import sys
from types import SimpleNamespace
import unittest

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.services.book_stats import build_book_stats_response


class BookStatsResponseTest(unittest.TestCase):
    def test_builds_dashboard_stats_with_percentages(self):
        stats = SimpleNamespace(
            total_books=12,
            favorite_count=3,
            reading_now_count=2,
            finished_count=8,
            want_to_read_count=2,
            annotation_count=6,
            rated_count=5,
            average_rating=4.25,
            dated_reading_count=4,
            review_count=3,
            annual_finished_count=6,
        )

        response = build_book_stats_response(stats)

        self.assertEqual(response["total_books"], 12)
        self.assertEqual(response["favorite_count"], 3)
        self.assertEqual(response["reading_now_count"], 2)
        self.assertEqual(response["finished_count"], 8)
        self.assertEqual(response["want_to_read_count"], 2)
        self.assertEqual(response["annotation_count"], 6)
        self.assertEqual(response["rated_count"], 5)
        self.assertEqual(response["unrated_finished_count"], 3)
        self.assertEqual(response["average_rating"], 4.25)
        self.assertEqual(response["dated_reading_count"], 4)
        self.assertEqual(response["review_count"], 3)
        self.assertEqual(response["annual_finished_count"], 6)
        self.assertEqual(response["annual_goal"], 12)
        self.assertEqual(response["completion_rate"], 66.7)
        self.assertEqual(response["annotation_rate"], 75.0)
        self.assertEqual(response["review_rate"], 37.5)
        self.assertEqual(response["annual_goal_rate"], 50.0)

    def test_builds_zeroed_stats_without_dividing_by_zero(self):
        stats = SimpleNamespace(
            total_books=0,
            favorite_count=0,
            reading_now_count=0,
            finished_count=0,
            want_to_read_count=0,
            annotation_count=0,
            rated_count=0,
            average_rating=None,
            dated_reading_count=0,
            review_count=0,
            annual_finished_count=0,
        )

        response = build_book_stats_response(stats)

        self.assertEqual(response["total_books"], 0)
        self.assertEqual(response["unrated_finished_count"], 0)
        self.assertIsNone(response["average_rating"])
        self.assertEqual(response["completion_rate"], 0)
        self.assertEqual(response["annotation_rate"], 0)
        self.assertEqual(response["review_rate"], 0)
        self.assertEqual(response["annual_goal_rate"], 0)

    def test_never_returns_negative_unrated_finished_count(self):
        stats = SimpleNamespace(
            total_books=4,
            favorite_count=0,
            reading_now_count=0,
            finished_count=2,
            want_to_read_count=2,
            annotation_count=3,
            rated_count=3,
            average_rating=5,
            dated_reading_count=0,
            review_count=0,
            annual_finished_count=0,
        )

        response = build_book_stats_response(stats)

        self.assertEqual(response["unrated_finished_count"], 0)

    def test_caps_annual_goal_rate_at_one_hundred(self):
        stats = SimpleNamespace(
            total_books=20,
            favorite_count=0,
            reading_now_count=0,
            finished_count=20,
            want_to_read_count=0,
            annotation_count=20,
            rated_count=20,
            average_rating=5,
            dated_reading_count=20,
            review_count=0,
            annual_finished_count=18,
        )

        response = build_book_stats_response(stats)

        self.assertEqual(response["annual_goal_rate"], 100)


if __name__ == "__main__":
    unittest.main()
