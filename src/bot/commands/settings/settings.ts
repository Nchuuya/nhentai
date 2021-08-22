import Verror from 'verror'
import i18n from '../../../lib/i18n'
import saveAndGetUser from '../../../db/save_and_get_user'
import { isSafeModeOn } from './safe_mode'

import { Context } from 'telegraf'
import { User } from '../../../models/user.model'

export default async function settings (ctx: Context): Promise<void> {
  let user: User | undefined
  try {
    user = await saveAndGetUser(ctx)
  } catch (error) {
    throw new Verror(error, 'Getting user')
  }
  const search_type = user.search_type == 'article' ? i18n.t('article') : i18n.t('gallery')
  let search_sorting = ''
  switch (user.search_sorting) {
  case 'date':
  case 'new':
    search_sorting = i18n.t('date')
    break
  case 'popular':
    search_sorting = i18n.t('popular')
    break
  case 'popular-today':
    search_sorting = i18n.t('popular-today')
    break
  case 'popular-week':
    search_sorting = i18n.t('popular-week')
    break
  default:
    search_sorting = i18n.t('date')
    console.error('Strange sorting parameter in user`s settings ' + user.search_sorting)
  }
  const random_locally = user.random_localy ? i18n.t('yes') : i18n.t('no')
  // const can_repeat_in_random = user.can_repeat_in_random ? i18n.t('yes') : i18n.t('no')
  const language = i18n.t('current_language')
  const safe_mode_text = i18n.t('safe_mode') + (isSafeModeOn(user) ? i18n.t('enabled') : i18n.t('disabled'))

  const inlineKeyboard = [
    [{
      text: i18n.t('search_appearance') + search_type,
      callback_data: 'change_search_type',
    }],
    [{
      text: i18n.t('search_sorting') + search_sorting,
      callback_data: 'change_search_sorting',
    },],
    [{
      text: i18n.t('random_localy') + random_locally,
      callback_data: 'changa_rangom_localy',
    }],
    [{
      text: safe_mode_text,
      callback_data: 'toggle_safe_mode',
    }],
    [{
      text: i18n.t('about_settings'),
      url:  'https://telegra.ph/Settings-04-09',
    }],
    [{
      text: language,
      callback_data: 'change_language',
    }],
  ]
  if ('callback_query' in ctx.update) {
    try {
      await ctx.editMessageText(i18n.t('settings'), {
        parse_mode:               'HTML',
        disable_web_page_preview: true,
        reply_markup:             {
          inline_keyboard: inlineKeyboard
        },
      })
    } catch (error) {
      throw new Verror(error, 'Editing settings')
    }
  } else {
    try {
      await ctx.reply(i18n.t('settings'), {
        parse_mode:   'HTML',
        reply_markup: {
          inline_keyboard: inlineKeyboard
        },
      })
    } catch (error) {
      throw new Verror(error, 'Replying settings')
    }
  }
}
