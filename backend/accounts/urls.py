from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login),
    path("me/", views.me),
    path("users/", views.user_list),
]
