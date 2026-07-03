import os
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.text import slugify


def validate_audio_file(value):
    """Validate audio file extension and size (max 50MB)."""
    ext = os.path.splitext(value.name)[1].lower()
    allowed_extensions = ['.mp3', '.wav', '.ogg', '.flac']
    if ext not in allowed_extensions:
        raise ValidationError(
            f'Unsupported audio format "{ext}". Allowed: {", ".join(allowed_extensions)}'
        )
    max_size = 50 * 1024 * 1024  # 50 MB
    if value.size > max_size:
        raise ValidationError('Audio file too large. Max size is 50 MB.')


def validate_image_file(value):
    """Validate image file size (max 10MB)."""
    max_size = 10 * 1024 * 1024  # 10 MB
    if value.size > max_size:
        raise ValidationError('Image file too large. Max size is 10 MB.')


class Genre(models.Model):
    """Music genre for categorizing songs."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    color = models.CharField(
        max_length=7, default='#6366f1',
        help_text='Hex color code for genre chip display (e.g. #6366f1)'
    )

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Album(models.Model):
    """Album grouping for songs."""
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200, blank=True)
    cover_image = models.ImageField(
        upload_to='albums/', null=True, blank=True,
        validators=[validate_image_file]
    )
    year = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} ({self.year})" if self.year else self.title


class Song(models.Model):
    """Core model representing a single music track."""
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    image = models.ImageField(
        upload_to='images/',
        validators=[validate_image_file]
    )
    lyrics = models.TextField(null=True, blank=True)
    duration = models.DurationField(
        default="00:15:00", null=True, blank=True
    )
    audio_file = models.FileField(
        upload_to='songs/', null=True, blank=True,
        validators=[validate_audio_file]
    )
    audio_link = models.CharField(
        max_length=500, default="", null=True, blank=True
    )
    genre = models.ForeignKey(
        Genre, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='songs'
    )
    album = models.ForeignKey(
        Album, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='songs'
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Favorite(models.Model):
    """Tracks which songs a user has favorited."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='favorites'
    )
    song = models.ForeignKey(
        Song, on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'song')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} ♥ {self.song.title}"

