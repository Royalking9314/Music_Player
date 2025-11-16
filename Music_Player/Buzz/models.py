from django.db import models
import json

# Create your models here.

class Song(models.Model):
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    image = models.ImageField(upload_to='images/')
    lyrics = models.TextField(null=True, blank=True)
    duration = models.DurationField(max_length=20, default="00:15:00", null=True, blank=True)
    audio_file = models.FileField(upload_to='songs/', null=True, blank=True)
    audio_link = models.CharField(max_length=500, default="True", null=True, blank=True)
    paginate_by = 2

    def __str__(self):
        return self.title


class Lyrics(models.Model):
    """
    Model to store synchronized lyrics with timestamps.
    Supports LRC format parsing and line-by-line synchronization.
    """
    song = models.OneToOneField(Song, on_delete=models.CASCADE, related_name='synchronized_lyrics')
    lyrics_text = models.TextField(help_text="Full lyrics text")
    timestamps = models.JSONField(
        default=list,
        help_text="JSON array of objects with 'time' (in seconds) and 'text' fields"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Lyrics"

    def __str__(self):
        return f"Lyrics for {self.song.title}"

    @staticmethod
    def parse_lrc_time(time_str):
        """
        Parse LRC timestamp format [mm:ss.xx] to seconds.
        Example: [00:12.50] -> 12.5
        """
        time_str = time_str.strip('[]')
        parts = time_str.split(':')
        minutes = int(parts[0])
        seconds = float(parts[1])
        return minutes * 60 + seconds

    def parse_lrc_content(self, lrc_content):
        """
        Parse LRC format content and populate timestamps field.
        LRC format example:
        [00:12.00]Line one of lyrics
        [00:17.20]Line two of lyrics
        """
        lines = lrc_content.strip().split('\n')
        timestamps_list = []
        lyrics_parts = []

        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Match lines with timestamps [mm:ss.xx]
            if line.startswith('[') and ']' in line:
                # Extract timestamp and text
                bracket_end = line.index(']')
                time_str = line[0:bracket_end+1]
                text = line[bracket_end+1:].strip()
                
                # Skip metadata tags (artist, title, etc.)
                if ':' in time_str[1:bracket_end] and time_str[1:3].isdigit():
                    try:
                        time_seconds = self.parse_lrc_time(time_str)
                        timestamps_list.append({
                            'time': time_seconds,
                            'text': text
                        })
                        lyrics_parts.append(text)
                    except (ValueError, IndexError):
                        continue

        # Sort by time
        timestamps_list.sort(key=lambda x: x['time'])
        self.timestamps = timestamps_list
        self.lyrics_text = '\n'.join(lyrics_parts)
        return timestamps_list