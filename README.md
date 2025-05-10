# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура

Проект реализован на основе паттерна MVP (Model-View-Presenter)
Model  - хранит данные и управляет бизнес-логикой приложения
View  - отвечает за отображение данных на интерфейсе пользователя
Presenter - осуществляет взаимодействие между Model и View

## Описание данных
Тип оплаты: онлайн или при получении
```ts
type PaymentMethod = 'online' | 'cash';
```

Интерфейс товара
```ts
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
  /** Цена товара или null, если «бесценный» */
  price: number | null;
}
```
Используется во всех компонентах, где нужно отобразить данные о товаре
— для карточек каталога и детальной карточки в попапе.

Интерфейс элемента корзины 
```ts
interface IBasketItem {
  /** Продукт */
  product: IProduct;
}
```
Используется для хранения локальной корзины пользователя


Интерфейс запроса создания заказа
```ts
interface IOrderRequest {
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
  /** Массив 'id' товаров */
  items: string[];
}
```
Используется при отправке POST /order на сервер.
## Базовый код 
1. **Класс EventEmitter**
Реализует паттерн «Наблюдатель» и позволяет подписываться на события и уведомлять подписчиков
о наступлении события.

```ts
export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

class EventEmitter implements IEvents {
    /** Установить обработчик на событие*/
    on<T extends object>(eventName: EventName, callback: (event: T) => void) {}

    /** Снять обработчик с события*/
    off(eventName: EventName, callback: Subscriber) {}

    /**Инициировать событие с данными*/
    emit<T extends object>(eventName: string, data?: T) {}

    /**Слушать все события*/
    onAll(callback: (event: EmitterEvent) => void) {}

    /** Сбросить все обработчики*/
    offAll() {}
    /** Сделать коллбек триггер, генерирующий событие при вызове*/
    trigger<T extends object>(eventName: string, context?: Partial<T>) {}
}
```
2. **Класс Api**
Класс, который реализует логику взаимодействия с API сервера.

```ts
 class Api {
    readonly baseUrl: string;
    protected options: RequestInit;
    constructor(baseUrl: string, options: RequestInit = {}) {}
    get(uri: string) {}
    post(uri: string, data: object, method: ApiPostMethods = 'POST') {}
    protected handleResponse(response: Response): Promise<object> {}
}
```

3. **Класс Component**
Абстрактный класс, который реализует логику взаимодействия с компонентами отображения.
```ts
abstract class Component<T> { 
    protected constructor(protected readonly container: HTMLElement) {}
    // Инструментарий для работы с DOM в дочерних компонентах

    // Переключить класс
    toggleClass(element: HTMLElement, className: string, force?: boolean) {}

    // Установить текстовое содержимое
    protected setText(element: HTMLElement, value: unknown) {}

    // Сменить статус блокировки
    setDisabled(element: HTMLElement, state: boolean) {}

    // Скрыть
    protected setHidden(element: HTMLElement) {}

    // Показать
    protected setVisible(element: HTMLElement) {}

    // Установить изображение с алтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string) {}

    // Вернуть корневой DOM-элемент
    render(data?: Partial<T>): HTMLElement {}
}
```
4. **Класс Model**
Абстрактный класс, который реализует основу чтобы можно было отличить ее от простых объектов с данными.
```ts
abstract class Model<T> {
    constructor(data: Partial<T>, protected events: IEvents) {}

    // Сообщить всем что модель поменялась
    emitChanges(event: string, payload?: object) {}
}
```

## Модели данных
1. **WebLarekApi**
Клиент для общения с сервером.
```ts
getProductList(): Promise<IProduct[]>
orderProducts(order: IOrder): Promise<IOrderResult>
```
2. **AppState**
Класс модели приложения. Отвечает за хранение каталога, текущего выбранного товара, корзины и информации о заказе.
Свойства:
```ts
catalog: Product[];       // список товаров
preview: string;          // ID текущего предпросмотра
basket: Product[];        // корзина товаров
order: IOrder;            // объект заказа
total: number;            // сумма заказа
```
Методы:
```ts
setCatalog(items: IProduct[]): void;
addToOrder(item: Product): void;
removeFromOrder(item: Product): void;
setPreview(item: Product): void;
setProductToBasket(item: Product): void;
removeProductToBasket(item: Product): void;
get statusBasket(): boolean;
get bskt(): Product[];
getTotal(): number;
```
## Компоненты представления 
1. **Page**
Компонент главной страницы: отображает счётчик товаров, каталог карточек и кнопку открытия корзины.

Конструктор:
```ts
container: HTMLElement //корневой контейнер страницы
events: IEvents //объект для работы с событиями
```
Атрибуты:
```ts
counter: HTMLElement //элемент для отображения количества товаров в корзине
catalog: HTMLElement //контейнер для списка карточек
basketButton: HTMLButtonElement //кнопка открытия корзины
wrapper: HTMLElement //обёртка всей страницы
```
Сеттеры:
```ts
set catalog(items: HTMLElement[]): void
set counter(value: number): void
set locked(value: boolean): void
```

2. **Modal**
Управляет модальным окном: открытие, закрытие, вставка контента.

Конструктор:
```ts
container: HTMLElement //контейнер модального окна
events: IEvents //объект для событий
```
Атрибуты:
```ts
closeButton: HTMLButtonElement //кнопка закрытия окна
content: HTMLElement // контейнер для вставки содержимого
```
Сеттеры:
```ts
set body(data: IModal) //устанавливает и рендерит переданный элемент
```
Методы:
```ts
open() //показывает модальное окно
close() //скрывает окно, очищает контент
render(data: IModal): HTMLElement //возвращает переданный элемент для вставки
```

