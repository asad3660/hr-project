from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/resumes/", include("resumes.urls")),
    path("api/search/", include("search.urls")),
    path("api/chatbot/", include("chatbot.urls")),
    path("api/interviews/", include("interviews.urls")),
]
