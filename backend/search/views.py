from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from core.permissions import IsHR
from .services.embedding_service import vector_search, rebuild_embeddings


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_resumes(request):
    query = request.query_params.get("q", "").strip()
    top_k = int(request.query_params.get("top_k", "5"))

    if not query:
        return Response(
            {"error": "Query parameter 'q' is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    top_k = min(max(top_k, 1), 20)  # Clamp between 1-20

    results = vector_search(query, top_k=top_k)

    return Response({"query": query, "results": results, "count": len(results)})


@api_view(["POST"])
@permission_classes([IsHR])
def rebuild_index(request):
    count = rebuild_embeddings()
    return Response({"message": f"Re-embedded {count} chunks"})
