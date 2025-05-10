import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { WebLarekApi } from './components/WebLarekApi';
import { EventEmitter } from './components/base/events';
import { Page } from './components/Page';
import { Card, CardBasket, CardPreview } from './components/Card';
import { Product, AppState } from './components/AppData';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { Order, Сontacts } from './components/Order';
import { Success } from './components/common/Success';
import { FormValidator } from './components/common/Form';


// --- API и события ---
const api = new WebLarekApi(CDN_URL, API_URL);
const events = new EventEmitter();

// --- Шаблоны ---
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// --- Состояние и DOM ---
const appData = new AppState({}, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const page = new Page(document.body, events);

// --- Компоненты интерфейса ---
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Сontacts(cloneTemplate(contactsTemplate), events);

// --- Рендер карточек ---
events.on('cards:changed', () => {
  page.catalog = appData.catalog.map((item) => {
    const card = new Card(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      title: item.title,
      category: item.category,
      image: api.cdn + item.image,
      price: item.price
    });
  });
});

// --- Открытие превью ---
events.on('card:select', (item: Product) => {
  appData.setPreview(item);
});

events.on('preview:changed', (item: Product) => {
  const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
    onClick: () => events.emit('card:add', item)
  });

  
  const isInBasket = appData.basket.some(p => p.id === item.id);
  card.disabled = isInBasket;

  modal.render({
    content: card.render({
      title: item.title,
      image: api.cdn + item.image,
      text: item.description,
      price: item.price,
      category: item.category
    })
  });
});

// --- Добавление в корзину ---
events.on('card:add', (item: Product) => {
  appData.addToOrder(item);
  appData.setProductToBasket(item);
  page.counter = appData.basket.length;
  modal.close();
});

// --- Открытие корзины ---
events.on('basket:open', () => {
  const hasOnlyOnePriceless = appData.basket.length === 1 && appData.basket[0].price === null;
  basket.setDisabled(basket.button, appData.basket.length === 0 || hasOnlyOnePriceless);
  basket.total = appData.getTotal();

  let i = 1;
  basket.items = appData.bskt.map((item) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('card:remove', item)
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: i++
    });
  });

  modal.render({
    content: basket.render()
  });
});

// --- Удаление из корзины ---
events.on('card:remove', (item: Product) => {
  appData.removeProductToBasket(item);
  appData.removeFromOrder(item);
  page.counter = appData.bskt.length;
  basket.setDisabled(basket.button, appData.statusBasket);
  basket.total = appData.getTotal();

  let i = 1;
  basket.items = appData.bskt.map((item) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('card:remove', item)
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: i++
    });
  });

  modal.render({
    content: basket.render()
  });
});

// --- Оформление заказа ---
events.on('basket:submit', () => {
  modal.render({
    content: order.render({
      valid: false,
      errors: []
    })
  });
});

events.on<{ field: string; value: string }>('order.address:change', ({ value }) => {
  appData.order.address = value;
  order.valid = !!value.trim();
});

events.on('payment:change', (button: HTMLButtonElement) => {
  appData.order.payment = button.name as 'cash' | 'online';
});

events.on('order:submit', () => {
  modal.render({
    content: contacts.render({
      valid: false,
      errors: []
    })
  });
});

events.on<{ field: string; value: string }>('contacts.email:change', ({ value }) => {
  appData.order.email = value;
  contacts.valid = FormValidator.validateContacts(appData.order.email, appData.order.phone);
});

events.on<{ field: string; value: string }>('contacts.phone:change', ({ value }) => {
  appData.order.phone = value;
  contacts.valid = FormValidator.validateContacts(appData.order.email, appData.order.phone);
});

// --- Отправка заказа ---
events.on('contacts:submit', () => {
  appData.total = appData.getTotal();
  appData.order.items = appData.getValidOrderItems();


  api.post('/order', appData.order)
    .then(() => {
      appData.basket = []; 
      contacts.reset();         
      order.reset();
      page.counter = 0;

      const successComponent = new Success(cloneTemplate(successTemplate), {
        onClick: () => modal.close()
      });

      successComponent.total = String(appData.total);

      modal.render({
        content: successComponent.render()
      });
    })
    .catch((err) => {
      console.error('Ошибка при оформлении заказа:', err);
    });
});

// --- Прокрутка ---
events.on('modal:open', () => {
  page.locked = true;
});

events.on('modal:close', () => {
  page.locked = false;
  order.reset();
  contacts.reset();
});

// --- Загрузка с сервера ---
api.getProductList()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });
