from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone
from bson import ObjectId
from core.db import get_db
from .services.chatbot_service import get_response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    query = request.data.get("query", "").strip()

    if not query:
        return Response(
            {"error": "Query is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    result = get_response(query)

    # Log conversation to MongoDB
    db = get_db()
    conversation = {
        "user_id": request.user.id,
        "username": request.user.username,
        "query": query,
        "retrieved_chunks": result["retrieved_chunks"],
        "response": result["response"],
        "created_at": datetime.now(timezone.utc),
    }
    db.conversations.insert_one(conversation)

    return Response(
        {
            "query": query,
            "response": result["response"],
            "sources": result["retrieved_chunks"],
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request):
    db = get_db()
    conversations = list(
        db.conversations.find({"user_id": request.user.id})
        .sort("created_at", -1)
        .limit(50)
    )
    for c in conversations:
        c["_id"] = str(c["_id"])
    return Response(conversations)
