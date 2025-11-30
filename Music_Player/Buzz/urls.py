from django.conf import settings
from django.conf.urls import static
from . import views
from django.urls import path

app_name='buzz'
urlpatterns=[
    path('', views.index, name='index'),
    path('visualizer/', views.visualizer, name='visualizer'),
]   