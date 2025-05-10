import { Component } from './base/Component';
import { IProduct } from '../types/index';
import { IEvents } from './base/events'
import {bem, createElement, ensureElement, formatNumber} from "../utils/utils";

interface ICardActions { // Интерфейс для действий карточки
  onClick: (event: MouseEvent) => void; // Обработчик клика
}

interface ICard { // Интерфейс для структуры данных карточки
  title: string; // Название товара
  category: string; // Категория товара
  image: string; // Изображение товара
  price: number; // Цена товара
  text: string; // Описание товара
}

export class Card<T> extends Component<ICard> { // Класс для карточки товара, наследуется от компонента
  protected _title: HTMLElement; // Элемент для заголовка карточки
  protected _category: HTMLElement; // Элемент для категории товара
  protected _image: HTMLImageElement; // Элемент для изображения товара
  protected _price: HTMLElement; // Элемент для цены товара
  protected _categoryColor = <Record<string, string>> { // Сопоставление категорий с цветами
    "софт-скил": "soft",
    "другое": "other",
    "дополнительное": "additional",
    "кнопка": "button",
    "хард-скил": "hard"
  }

  constructor(container: HTMLElement, actions?: ICardActions) { // Конструктор карточки, принимает контейнер и действия
    super(container); // Вызов конструктора родительского компонента
    this._title = ensureElement<HTMLElement>(`.card__title`, container); // Инициализация элемента заголовка
    this._category = ensureElement<HTMLElement>(`.card__category`, container); // Инициализация элемента категории
    this._image = ensureElement<HTMLImageElement>(`.card__image`, container); // Инициализация элемента изображения
    this._price = ensureElement<HTMLElement>(`.card__price`, container); // Инициализация элемента цены

    if (actions?.onClick) { // Если передано действие onClick, добавляем слушатель
        container.addEventListener('click', actions.onClick);
    }
  }

  set title(value: string) { // Сеттер для заголовка
    this.setText(this._title, value);
  }

  set category(value: string) { // Сеттер для категории
    this.setText(this._category, value);
    this._category.className = `card__category card__category_${this._categoryColor[value]}`; // Применение стиля в зависимости от категории
  }

  set image(value: string) { // Сеттер для изображения
    this.setImage(this._image, value, this.title); // Установка изображения с альтернативным текстом
  }

  set price(value: string) { // Сеттер для цены
    if(value === null) {
      this.setText(this._price, `Бесценно`); // Если цена отсутствует, отображаем "Бесценно"
    } else {
      this.setText(this._price, `${value} синапсов`); // Иначе отображаем цену с валютой
    }
  }
}

interface ICardPreview { // Интерфейс для карточки предпросмотра
  text: string; // Описание предпросмотра
}

export class CardPreview extends Card<ICardPreview> { // Класс для карточки предпросмотра, наследуется от Card
  protected _text: HTMLElement; // Элемент для текста предпросмотра
  protected _button: HTMLElement; // Элемент для кнопки карточки
  
  constructor(container: HTMLElement, actions?: ICardActions) { // Конструктор
    super(container, actions); // Вызов конструктора родительского класса
    this._button = container.querySelector(`.card__button`); // Инициализация кнопки
    this._text = ensureElement<HTMLElement>(`.card__text`, container); // Инициализация текста

    if (actions?.onClick) { // Если передано действие onClick, заменяем обработчик клика
      if (this._button) {
          container.removeEventListener('click', actions.onClick);
          this._button.addEventListener('click', actions.onClick);
      } 
    }
  }

  set text(value: string) { // Сеттер для текста предпросмотра
    this.setText(this._text, value);
  }

  set disabled(value: boolean) {
    if (this._button) {
      this.setDisabled(this._button, value);
    }
  }
  
}

interface ICardBasket { // Интерфейс для карточки корзины
  title: string; // Название товара
  price: number; // Цена товара
  index: number; // Индекс товара в корзине
}

export class CardBasket extends Component<ICardBasket> { // Класс для карточки товара в корзине, наследуется от Component
  protected _title: HTMLElement; // Элемент для заголовка
  protected _price: HTMLElement; // Элемент для цены
  protected _button: HTMLElement; // Элемент для кнопки
  protected _index: HTMLElement; // Элемент для индекса товара
  
  constructor(container: HTMLElement, actions?: ICardActions) { // Конструктор
    super(container); // Вызов конструктора родительского компонента
    this._title = ensureElement<HTMLElement>(`.card__title`, container); // Инициализация заголовка
    this._price = ensureElement<HTMLElement>(`.card__price`, container); // Инициализация цены
    this._index = ensureElement<HTMLElement>(`.basket__item-index`, container); // Инициализация индекса
    this._button = container.querySelector(`.card__button`); // Инициализация кнопки

    if (actions?.onClick) { // Если передано действие onClick, заменяем обработчик клика
      if (this._button) {
          container.removeEventListener('click', actions.onClick);
          this._button.addEventListener('click', actions.onClick);
      } 
    }
  }

  set index(value: number) { // Сеттер для индекса товара
    this.setText(this._index, value);
  }

  set title(value: string) { // Сеттер для названия товара
    this.setText(this._title, value);
  }

  set price(value: string) { // Сеттер для цены товара
    if(value === null) {
      this.setText(this._price, `Бесценно`); // Если цена отсутствует, отображаем "Бесценно"
    } else {
      this.setText(this._price, `${value} синапсов`); // Иначе отображаем цену с валютой
    }
  }
}