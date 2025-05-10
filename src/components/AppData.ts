import {  IAppState, IOrder, IOrderRequest, IProduct } from "../types"; // Импорт типов для управления состоянием приложения
import { Model } from "./base/Model"; // Импорт базовой модели

export type CatalogChangeEvent = {
  catalog: Product[]
};

export class AppState extends Model<IAppState> { // Класс AppData для управления данными приложения
  catalog: Product[]; // Список продуктов в каталоге
  preview: string; // ID товара для предпросмотра
  basket: Product[] = []; // Корзина товаров
  order: IOrder = { // Объект заказа с полями по умолчанию
    address: '',
    payment: 'online',
    email: '',
    total: 0,
    phone: '',
    items: []
  };
  // formErrors: FormErrors = {}; // Ошибки формы

  setCatalog(items: IProduct[]) { // Метод для установки каталога товаров
    this.catalog = items.map(item => new Product(item, this.events)); // Создание объектов Product
    this.emitChanges('cards:changed', { catalog: this.catalog }); // Отправка события изменения каталога
  }
  addToOrder(item: Product) { // Метод для добавления товара в заказ
    this.order.items.push(item.id);
  }

  removeFromOrder(item: Product) { // Метод для удаления товара из заказа
    const index = this.order.items.indexOf(item.id);
    if (index >= 0) {
      this.order.items.splice(index, 1); // Удаление элемента по индексу
    }
  }

  setPreview(item: Product) { // Метод для установки товара на предпросмотр
    this.preview = item.id;
    this.emitChanges('preview:changed', item); // Отправка события изменения предпросмотра
  }

  setProductToBasket(item: Product) { // Метод добавления товара в корзину
    // Проверяем, если товар уже в корзине, не добавляем его
    if (!this.basket.some(existingItem => existingItem.id === item.id)) {
      this.basket.push(item); // Добавляем товар в корзину
    }
  }
  
  removeProductToBasket(item: Product) { // Метод удаления товара из корзины
    const index = this.basket.indexOf(item);
    if (index >= 0) {
      this.basket.splice(index, 1); // Удаление товара из корзины по индексу
    }
  }

  get statusBasket(): boolean { // Геттер для проверки пустоты корзины
    return this.basket.length === 0;
  }

  get bskt(): Product[] { // Геттер для получения товаров из корзины
    return this.basket;
  }

  set total(value: number) { // Сеттер для установки итоговой суммы заказа
    this.order.total = value;
  }

  getTotal() { // Метод для подсчета итоговой суммы заказа
    return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0);
  }

}

export class Product extends Model<IProduct> { // Класс Product для описания товара
  id: string; // ID товара
  title: string; // Название товара
  description: string; // Описание товара
  category: string; // Категория товара
  image: string; // URL изображения товара
  price: number | null; // Цена товара
}