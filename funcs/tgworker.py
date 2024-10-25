from aiogram.types import WebAppInfo, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from funcs.conf import settings

from aiogram import Router
from aiogram import filters
from aiogram.types import Message

#базобот для отображения

user_router = Router()
 
@user_router.message(filters.CommandStart())
async def send_welcome(message: Message):
   await message.reply("Привет! Я бот, который... ну, в общем, нихуя не умеет. Вообще. Но я здесь, чтобы быть бесполезным на все 100%. Чем могу не помочь?")
 

def main_keyboard() -> InlineKeyboardMarkup:
    generate_url = settings.BASE_SITE
    kb = InlineKeyboardBuilder()
    kb.button(text="📅 Расписание", web_app=WebAppInfo(url=f"{generate_url}/bissiebis"))
    kb.adjust(1)
    return kb.as_markup()



@user_router.message(filters.Command(commands="schedule"))
async def send_welcome(message: Message):    
    await message.reply("Эээ здесь ты будешь знать куда и зачем", reply_markup=main_keyboard())
 

