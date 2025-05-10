import { ensureElement } from "../../utils/utils"; // Импорт утилиты ensureElement для безопасного поиска элементов DOM
import { Component } from "../base/Component"; // Импорт базового класса Component

interface ISuccess { // Интерфейс данных для компонента Success
  total: number; // Общее количество синапсов, которое будет отображаться
}

interface ISuccessActions { // Интерфейс действий для компонента Success
  onClick: () => void; // Функция, вызываемая при нажатии на кнопку закрытия
}

export class Success extends Component<ISuccess> { // Класс Success, наследующий Component с типом ISuccess
  protected _total: HTMLElement; // Элемент для отображения общего количества списанных синапсов
  protected _close: HTMLElement; // Кнопка для закрытия сообщения об успешном заказе

  constructor(container: HTMLElement, actions: ISuccessActions) { // Конструктор принимает контейнер и действия
      super(container); // Вызов конструктора родителя

      this._close = ensureElement<HTMLElement>('.order-success__close', this.container); // Поиск кнопки закрытия
      this._total = ensureElement<HTMLElement>('.order-success__description', this.container); // Поиск элемента для отображения суммы

      if (actions?.onClick) { // Проверка наличия функции onClick
          this._close.addEventListener('click', actions.onClick); // Добавление обработчика клика для вызова onClick
      }
  }

  set total(value: string) { // Сеттер для установки отображаемого текста суммы
    this._total.textContent = `Списано ${value} синапсов`; // Установка текста с отображением списанной суммы
  }
}