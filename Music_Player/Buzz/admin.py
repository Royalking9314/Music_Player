from django.contrib import admin
from .models import Song, Lyrics

# Register your models here.


class LyricsInline(admin.StackedInline):
    model = Lyrics
    extra = 0
    fields = ('lyrics_text', 'timestamps')
    
    def get_readonly_fields(self, request, obj=None):
        # Make timestamps readonly in admin, it should be populated from lyrics_text
        return []


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'duration')
    search_fields = ('title', 'artist')
    inlines = [LyricsInline]


@admin.register(Lyrics)
class LyricsAdmin(admin.ModelAdmin):
    list_display = ('song', 'created_at', 'updated_at')
    search_fields = ('song__title', 'lyrics_text')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Song Information', {
            'fields': ('song',)
        }),
        ('Lyrics Data', {
            'fields': ('lyrics_text', 'timestamps'),
            'description': 'Enter lyrics in LRC format with timestamps like [00:12.50]Line text'
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )