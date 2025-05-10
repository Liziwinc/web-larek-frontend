import { IOrder, IOrderResult, IProduct } from "../types"; // Импорт типов данных
import { Api, ApiListResponse } from "./base/api"; // Импорт базового API класса и ответов

export interface IWebLarekAPI {
  getProductList: () => Promise<IProduct[]>;
  // getLotItem: (id: string) => Promise<ILot>;
  // getLotUpdate: (id: string) => Promise<LotUpdate>;
  // placeBid(id: string, bid: IBid): Promise<LotUpdate>;
  orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

export class WebLarekApi extends Api implements IWebLarekAPI { // Класс для работы с API Larek, наследует от базового Api
  cdn: string; // Свойство для хранения CDN (Content Delivery Network) URL

  constructor(cdn: string, baseUrl: string, options?: RequestInit) { // Конструктор для инициализации базового URL и CDN
    super(baseUrl, options); // Вызов конструктора родительского класса
    this.cdn = cdn; // Установка CDN
  }

  getProductList(): Promise<IProduct[]> {
    return this.get('/product').then((data: ApiListResponse<IProduct>) =>
        data.items.map((item) => ({
            ...item,
            image: item.image
        }))
    );
  } 

  orderProducts(order: IOrder): Promise<IOrderResult> {
    return this.post('/order', order) // Отправка POST-запроса на создание заказа
      .then((data: IOrderResult) => data); // Возвращаем результат заказа
  }
}