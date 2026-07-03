from rest_framework import generics, status, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Song, Genre, Favorite, Playlist
from .serializers import (
    SongSerializer, GenreSerializer,
    FavoriteSerializer, PlaylistSerializer,
)


class SongListAPI(generics.ListAPIView):
    """
    GET /api/songs/
    Paginated, searchable, filterable song list.
    Query params: ?search=, ?genre=<slug>
    """
    serializer_class = SongSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'artist']
    ordering_fields = ['title', 'artist', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Song.objects.select_related('genre', 'album').all()
        genre_slug = self.request.query_params.get('genre')
        if genre_slug:
            qs = qs.filter(genre__slug=genre_slug)
        return qs


class SongDetailAPI(generics.RetrieveAPIView):
    """GET /api/songs/<id>/"""
    serializer_class = SongSerializer
    permission_classes = [AllowAny]
    queryset = Song.objects.select_related('genre', 'album').all()


class GenreListAPI(generics.ListAPIView):
    """GET /api/genres/"""
    serializer_class = GenreSerializer
    permission_classes = [AllowAny]
    queryset = Genre.objects.all()
    pagination_class = None  # Return all genres without pagination


class UserFavoritesAPI(generics.ListAPIView):
    """GET /api/favorites/ — list current user's favorites."""
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(
            user=self.request.user
        ).select_related('song', 'song__genre')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, song_id):
    """
    POST /api/favorites/toggle/<song_id>/
    Toggles favorite on/off. Returns {favorited: true/false}.
    """
    song = get_object_or_404(Song, pk=song_id)
    favorite, created = Favorite.objects.get_or_create(
        user=request.user, song=song
    )
    if not created:
        favorite.delete()
        return Response({'favorited': False}, status=status.HTTP_200_OK)
    return Response({'favorited': True}, status=status.HTTP_201_CREATED)

class PlaylistViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Playlists via /api/playlists/
    """
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user).prefetch_related('songs')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        if not song_id:
            return Response({'error': 'song_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        song = get_object_or_404(Song, pk=song_id)
        playlist.songs.add(song)
        return Response({'status': 'song added'}, status=status.HTTP_200_OK)
