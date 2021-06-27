export default (message) => {
  //todo: сократить название продукта до 15 символов
  return message.split(',').map(product => product.trim()).filter(product => product)
}
