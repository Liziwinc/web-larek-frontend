export type PaymentMethod = 'online' | 'cash';
export type ComponentContainer = HTMLElement | HTMLFormElement;
export type ApiPostMethods = 'POST' | 'PUT' | 'PATCH';
export type EventName = string;

//API-данные
export interface IProduct {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number | null;
}

export interface IBasketItem {
  product: IProduct;
}

export interface IOrderRequest {
  payment: PaymentMethod;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface IOrder extends IOrderRequest {
  items: string[];
}

export interface IOrderResult {
  id: string;
}

//Данные моделей
export interface IProductsModel {
  products: IProduct[];
  selectedProduct: IProduct | null;
  init(items: IProduct[]): void;
  getAll(): IProduct[];
  select(id: string): void;
  clearSelection(): void;
}

export interface IBasketModel {
  items: IBasketItem[];
  init(items: IBasketItem[]): void;
  add(product: IProduct): void;
  remove(productId: string): void;
  clear(): void;
  getItems(): IBasketItem[];
  getTotal(): number;
}

export interface ICheckoutFormModel {
  payment: PaymentMethod | null;
  email: string;
  phone: string;
  address: string;
  setPayment(method: PaymentMethod): boolean;
  setEmail(email: string): boolean;
  setPhone(phone: string): boolean;
  setAddress(address: string): boolean;
  reset(): void;
}

//Интерфейс клиента API
export interface IApiClient {
  get<T = any>(uri: string): Promise<T>;
  post<T = any>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

//Интерфейсы базовых компонентов
export interface IComponent<T> {
  render(data?: Partial<T>): HTMLElement;
}

export interface IModel<T> {
  emitChanges(event: string, payload?: object): void;
}

//Интерфейс модального окна
export interface IModal {
  render(): HTMLElement;
}

export interface IAppState {
  catalog: IProduct[];
  preview: string;
  basket: string[];
  order: IOrder;
  total: string | number;
  loading: boolean;
}


