from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import api_views

app_name = 'buzz'

router = DefaultRouter()
router.register(r'playlists', api_views.PlaylistViewSet, basename='playlist')

urlpatterns = [
    # Page views
    path('', views.index, name='index'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # REST API
    path('api/', include(router.urls)),
    path('api/songs/', api_views.SongListAPI.as_view(), name='api-songs'),
    path('api/songs/<int:pk>/', api_views.SongDetailAPI.as_view(), name='api-song-detail'),
    path('api/genres/', api_views.GenreListAPI.as_view(), name='api-genres'),
    path('api/favorites/', api_views.UserFavoritesAPI.as_view(), name='api-favorites'),
    path('api/favorites/toggle/<int:song_id>/', api_views.toggle_favorite, name='api-toggle-favorite'),
]