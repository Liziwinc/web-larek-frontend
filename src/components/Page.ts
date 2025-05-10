// import { Card } from './Card';
// import { IProduct } from '../../types/index';
import { IEvents } from './base/events'
import {Component} from "./base/Component";
import {ensureElement} from "../utils/utils";

interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export class Page extends Component<IPage> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLElement;


    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._counter = ensureElement<HTMLElement>('.header__basket-counter');
        this._catalog = ensureElement<HTMLElement>('.gallery');
        this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
        this._basket = ensureElement<HTMLElement>('.header__basket');

        this._basket.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this.setText(this._counter, String(value));
    }

    public set catalog(items: HTMLElement[]) {
        this._catalog.replaceChildren(...items);
    }

    set locked(value: boolean) {
        if (value) {
            this._wrapper.classList.add('page__wrapper_locked');
        } else {
            this._wrapper.classList.remove('page__wrapper_locked');
        }
    }
}


// export class Page {
//   constructor(
//     public container: HTMLElement,
//     private catalog: HTMLElement,
//     private cardTemplate: HTMLTemplateElement,
//     private events: IEvents
//   ) {}

//   set items(products: IProduct[]) {
//     this.catalog.innerHTML = '';
//     products.forEach(product => {
//       const cardElement = this.cardTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
//       const card = new Card(cardElement, this.events);
//       this.catalog.append(card.render(product));
//     });
//   }
// }