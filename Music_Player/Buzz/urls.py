from django.conf import settings
from django.conf.urls import static
from . import views
from django.urls import path

app_name='buzz'
urlpatterns=[
    path('', views.index, name='index'),
    path('modern/', views.modern_player, name='modern_player'),
]   