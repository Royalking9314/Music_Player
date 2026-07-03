from django.contrib import admin
from .models import Song, Genre, Album, Favorite


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'color')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'year')
    search_fields = ('title', 'artist')
    list_filter = ('year',)


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'genre', 'album', 'created_at')
    list_filter = ('genre', 'album', 'created_at')
    search_fields = ('title', 'artist')
    autocomplete_fields = ('genre', 'album')


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'song', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'song__title')