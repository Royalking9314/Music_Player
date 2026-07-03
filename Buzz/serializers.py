from rest_framework import serializers
from .models import Song, Genre, Album, Favorite


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug', 'color']


class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ['id', 'title', 'artist', 'cover_image', 'year']


class SongSerializer(serializers.ModelSerializer):
    genre = GenreSerializer(read_only=True)
    album = AlbumSerializer(read_only=True)
    audio_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = [
            'id', 'title', 'artist', 'image_url', 'lyrics',
            'duration', 'audio_url', 'audio_link', 'genre',
            'album', 'created_at', 'is_favorite',
        ]

    def get_audio_url(self, obj):
        request = self.context.get('request')
        if obj.audio_file and request:
            return request.build_absolute_uri(obj.audio_file.url)
        return obj.audio_link or ''

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return ''

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(
                user=request.user, song=obj
            ).exists()
        return False


class SongListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the sidebar song list."""
    genre_name = serializers.CharField(source='genre.name', default='')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'genre_name', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return ''


class FavoriteSerializer(serializers.ModelSerializer):
    song = SongListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'song', 'created_at']
