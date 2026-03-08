from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from core.db import get_db
from core.permissions import IsAdmin
from .authentication import generate_token


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role", "interviewer")

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if role not in ("admin", "hr", "interviewer"):
        return Response(
            {"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST
        )

    db = get_db()
    if db.users.find_one({"username": username}):
        return Response(
            {"error": "Username already exists"}, status=status.HTTP_409_CONFLICT
        )

    user_doc = {
        "username": username,
        "password": generate_password_hash(password),
        "role": role,
        "created_at": datetime.now(timezone.utc),
    }
    result = db.users.insert_one(user_doc)
    token = generate_token(str(result.inserted_id))

    return Response(
        {
            "token": token,
            "user": {
                "id": str(result.inserted_id),
                "username": username,
                "role": role,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    db = get_db()
    user_doc = db.users.find_one({"username": username})

    if not user_doc or not check_password_hash(user_doc["password"], password):
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    token = generate_token(str(user_doc["_id"]))

    return Response(
        {
            "token": token,
            "user": {
                "id": str(user_doc["_id"]),
                "username": user_doc["username"],
                "role": user_doc["role"],
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(
        {
            "id": request.user.id,
            "username": request.user.username,
            "role": request.user.role,
        }
    )


@api_view(["GET"])
@permission_classes([IsAdmin])
def user_list(request):
    db = get_db()
    users = list(db.users.find({}, {"password": 0}))
    for u in users:
        u["_id"] = str(u["_id"])
    return Response(users)
