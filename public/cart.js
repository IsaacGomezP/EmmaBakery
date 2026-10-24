(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const products = [...document.querySelectorAll('.product')].map(card => ({
    id: card.id,
    name: card.querySelector('h2').textContent,
    price: Number(card.querySelector('.price').textContent.replace(/[^\d]/g, '')),
    card,
  }));
  const byId = new Map(products.map(product => [product.id, product]));
  const cart = new Map();
  const storageKey = 'emma-bakery-cart-v1';
  const money = value => 'RD$' + value.toLocaleString('es-DO');
  const dialog = $('#cart-dialog');
  let lastTrigger = null;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) for (const entry of saved) {
      if (Array.isArray(entry) && byId.has(entry[0]) && Number.isInteger(entry[1]) && entry[1] > 0 && entry[1] <= 99) cart.set(entry[0], entry[1]);
    }
  } catch { /* The cart also works when browser storage is unavailable. */ }

  function button(text, label, action, disabled = false) {
    const element = document.createElement('button');
    element.type = 'button'; element.textContent = text;
    element.setAttribute('aria-label', label); element.disabled = disabled;
    element.addEventListener('click', action);
    return element;
  }
  function change(id, difference) {
    const quantity = Math.min(99, (cart.get(id) || 0) + difference);
    if (quantity <= 0) cart.delete(id); else cart.set(id, quantity);
    render();
  }
  function render() {
    const count = [...cart.values()].reduce((sum, qty) => sum + qty, 0);
    const total = [...cart].reduce((sum, [id, qty]) => sum + byId.get(id).price * qty, 0);
    $('#cart-count').textContent = count;
    $('#cart-total').textContent = $('#floating-total').textContent = money(total);
    $('#cart-empty').hidden = count > 0;
    $('#send-order').hidden = $('#clear-cart').hidden = count === 0;
    const holder = $('#cart-items');
    const focus = document.activeElement?.getAttribute('data-focus-key');
    holder.replaceChildren();
    for (const [id, quantity] of cart) {
      const product = byId.get(id);
      const item = document.createElement('li'); item.className = 'cart-item';
      const info = document.createElement('div'); info.className = 'cart-item-info';
      const name = document.createElement('strong'); name.textContent = product.name;
      const price = document.createElement('small'); price.textContent = money(product.price) + ' por unidad';
      const remove = button('Eliminar', 'Eliminar ' + product.name + ' del carrito', () => { cart.delete(id); render(); $('#cart-close').focus(); });
      remove.className = 'remove-item';
      info.append(name, price, remove);
      const controls = document.createElement('div'); controls.className = 'quantity';
      const less = button('−', 'Quitar una ' + product.name, () => change(id, -1));
      const more = button('+', 'Agregar una ' + product.name, () => change(id, 1), quantity >= 99);
      less.dataset.focusKey = id + '-less'; more.dataset.focusKey = id + '-more';
      const amount = document.createElement('span'); amount.textContent = quantity;
      amount.setAttribute('aria-label', quantity + ' unidades de ' + product.name);
      controls.append(less, amount, more);
      const lineTotal = document.createElement('strong'); lineTotal.className = 'line-total'; lineTotal.textContent = money(quantity * product.price);
      item.append(info, controls, lineTotal); holder.append(item);
    }
    if (focus) {
      const replacement = [...holder.querySelectorAll('button')].find(b => b.dataset.focusKey === focus);
      (replacement && !replacement.disabled ? replacement : $('#cart-close')).focus();
    }
    const lines = [...cart].map(([id, qty]) => `• ${qty} × ${byId.get(id).name} — ${money(byId.get(id).price * qty)}`);
    const message = `¡Hola, Emma Bakery! 🍪 Quisiera hacer este pedido:\n\n${lines.join('\n')}\n\nSubtotal: ${money(total)}\nEntrega no incluida.\n\n¿Me confirman disponibilidad, total final y opciones de entrega?`;
    if (count) $('#send-order').href = 'https://wa.me/18495926986?text=' + encodeURIComponent(message);
    else $('#send-order').removeAttribute('href');
    try { localStorage.setItem(storageKey, JSON.stringify([...cart])); } catch { /* Optional persistence. */ }
    $('#cart-toggle').setAttribute('aria-label', `Ver mi carrito, ${count} galletas, ${money(total)}`);
  }
  for (const product of products) {
    const add = product.card.querySelector('.add-to-cart'); add.hidden = false;
    add.addEventListener('click', () => {
      const old = cart.get(product.id) || 0;
      change(product.id, 1);
      $('#cart-status').textContent = old >= 99 ? 'Máximo 99 unidades por sabor. Para pedidos mayores, escríbenos.' : product.name + ' agregada al carrito. ' + $('#cart-count').textContent + ' galletas en tu pedido.';
    });
  }
  $('#cart-toggle').hidden = false;
  $('#cart-toggle').addEventListener('click', event => { lastTrigger = event.currentTarget; dialog.showModal(); });
  $('#cart-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => lastTrigger?.focus());
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }});
  $('#clear-cart').addEventListener('click', () => { cart.clear(); render(); $('#cart-close').focus(); $('#cart-status').textContent = 'Carrito vacío.'; });
  render();

  // The supplied reference uses scroll depth on touch and tilt on desktop.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const visuals = products.map(p => p.card.querySelector('.product-image'));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function motion(visual, roll = 0, pitch = 0, yaw = 0, lift = 0, scale = 1) {
    const image = visual.querySelector('img');
    image.style.transform = `perspective(700px) translateY(${lift}px) rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg) scale(${scale})`;
  }
  for (const visual of visuals) {
    visual.addEventListener('pointermove', event => {
      if (reduced.matches || !fine.matches) return;
      const rect = visual.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      const y = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      motion(visual, x * 4.5, -y * 9, x * 11, -6, 1.06);
    }, { passive: true });
    visual.addEventListener('pointerleave', schedule);
  }
  let pending = false;
  function update() {
    pending = false;
    if (reduced.matches) return;
    const center = innerHeight / 2;
    visuals.forEach((visual, index) => {
      const rect = visual.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const progress = clamp((center - rect.top - rect.height / 2) / (center + rect.height / 2), -1, 1);
      const direction = index % 2 === 0 ? 1 : -1;
      motion(visual, direction * progress * 13, -progress * 5, direction * progress * 9, -progress * 19, 1.035 + (1 - Math.abs(progress)) * .025);
    });
  }
  function schedule() { if (!pending && !reduced.matches) { pending = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  for (const media of [reduced, fine]) media.addEventListener('change', () => { visuals.forEach(v => motion(v)); schedule(); });
  schedule();
})();
