import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from funcs.tgworker import user_router

from funcs.conf import settings

from funcs import parser

TOKEN = settings.BOT_TOKEN

dp = Dispatcher()
dp.include_router(user_router)

async def main() -> None:
    bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))

    periodic_task = asyncio.create_task(parser.periodic_check(10))

    await dp.start_polling(bot)
    await periodic_task
    

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())