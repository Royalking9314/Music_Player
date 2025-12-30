from django.conf import settings
from django.conf.urls import static
from . import views
from django.urls import path

app_name='buzz'
urlpatterns=[
    path('', views.index, name='index'),
    path('save-synced-lyrics/<int:song_id>/', views.save_synced_lyrics, name='save_synced_lyrics'),
]   