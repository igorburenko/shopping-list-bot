import {Markup} from 'telegraf';

export const generateProductButtons = (string) => {
  const MAX_BUTTONS_IN_ROW = 3

  return string.reduce((acc, product) => {
    const button = Markup.button.callback(product, product)
    const lastRow = acc.length - 1


    if (acc[lastRow].length < MAX_BUTTONS_IN_ROW) {
      acc[lastRow].push(button)
      return [...acc]
    }

    return [...acc, [button]]
  }, [[]])
}

export const generateProductKeyboard = (string) => Markup.inlineKeyboard(generateProductButtons(string))
