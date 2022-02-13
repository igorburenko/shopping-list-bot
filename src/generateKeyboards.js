import {Markup} from 'telegraf';

export const generateProductButtons = (string) => {
  const MAX_BUTTONS_IN_ROW = 3
  const MAX_CHARS_IN_ROW = 30

  return string.reduce((acc, product) => {
    const button = Markup.button.callback(product, product)
    const lastRowIndex = acc.length - 1
    const lastRow = acc[lastRowIndex]

    const lastRowCharactersLength = lastRow.join(' ').length
    const expectedRowCharactersLength = lastRowCharactersLength + product.length

    if (expectedRowCharactersLength > MAX_CHARS_IN_ROW) {
      return [...acc, [button]]
    }

    if (lastRow.length < MAX_BUTTONS_IN_ROW) {
      lastRow.push(button)
      return [...acc]
    }

    return [...acc, [button]]
  }, [[]])
}

const generateProductKeyboard = (string) => Markup.inlineKeyboard(generateProductButtons(string))

export {generateProductKeyboard}
