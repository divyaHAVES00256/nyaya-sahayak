import unittest

from backend.retrieval.fusion import reciprocal_rank_fusion


class ReciprocalRankFusionTests(unittest.TestCase):
    def test_item_ranked_first_by_both_retrievers_gets_combined_score(self) -> None:
        fused = reciprocal_rank_fusion(
            [
                ["FAQ_A", "FAQ_B"],
                ["FAQ_A", "FAQ_C"],
            ]
        )

        self.assertEqual(fused[0][0], "FAQ_A")
        self.assertAlmostEqual(fused[0][1], 2 / 61)

    def test_equal_scores_have_deterministic_id_order(self) -> None:
        fused = reciprocal_rank_fusion(
            [
                ["FAQ_B", "FAQ_A"],
                ["FAQ_A", "FAQ_B"],
            ]
        )

        self.assertEqual([faq_id for faq_id, _ in fused], ["FAQ_A", "FAQ_B"])


if __name__ == "__main__":
    unittest.main()
