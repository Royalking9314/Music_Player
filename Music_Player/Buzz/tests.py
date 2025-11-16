from django.test import TestCase, Client
from django.urls import reverse
from .models import Song, Lyrics
from datetime import timedelta
import json

# Create your tests here.


class LyricsModelTest(TestCase):
    def setUp(self):
        self.song = Song.objects.create(
            title="Test Song",
            artist="Test Artist",
            duration=timedelta(minutes=3, seconds=30)
        )
    
    def test_lyrics_creation(self):
        """Test creating a Lyrics object"""
        lyrics = Lyrics.objects.create(
            song=self.song,
            lyrics_text="Test lyrics",
            timestamps=[
                {"time": 0.0, "text": "First line"},
                {"time": 5.0, "text": "Second line"}
            ]
        )
        self.assertEqual(str(lyrics), "Lyrics for Test Song")
        self.assertEqual(len(lyrics.timestamps), 2)
    
    def test_lrc_parsing(self):
        """Test LRC format parsing"""
        lyrics = Lyrics.objects.create(song=self.song)
        lrc_content = """[00:12.00]Line one
[00:17.50]Line two
[00:23.00]Line three"""
        
        result = lyrics.parse_lrc_content(lrc_content)
        
        self.assertEqual(len(result), 3)
        self.assertEqual(result[0]['time'], 12.0)
        self.assertEqual(result[0]['text'], 'Line one')
        self.assertEqual(result[1]['time'], 17.5)
        self.assertEqual(result[2]['time'], 23.0)


class LyricsAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.song = Song.objects.create(
            title="API Test Song",
            artist="API Test Artist",
            duration=timedelta(minutes=3, seconds=30)
        )
        self.lyrics = Lyrics.objects.create(
            song=self.song,
            lyrics_text="Test lyrics text",
            timestamps=[
                {"time": 0.0, "text": "First line"},
                {"time": 5.0, "text": "Second line"}
            ]
        )
    
    def test_get_lyrics_success(self):
        """Test getting lyrics through API"""
        url = reverse('buzz:get_lyrics', args=[self.song.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        self.assertTrue(data['success'])
        self.assertEqual(data['song_id'], self.song.id)
        self.assertEqual(len(data['timestamps']), 2)
    
    def test_get_lyrics_not_found(self):
        """Test API with non-existent song"""
        url = reverse('buzz:get_lyrics', args=[9999])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.content)
        self.assertFalse(data['success'])
