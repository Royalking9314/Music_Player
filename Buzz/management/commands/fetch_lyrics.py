"""
Management command to fetch synced lyrics for a song.

Usage:
    python manage.py fetch_lyrics "Song Name"
    python manage.py fetch_lyrics "Song Name" --save
    python manage.py fetch_lyrics --all
"""
import re
import json
from django.core.management.base import BaseCommand, CommandError

try:
    import syncedlyrics
    HAS_SYNCEDLYRICS = True
except ImportError:
    HAS_SYNCEDLYRICS = False

from Buzz.models import Song


class Command(BaseCommand):
    help = 'Fetch synced lyrics for songs and optionally save to the database'

    def add_arguments(self, parser):
        parser.add_argument(
            'query', nargs='?', type=str,
            help='Song name to search lyrics for'
        )
        parser.add_argument(
            '--save', action='store_true',
            help='Save fetched lyrics to the matching Song record'
        )
        parser.add_argument(
            '--all', action='store_true',
            help='Fetch lyrics for all songs that have no lyrics'
        )

    def handle(self, *args, **options):
        if not HAS_SYNCEDLYRICS:
            raise CommandError(
                'syncedlyrics package is not installed. '
                'Run: pip install syncedlyrics'
            )

        if options['all']:
            self._fetch_all(save=options['save'])
        elif options['query']:
            self._fetch_one(options['query'], save=options['save'])
        else:
            raise CommandError(
                'Provide a song name or use --all to fetch for all songs.'
            )

    def _fetch_one(self, query, save=False):
        """Fetch lyrics for a single query."""
        self.stdout.write(f'Searching lyrics for: "{query}"...')

        lrc = syncedlyrics.search(query)
        if not lrc:
            self.stderr.write(self.style.WARNING(f'No lyrics found for "{query}".'))
            return

        json_data = self._parse_lrc(lrc)
        json_string = json.dumps(json_data, indent=2)

        self.stdout.write(self.style.SUCCESS(f'Found {len(json_data)} lyric lines.'))
        self.stdout.write(json_string)

        if save:
            # Try to find a matching song
            songs = Song.objects.filter(title__icontains=query)
            if songs.exists():
                song = songs.first()
                song.lyrics = json_string
                song.save(update_fields=['lyrics'])
                self.stdout.write(self.style.SUCCESS(
                    f'Saved lyrics to song: "{song.title}"'
                ))
            else:
                self.stderr.write(self.style.WARNING(
                    f'No song in the database matches "{query}". '
                    'Lyrics printed but not saved.'
                ))

    def _fetch_all(self, save=False):
        """Fetch lyrics for all songs missing lyrics."""
        songs = Song.objects.filter(lyrics__isnull=True) | Song.objects.filter(lyrics='')
        if not songs.exists():
            self.stdout.write(self.style.SUCCESS('All songs already have lyrics!'))
            return

        for song in songs:
            query = f"{song.title} {song.artist}"
            self.stdout.write(f'\nSearching: "{query}"...')

            try:
                lrc = syncedlyrics.search(query)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Error fetching lyrics: {e}'))
                continue

            if not lrc:
                self.stderr.write(self.style.WARNING('  No lyrics found.'))
                continue

            json_data = self._parse_lrc(lrc)
            json_string = json.dumps(json_data, indent=2)
            self.stdout.write(self.style.SUCCESS(
                f'  Found {len(json_data)} lyric lines.'
            ))

            if save:
                song.lyrics = json_string
                song.save(update_fields=['lyrics'])
                self.stdout.write(self.style.SUCCESS('  Saved to database.'))

    def _parse_lrc(self, lrc_text):
        """Parse LRC format to JSON list of {time, lyrics} entries."""
        lines = lrc_text.split('\n')
        json_data = []
        pattern = r'\[(\d+:\d+\.\d+)\] (.+)'

        for line in lines:
            match = re.match(pattern, line)
            if match:
                timestamp, text = match.groups()
                json_data.append({
                    'time': timestamp,
                    'lyrics': text,
                })

        return json_data
