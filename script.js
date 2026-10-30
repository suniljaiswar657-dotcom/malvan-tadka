const cart = new Map();
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));
document.getElementById('year').textContent = new Date().getFullYear();

const menuTabs = [...document.querySelectorAll('.menu-tabs .tab')];
const menuCards = [...document.querySelectorAll('#dishGrid .menu-item')];
const menuSearch = document.getElementById('menuSearch');
const menuEmpty = document.getElementById('menuEmpty');
let activeMenuFilter = 'all';

function applyMenuFilter(filter, selectedTab) {
  activeMenuFilter = filter;
  menuTabs.forEach(tab => {
    const selected = tab === selectedTab;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });

  menuCards.forEach(card => {
    const categories = (card.dataset.category || '').trim().split(/\s+/).filter(Boolean);
    const query = (menuSearch?.value || '').trim().toLocaleLowerCase();
    const searchable = (card.querySelector('h3')?.textContent + ' ' + card.querySelector('.dish-info p')?.textContent).toLocaleLowerCase();
    const categoryMatch = filter === 'all' || categories.includes(filter);
    const visible = categoryMatch && (!query || searchable.includes(query));
    card.classList.toggle('is-filtered-out', !visible);

    if (visible) {
      card.classList.remove('menu-reveal');
      void card.offsetWidth;
      card.classList.add('menu-reveal');
    } else {
      card.classList.remove('menu-reveal');
    }
  });
  if (menuEmpty) menuEmpty.hidden = menuCards.some(card => !card.classList.contains('is-filtered-out'));
}

menuSearch?.addEventListener('input', () => {
  applyMenuFilter(activeMenuFilter, menuTabs.find(tab => tab.classList.contains('active')) || menuTabs[0]);
});

menuTabs.forEach(tab => {
  tab.type = 'button';
  tab.addEventListener('click', () => applyMenuFilter(tab.dataset.filter || 'all', tab));
});

// Keep the initial state and accessibility attributes in sync.
if (menuTabs.length) applyMenuFilter('all', menuTabs.find(tab => tab.dataset.filter === 'all') || menuTabs[0]);

const reservationForm = document.getElementById('reservationForm');
const reservationDate = document.getElementById('reservationDate');
if (reservationDate) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  reservationDate.min = localToday;
}
reservationForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!reservationForm.reportValidity()) return;
  const formData = new FormData(reservationForm);
  const message = [
    'Hello Malvan Tadka! I would like to request a table reservation.',
    'Name: ' + formData.get('name'),
    'Mobile: ' + formData.get('phone'),
    'Preferred date: ' + formData.get('date'),
    'Preferred time: ' + formData.get('time'),
    'Guests: ' + formData.get('guests'),
    'Please confirm availability. Thank you!'
  ].join('\n');
  window.open('https://wa.me/919833248666?text=' + encodeURIComponent(message), '_blank', 'noopener');
});

const dialog = document.getElementById('cartDialog');
const count = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
function renderCart() {
  const total = [...cart.values()].reduce((sum, qty) => sum + qty, 0);
  count.textContent = total;
  cartItems.innerHTML = '';
  if (!cart.size) {
    const empty = document.createElement('p');
    empty.className = 'empty-cart';
    empty.textContent = 'Your list is empty. Add a dish to start an enquiry.';
    cartItems.append(empty);
    return;
  }
  cart.forEach((qty, name) => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    const label = document.createElement('span');
    label.textContent = name + ' × ' + qty;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '−';
    remove.setAttribute('aria-label', 'Remove one ' + name);
    remove.addEventListener('click', () => {
      if (qty <= 1) cart.delete(name); else cart.set(name, qty - 1);
      renderCart();
    });
    row.append(label, remove);
    cartItems.append(row);
  });
}
document.querySelectorAll('.add-button').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.item;
    cart.set(name, (cart.get(name) || 0) + 1);
    renderCart();
    button.textContent = '✓';
    window.setTimeout(() => { button.textContent = '+'; }, 850);
  });
});
document.getElementById('cartFab').addEventListener('click', () => dialog.showModal());
document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
document.getElementById('sendWhatsApp').addEventListener('click', () => {
  if (!cart.size) {
    alert('Please add at least one menu item first.');
    return;
  }
  const lines = [...cart.entries()].map(([name, qty]) => name + ' × ' + qty);
  const message = 'Hello Malvan Tadka! I would like to enquire about these menu selections:\n' +
    lines.join('\n') +
    '\nPlease confirm availability and current prices. Thank you!';
  window.open('https://wa.me/919833248666?text=' + encodeURIComponent(message), '_blank', 'noopener');
});
renderCart();
