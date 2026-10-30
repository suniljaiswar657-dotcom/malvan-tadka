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

function applyMenuFilter(filter, selectedTab) {
  menuTabs.forEach(tab => {
    const selected = tab === selectedTab;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });

  menuCards.forEach(card => {
    const categories = (card.dataset.category || '').trim().split(/\\s+/).filter(Boolean);
    const visible = filter === 'all' || categories.includes(filter);
    card.classList.toggle('is-filtered-out', !visible);

    if (visible) {
      card.classList.remove('menu-reveal');
      void card.offsetWidth;
      card.classList.add('menu-reveal');
    } else {
      card.classList.remove('menu-reveal');
    }
  });
}

menuTabs.forEach(tab => {
  tab.type = 'button';
  tab.addEventListener('click', () => applyMenuFilter(tab.dataset.filter || 'all', tab));
});

// Keep the initial state and accessibility attributes in sync.
if (menuTabs.length) applyMenuFilter('all', menuTabs.find(tab => tab.dataset.filter === 'all') || menuTabs[0]);

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
