"""Merge ranked retrieval lists using Reciprocal Rank Fusion."""


def reciprocal_rank_fusion(
    rankings: list[list[str]],
    rank_constant: int = 60,
) -> list[tuple[str, float]]:
    """Score each FAQ by the reciprocal positions it earns across ranking lists."""
    scores: dict[str, float] = {}
    for ranking in rankings:
        for position, faq_id in enumerate(ranking, start=1):
            scores[faq_id] = scores.get(faq_id, 0.0) + 1 / (
                rank_constant + position
            )

    # Sort IDs on ties so repeated runs return the same order.
    return sorted(scores.items(), key=lambda item: (-item[1], item[0]))
