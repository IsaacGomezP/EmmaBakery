# Emma Bakery

Sitio público de Emma Bakery: enlaces de pedidos y contacto, Instagram y menú de nueve sabores con precios por unidad.

**Aquí medimos con el corazón.**

## Contenido y publicación

- `public/index.html`: portada de enlaces.
- `public/menu.html`: menú con carrito, cantidades y subtotal.
- `public/cart.js`: carrito guardado en el navegador, mensaje de WhatsApp y parallax accesible.
- `public/menu.json`: lista de productos, precios en DOP y número empresarial.
- `public/styles.css`: diseño adaptable crema, vino y rosa.
- `public/assets/emma-bakery-logo.png`: logo original de la marca.
- `public/assets/cookies/`: nueve imágenes WebP aportadas por el propietario, conservadas sin modificar.
- `netlify.toml`: publicación de `public/` y cabeceras del sitio.

No requiere dependencias ni compilación. Netlify debe publicar la carpeta `public`, sin comando de construcción. La rama de producción es `main`.

WhatsApp empresarial: **+1 (849) 592-6986**. Los enlaces abren un mensaje preparado; la persona decide cuándo enviarlo. Instagram: [@emmabakerys](https://www.instagram.com/emmabakerys/).

El carrito permite agregar hasta 99 unidades por sabor, ajustar cantidades, eliminar productos y vaciar el pedido. Guarda únicamente identificadores y cantidades en el navegador. Usa los precios actuales del menú para calcular el subtotal; no incluye entrega ni confirma disponibilidad. Continuar abre WhatsApp con el resumen para que el cliente lo envíe. Sin JavaScript, conserva enlaces individuales por sabor. El parallax se desactiva con la preferencia de reducir movimiento del dispositivo.

Los datos bancarios se comparten únicamente por WhatsApp y no deben añadirse a este repositorio público.

Sitio: <https://emmabakerys.netlify.app/>. Correo: **emmabakery30@gmail.com**. Negocio virtual en Villa Carmen, Santo Domingo Este, con horario de 24 horas confirmado por el propietario.

Los sabores y precios fueron confirmados por el propietario. Si cambian, actualizar `menu.html` y `menu.json` juntos. No se indican horarios, zonas de entrega ni disponibilidad sin confirmar.

## Alcance

Este repositorio contiene únicamente el sitio público. Los pedidos internos, respaldos de clientes, credenciales y base de datos se mantienen fuera de este repositorio y de la carpeta publicada.

El menú de la web funciona de forma independiente del catálogo de WhatsApp Business. Los nueve artículos se cargaron en la cuenta empresarial con imagen, precio por unidad en la descripción, enlace del sabor y código EMMA-001 a EMMA-009. WhatsApp revisa los artículos antes de mostrarlos a los clientes; su aprobación se gestiona en la cuenta empresarial.