3. **Basket**
Отображает содержимое корзины внутри модального окна: список товаров, сумму и кнопку оформления.

Конструктор:
```ts
container: HTMLElement //контейнер корзины
events: IEvents
```
Атрибуты:
```ts
list: HTMLElement // список товаров в корзине
total: HTMLElement //элемент показа общей суммы
button: HTMLButtonElement //кнопка начала оформления заказа
```
Сеттеры:
```ts
set items(items: HTMLElement[]): void
set total(value: number): void
setDisabled(button: HTMLElement, state: boolean): void
```

4. **Form<T>**
Базовый класс для форм: валидация, отображение ошибок, управление кнопкой отправки.

Конструктор:
```ts
container: HTMLFormElement //корневой элемент формы
events: IEvents
```
Атрибуты:
```ts
error: HTMLElement //элемент для вывода текстовых ошибо
valid: boolean //флаг валидности формы
submitBtn: HTMLButtonElement //кнопка отправки/далее
```
Методы:
```ts
reset() //сброс полей, ошибок и состояния кнопки
render(data?: Partial<T>): HTMLFormElement //возвращает форму
```
Сеттер:
```ts
protected set validState(state: boolean) //переключает состояние кнопки отправки
```

5. **Order**
Форма выбора способа оплаты и ввода адреса доставки.
Наследуется от `Form<{ payment: string; address: string }>`.

Конструктор:
```ts
container: HTMLFormElement //шаблон формы
events: IEvents
```
Атрибуты:
```ts
cashBtn: HTMLButtonElement //кнопка "При получении"
cardBtn: HTMLButtonElement //кнопка "Онлайн"
addressInput: HTMLInputElement //поле ввода адреса
```
Сеттеры:
```ts
set payment(method: 'cash' | 'online') //визуально отмечает выбранный метод
set address(value: string) //заполняет поле адреса
set disabled(state: boolean) //блокирует/разблокирует кнопку "далее"
```
Методы:
```ts
selectPayment(method) //обновляет UI
```

6. **Contacts**
Форма ввода контактных данных (email и телефон).
Наследуется от `Form<{ email: string; phone: string }>`.

Конструктор:
```ts
container: HTMLFormElement //шаблон формы
events: IEvents 
```
Атрибуты:
```ts
emailInput: HTMLInputElement //поле ввода email
phoneInput: HTMLInputElement //поле ввода телефона
```
Сеттеры:
```ts
set email(value: string) //заполняет поле email
set phone(value: string) //заполняет поле телефона
set disabled(state: boolean) //блокирует/разблокирует кнопку "Оплатить"
```

7. **Success**
Окно с сообщением об успешном оформлении заказа.

Конструктор:
```ts
container: HTMLElement //шаблон содержимого
events: IEvents
```
Атрибуты:
```ts
closeBtn: HTMLElement //кнопка закрытия
total: HTMLElement //элемент для отображения суммы заказа
```
Сеттер:
```ts
set orderTotal(value: number) //устанавливает сумму в тексте
```
Метод:
```ts
render(): HTMLElement //возвращает готовый элемент
```

8. **Card**
Карточка товара для каталога или списка в корзине.

Конструктор:
```ts
container: HTMLElement //шаблон карточки
events: IEvents
action?: ICardAction //опциональные колбэки для кнопок удаления
```
Атрибуты:
```ts
image: HTMLImageElement
category: HTMLElement
title: HTMLElement
description: HTMLElement
price: HTMLElement
deleteBtn?: HTMLButtonElement
```
Сеттеры:
```ts
set title(value: string)
set category(value: string)
set image(value: string)
set price(value: number | null)
```
Метод:
```ts
render(data: IProduct): HTMLElement //заполняет данные и возвращает контейнер
```
9. **CardPreview**
Компонент предварительного просмотра карточки, используется в модальном всплывающем окне подробностей товара.

Конструктор:
```ts
container: HTMLElement //корневой контейнер превью
events: IEvents
```
Атрибуты:
```ts
image: HTMLImageElement //крупное изображение товара
title: HTMLElement //заголовок товара
description: HTMLElement //полное описание товара
price: HTMLElement //отображение цены или текста "Бесценно"
closeBtn: HTMLButtonElement //кнопка закрытия превью
buyBtn: HTMLButtonElement //кнопка добавления в корзину
```
Сеттеры:
```ts
set data(product: IProduct) //заполняет все поля данными товара.
set disabled(state: boolean) //блокирует/разблокирует кнопку покупки.
```
Методы:
```ts
render(data: IProduct): HTMLElement //возвращает заполненный элемент превью
open(): void //отображает превью
close(): void //скрывает превью
```

## Основные события
- cards:changed   | Обновление каталога                     
- card:select     | Открытие предпросмотра                  
- preview:changed | Обновление предпросмотра                  
- card:add        | Добавление товара в корзину             
- card:remove     | Удаление товара из корзины              
- basket:open     | Открытие корзины                        
- basket:submit   | Переход к вводу адреса и способа оплаты 
- order:submit    | Переход к шагу контактов                
- contacts:submit | Отправка заказа на сервер               
- payment:change  | Выбор способа оплаты                    
- modal:open      | Блокировка прокрутки страницы           
- modal:close     | Разблокировка и сброс форм              

