import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { IFormState } from '../../types/index';

export class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	protected onInputChange(field: keyof T, value: string) {
		this.clearErrorMessage();
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	private setErrorMessage(message: string) {
		this._errors.innerHTML = message;
		this._errors.classList.add('form__errors--active');
	}

	private clearErrorMessage() {
		this._errors.innerHTML = '';
		this._errors.classList.remove('form__errors--active');
	}

	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	set errors(value: string) {
		this.setErrorMessage(value);
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}

	reset() {
		this.container.reset();
		this.clearErrorMessage();
		this._submit.disabled = true;
	}
}
