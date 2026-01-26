import httpx
import asyncio
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Twitch credentials
CLIENT_ID = os.getenv("TWITCH_CLIENT_ID")
CLIENT_SECRET = os.getenv("TWITCH_CLIENT_SECRET")
# Telegram credentials
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHANNEL_ID = os.getenv("TELEGRAM_CHANNEL_ID")
# User to track
TWITCH_USERNAME = "akimaryy"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("twitch_tracker")

class TwitchTracker:
    def __init__(self):
        self.access_token = None
        self.is_live = False

    async def get_access_token(self):
        if not CLIENT_ID or not CLIENT_SECRET:
            logger.error("Twitch CLIENT_ID or CLIENT_SECRET not set")
            return

        url = "https://id.twitch.tv/oauth2/token"
        params = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "client_credentials"
        }
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, params=params)
                data = resp.json()
                self.access_token = data.get("access_token")
                logger.info("Obtained new Twitch access token")
            except Exception as e:
                logger.error(f"Error obtaining Twitch token: {e}")

    async def check_stream_status(self):
        if not CLIENT_ID or not CLIENT_SECRET:
            return

        if not self.access_token:
            await self.get_access_token()
            if not self.access_token:
                return

        url = f"https://api.twitch.tv/helix/streams?user_login={TWITCH_USERNAME}"
        headers = {
            "Client-ID": CLIENT_ID,
            "Authorization": f"Bearer {self.access_token}"
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 401: # Token expired
                    await self.get_access_token()
                    return await self.check_stream_status()

                data = resp.json()
                streams = data.get("data", [])
                
                if streams:
                    if not self.is_live:
                        self.is_live = True
                        stream_info = streams[0]
                        logger.info(f"{TWITCH_USERNAME} is LIVE! Sending notification...")
                        await self.send_telegram_notification(stream_info)
                else:
                    if self.is_live:
                        logger.info(f"{TWITCH_USERNAME} went offline.")
                    self.is_live = False
            except Exception as e:
                logger.error(f"Error checking stream status: {e}")

    async def send_telegram_notification(self, stream_info):
        if not BOT_TOKEN or not CHANNEL_ID:
            logger.warning("TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set")
            return

        title = stream_info.get("title", "Без названия")
        game = stream_info.get("game_name", "Не указана")
        url = f"https://www.twitch.tv/{TWITCH_USERNAME}"
        
        message = (
            f"🔴 **Akimary в эфире!**\n\n"
            f"🎬 **Стрим:** {title}\n"
            f"🎮 **Игра:** {game}\n\n"
            f"🚀 Залетай скорее: {url}"
        )

        tg_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": CHANNEL_ID,
            "text": message,
            "parse_mode": "Markdown"
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(tg_url, json=payload)
                if resp.status_code == 200:
                    logger.info("Telegram notification sent successfully")
                else:
                    logger.error(f"Failed to send Telegram notification: {resp.text}")
            except Exception as e:
                logger.error(f"Error sending Telegram notification: {e}")

    async def send_custom_notification(self, text):
        if not BOT_TOKEN or not CHANNEL_ID:
            logger.warning("TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set")
            return False

        tg_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": CHANNEL_ID,
            "text": text,
            "parse_mode": "Markdown"
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(tg_url, json=payload)
                if resp.status_code == 200:
                    logger.info("Custom Telegram notification sent")
                    return True
                else:
                    logger.error(f"Failed to send custom notification: {resp.text}")
                    return False
            except Exception as e:
                logger.error(f"Error sending custom notification: {e}")
                return False

tracker = TwitchTracker()

async def start_tracker_loop():
    logger.info("Starting Twitch tracker loop...")
    while True:
        try:
            await tracker.check_stream_status()
        except Exception as e:
            logger.error(f"Error in tracker loop: {e}")
        await asyncio.sleep(60) # Проверка каждую минуту
