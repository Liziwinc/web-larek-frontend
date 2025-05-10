import { IOrderRequest } from '../types';
import { ensureAllElements } from '../utils/utils';
import { IEvents } from './base/events';
import { Form } from './common/Form';

export class Order extends Form<IOrderRequest> {
	protected _buttons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._buttons = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			container
		);

		this._buttons.forEach((button) => {
			button.addEventListener('click', () => {
				this.payment = button.name;
				events.emit('payment:change', button);
			});
		});
	}

	set payment(name: string) {
		this._buttons.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', button.name === name);
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	reset() {
		this._buttons.forEach((button) =>
			this.toggleClass(button, 'button_alt-active', false)
		);
		const addressInput = this.container.elements.namedItem(
			'address'
		) as HTMLInputElement;
		if (addressInput) {
			addressInput.value = '';
		}
		this.valid = false;
		this._errors.textContent = '';
	}
}

export class Сontacts extends Form<IOrderRequest> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	reset() {
		const emailInput = this.container.elements.namedItem(
			'email'
		) as HTMLInputElement;
		const phoneInput = this.container.elements.namedItem(
			'phone'
		) as HTMLInputElement;

		if (emailInput) emailInput.value = '';
		if (phoneInput) phoneInput.value = '';

		this.valid = false;
		this._errors.textContent = '';
	}
}
