export type PaymentMethod = 'online' | 'cash';

interface IProduct {
  id: string;
  /** Название товара */
  title: string;
  /** Описание товара */
  description: string;
  /** Ссылка на изображение */
  image: string;
  /** Категория товара */
  category: string;
  /** Цена товара или null, если "бесценный" */
  price: number | null;
}

export interface IBasketItem {
  /** Продукт */
  product: IProduct;
}

export interface IOrderRequest {
  /** Способ оплаты */
  payment: PaymentMethod;
  /** Почта покупателя */
  email: string;
  /** Телефон покупателя */
  phone: string;
  /** Адрес доставки */
  address: string;
  /** Общая сумма заказа (бесценные товары не учитываются) */
  total: number;
  /** Массив id товаров */
  items: string[];
}


/** Модель управления товарами */
export interface IProductsModel {
  init(items: IProduct[]): void;
  getAll(): IProduct[];
  select(id: string): void;
  clearSelection(): void;
}

/** Модель управления корзиной */
export interface IBasketModel {
  init(items: IBasketItem[]): void;
  add(product: IProduct): void;
  remove(productId: string): void;
  clear(): void;
  getItems(): IBasketItem[];
  getTotal(): number;
}

/** Модель управления данными оформления заказа */
export interface ICheckoutFormModel {
  setPayment(method: PaymentMethod): boolean;
  setEmail(email: string): boolean;
  setPhone(phone: string): boolean;
  setAddress(address: string): boolean;
  reset(): void;
}


/** Базовый интерфейс UI-компонента */
export interface IBaseComponent {
  render(container: HTMLElement): void;
  show(): void;
  hide(): void;
  bindEvents(): void;
}

/** Интерфейс карточки товара */
export interface ICardComponent extends IBaseComponent {
  update(product: IProduct): void;
}

/** Интерфейс модального окна */
export interface IModalComponent extends IBaseComponent {
  open(...args: any): void;
  close(): void;
  setContent(element: HTMLElement): void;
}

/** Интерфейс детального просмотра товара */
export interface IProductModalComponent extends IModalComponent {
  open(product: IProduct): void;
  bindAdd(): void;
}

/** Интерфейс просмотра корзины */
export interface IBasketModalComponent extends IModalComponent {
  open(items: IBasketItem[], total: number): void;
  bindRemove(): void;
  updateTotal(total: number): void;
}

/** Интерфейс компонента шагов оформления заказа */
export interface ICheckoutStepComponent extends IModalComponent {
  open(): void;
  bindFormEvents(): void;
  validate(): void;
}

/** Интерфейс компонента успеха заказа */
export interface ISuccessModalComponent extends IModalComponent {
  open(total: number): void;
  bindClose(): void;
}

// Перечисление типов событий
export enum EventType {
  ProductsChanged = 'products:changed',
  ProductSelected = 'product:selected',
  BasketChanged = 'basket:changed',
  CheckoutStep1Validated = 'checkout:step1:validated',
  CheckoutStep2Validated = 'checkout:step2:validated',
  OrderCreated = 'order:created',
  CardClick = 'card:click',
  CardAdd = 'card:add',
  CardRemove = 'card:remove',
  HeaderBasketClick = 'header:basket:click',
  CheckoutStep1Next = 'checkout:step1:next',
  CheckoutStep2Submit = 'checkout:step2:submit',
  ModalClose = 'modal:close',
}

/** Интерфейс события в шине EventEmitter */
export interface IEvent<T = any> {
  type: EventType;
  payload: T;
}
