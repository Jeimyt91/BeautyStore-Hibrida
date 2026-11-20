import { initialProducts, formatCOP, normalizeProduct, escapeHTML as h } from './data.js';
import { addToCart, changeQuantity, cartTotal, cartCount } from './cart.js';
import { getStored, setStored, deleteStored } from './storage.js';
import { firebaseConfigured, onUserChanged, registerUser, loginUser, logoutUser } from './auth.js';
import { apiRequest, validateApiUrl } from './api.js';
import { choosePhoto, shrinkImage } from './photos.js';
import { upsertProduct, removeProduct } from './products.js';

const state = {
  cart: [], products: initialProducts, user: null, demo: false,
  profile: {}, orders: [], apiUrl: '', notification: null, selectedPayment: 'PSE'
};
const mount = document.getElementById('app');
const pageSet = new Set(['welcome', 'login', 'register', 'catalog', 'cart', 'checkout', 'manage', 'profile', 'settings', 'success']);
const emailError = (error) => {
  const map = {
    'auth/email-already-in-use': 'El correo ya está registrado.',
    'auth/invalid-email': 'El correo no tiene un formato válido.',
    'auth/weak-password': 'La contraseña debe tener al menos seis caracteres.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/network-request-failed': 'No se pudo conectar con Firebase.'
  };
  return map[error?.code] || error?.message || 'Ocurrió un error.';
};

const isSignedIn = () => !!state.user || state.demo;
const currentPage = () => (location.hash || '#welcome').slice(1).split('?')[0];
const notify = (message, type='good') => { state.notification = {message, type}; render(); };
const nav = (page) => { location.hash = `#${page}`; render(); };
const saveCart = async () => setStored('cart', state.cart);
const saveProducts = async () => setStored('products', state.products);
const saveProfile = async () => setStored('profile', state.profile);
const header = (page) => `
  <ion-header><ion-toolbar>
    <ion-title>✦ Beauty Store <span style="font-size:12px;font-weight:400;color:#947a89">HÍBRIDA</span></ion-title>
  </ion-toolbar></ion-header>
  <ion-content>
   <div class="app-body">
    <div class="topline">
      <span class="badge-soft">Android · iOS · Web</span>
      <div class="nav-links">
        ${isSignedIn() ? `
          <button data-nav="catalog" class="${page==='catalog'?'active':''}">Catálogo</button>
          <button data-nav="cart" class="${page==='cart'?'active':''}">Carrito (${cartCount(state.cart)})</button>
          <button data-nav="manage" class="${page==='manage'?'active':''}">Gestionar</button>
          <button data-nav="profile" class="${page==='profile'?'active':''}">Perfil</button>
        ` : '<button data-nav="welcome">Inicio</button>'}
        <button data-nav="settings" class="${page==='settings'?'active':''}">API</button>
      </div>
    </div>
    ${state.notification ? `<div class="note ${state.notification.type==='error'?'error':'good'}" role="status">${h(state.notification.message)}</div>` : ''}
    ${pageContent(page)}
    <div class="footer">Beauty Store • Proyecto académico híbrido • Sin pagos reales</div>
   </div>
  </ion-content>`;

function welcome() { return `
 <section class="hero">
  <div class="eyebrow">Belleza a tu alcance</div>
  <h1>Una experiencia de belleza para llevar.</h1>
  <p>Explora servicios, crea tu carrito y descubre Beauty Store desde Android, iPhone o navegador con una misma base de código.</p>
  <div class="hero-actions">
    <button class="btn white-btn" data-nav="login">Iniciar sesión</button>
    <button class="btn secondary" data-nav="register">Registrarse</button>
    <button class="btn ghost" data-action="demo">Entrar en modo demostración</button>
  </div>
 </section>
 <section class="card"><h2 class="section-title">¿Qué incluye esta versión?</h2>
   <p class="muted">Autenticación real por correo si se configura Firebase, catálogo y administración de productos, carrito con almacenamiento local, cámara y selección simulada del método de pago.</p>
   <div class="note">El modo demostración permite revisar la interfaz sin crear una cuenta. No equivale a autenticación real.</div>
 </section>`; }

function login() { return `
 <h1 class="section-title">Bienvenida de nuevo</h1><p class="muted">Ingresa con tu cuenta de Beauty Store.</p>
 <form class="card form" id="login-form">
   <label class="field">Correo electrónico<input type="email" name="email" autocomplete="email" required placeholder="correo@ejemplo.com"></label>
   <label class="field">Contraseña<input type="password" name="password" autocomplete="current-password" required minlength="6" placeholder="Tu contraseña"></label>
   <button class="btn" type="submit" ${!firebaseConfigured?'disabled':''}>Ingresar con Firebase</button>
   <button class="btn secondary" type="button" data-action="demo">Entrar en modo demostración</button>
   <p class="muted">¿No tienes cuenta? <button type="button" data-nav="register" class="linklike">Regístrate aquí</button></p>
   ${!firebaseConfigured?'<div class="note">Firebase aún no está configurado. Para crear e iniciar sesión con cuentas reales, completa el archivo .env. El modo demostración funciona sin Firebase.</div>':''}
 </form>`; }

function register() { return `
 <h1 class="section-title">Crear cuenta</h1><p class="muted">Registra tus datos y accede a tus servicios favoritos.</p>
 <form class="card form" id="register-form">
  <label class="field">Nombre<input type="text" name="name" required minlength="2" maxlength="70" autocomplete="name" /></label>
  <label class="field">Correo electrónico<input type="email" name="email" required autocomplete="email" /></label>
  <label class="field">Contraseña<input type="password" name="password" required minlength="6" autocomplete="new-password" /></label>
  <label class="field">Perfil solicitado<select name="role"><option>Comprador</option><option>Vendedor</option><option>Administrador</option></select></label>
  <div class="note">Por seguridad, la elección del perfil solo registra una preferencia; no concede permisos de administrador. La administración de productos es una herramienta de demostración.</div>
  <button type="submit" class="btn" ${!firebaseConfigured?'disabled':''}>Registrarse con Firebase</button>
  ${!firebaseConfigured?'<p class="muted">Firebase no está configurado. Usa «modo demostración» para probar el resto de la aplicación.</p>':''}
 </form>`; }

function catalog() { return `
  <div class="row wrap"><div><h1 class="section-title">Catálogo de belleza</h1><p class="muted">Servicios disponibles · precios en pesos colombianos</p></div><button class="btn secondary" data-action="refresh-api">Actualizar desde API</button></div>
  <div class="grid-cards">${state.products.map((p) => `
   <article class="product-card"><img class="product-image" loading="lazy" src="${h(p.imagen)}" alt="${h(p.nombre)}" />
   <div class="product-content"><h3>${h(p.nombre)}</h3><div class="price">${formatCOP(p.precio)}</div><button class="btn" data-action="add" data-id="${p.id}">Añadir al carrito</button></div></article>`).join('')}</div>
  <div class="note">Origen del catálogo: ${state.apiUrl?'API configurada (actualiza para verificar la conexión)':'almacenamiento local del dispositivo'}. Puedes cambiarlo en «API».</div>`; }

function cartPage() { return `
 <h1 class="section-title">Tu carrito</h1><p class="muted">Los productos permanecen guardados aunque cierres la aplicación.</p>
 <section class="card">${state.cart.length ? `
  ${state.cart.map((item) => `<div class="line-item">
    <div><strong>${h(item.nombre)}</strong><div class="muted">${formatCOP(item.precio)} por unidad</div></div>
    <div class="qty"><button aria-label="Disminuir" data-action="qty-minus" data-id="${item.id}">−</button><strong>${item.cantidad}</strong><button aria-label="Aumentar" data-action="qty-plus" data-id="${item.id}">+</button></div>
  </div>`).join('')}
  <div class="row wrap" style="margin-top:24px"><div><div class="muted">Total a pagar</div><div class="total">${formatCOP(cartTotal(state.cart))}</div></div><button class="btn" data-nav="checkout">Ir a pagar</button></div>
  <button class="linklike" style="margin-top:16px" data-action="clear-cart">Vaciar carrito</button>
 ` : `<div class="empty"><h2>Tu carrito está vacío</h2><p>Agrega un servicio para continuar.</p><button class="btn" data-nav="catalog">Ver catálogo</button></div>`}</section>`; }

function checkout() { return `
 <h1 class="section-title">Método de pago</h1><p class="muted">Confirma el método con el que deseas continuar.</p>
 <div class="card form"><h2>Total: ${formatCOP(cartTotal(state.cart))}</h2>
  <form id="checkout-form">
   <label class="field">Seleccione una opción<select name="payment" required><option value="PSE" ${state.selectedPayment==='PSE'?'selected':''}>PSE</option><option value="Tarjeta" ${state.selectedPayment==='Tarjeta'?'selected':''}>Tarjeta débito/crédito</option></select></label>
   <div class="note">Esta pantalla es una simulación académica. No se procesan cobros, no hay pasarela de pagos y no se deben introducir datos bancarios reales.</div>
   <button class="btn" type="submit" ${!state.cart.length?'disabled':''}>Simular confirmación</button>
  </form>
 </div>`; }

function manage() { return `
 <h1 class="section-title">Gestión de productos</h1><p class="muted">Operaciones CRUD para demostrar lectura, creación, actualización y eliminación.</p>
 <div class="note">Módulo académico: esta pantalla y la API de ejemplo no implementan permisos seguros de administrador. No deben publicarse como tienda real sin autenticación y reglas de acceso en el servidor.</div>
 <form id="product-form" class="card form" method="post">
  <input type="hidden" name="id" value="" />
  <label class="field">Nombre del servicio<input name="name" required maxlength="90" placeholder="Nuevo servicio"></label>
  <label class="field">Precio COP<input name="price" type="number" min="1" max="100000000" step="1" required placeholder="30000"></label>
  <label class="field">Imagen<select name="image"><option value="/images/corte.jpg">Corte de cabello</option><option value="/images/facial.webp">Facial</option><option value="/images/manicura.jpg">Manicura</option><option value="/images/colorimetria.jpg">Colorimetría</option></select></label>
  <div class="row wrap"><button class="btn" type="submit">Guardar servicio</button><button class="btn ghost" type="reset">Limpiar</button></div>
 </form>
 <section class="card"><h2>Servicios</h2>${state.products.map((p) => `
  <div class="line-item"><div><strong>${h(p.nombre)}</strong><div class="muted">${formatCOP(p.precio)}</div></div>
   <div class="row"><button class="btn small secondary" data-action="edit-product" data-id="${p.id}">Editar</button><button class="btn small ghost" data-action="delete-product" data-id="${p.id}">Eliminar</button></div></div>`).join('')}</section>`; }

function profilePage() { const displayName=state.demo?'Invitada':(state.user?.displayName || state.profile.name || 'Cuenta'); return `
 <h1 class="section-title">Perfil</h1>
 <div class="card form"><div class="row wrap" style="justify-content:flex-start;gap:20px">
  <img class="profile-pic" id="profile-photo" alt="Foto de perfil" src="${h(state.profile.photo || '/images/logo.png')}">
  <div><h2>${h(displayName)}</h2><p class="muted">${h(state.user?.email || (state.demo?'Modo demostración':'Cuenta'))}</p><span class="badge-soft">${state.demo?'Invitada':'Cuenta Firebase'}</span></div>
 </div>
 <hr><button class="btn" data-action="take-photo">Tomar foto / Galería</button>
 <p class="muted">También puedes subir una imagen desde el navegador:</p>
 <label class="field">Elegir fotografía<input id="photo-upload" type="file" accept="image/*" capture="user"></label>
 <div class="note">La foto se reduce antes de guardarse localmente. No se envía a Firebase ni a la API.</div>
 <button class="btn ghost" style="margin-top:20px" data-action="logout">Cerrar sesión</button></div>`; }

function settings() { return `
 <h1 class="section-title">Conexión con la API</h1><p class="muted">Configuración de servicios REST para el proyecto académico.</p>
 <form class="card form" id="settings-form">
  <label class="field">URL del servidor de productos<input type="url" name="api-url" placeholder="http://192.168.1.100:3000" value="${h(state.apiUrl)}"></label>
  <button class="btn" type="submit">Guardar dirección</button>
  <button class="btn secondary" type="button" data-action="test-api">Probar conexión</button>
  <button class="btn ghost" type="button" data-action="disable-api">Usar solo datos locales</button>
  <div class="note">En el navegador: http://localhost:3000. En un celular físico: utiliza la IP local del computador, por ejemplo http://192.168.1.100:3000, con ambos dispositivos en la misma red. Para HTTP nativo se requieren permisos de desarrollo; consulta el README.</div>
 </form>
 <section class="card"><h2>Estado de Firebase</h2><p>${firebaseConfigured?'✅ Variables Firebase configuradas; comprueba el acceso creando una cuenta.':'⚠️ Falta configurar Firebase en .env; el modo demostración no crea cuentas.'}</p>
 <p class="muted">Google Sign-In de la app Kotlin no se traslada automáticamente a un WebView; esta versión ofrece inicio de sesión por correo mediante Firebase.</p></section>`; }

function success() { const latest=state.orders.at(-1);return `<div class="card form"><h1 class="section-title">¡Pedido simulado!</h1><p class="muted">Se registró una confirmación local para fines de prueba.</p><div class="note good">Método: ${h(latest?.metodo || '—')} · Total: ${formatCOP(latest?.total || 0)}</div><p class="muted">No se realizó un cobro real.</p><button class="btn" data-nav="catalog">Volver al catálogo</button></div>`; }
function pageContent(page) {
  switch(page) {
    case 'login': return login(); case 'register': return register(); case 'catalog': return catalog();
    case 'cart': return cartPage(); case 'checkout': return checkout(); case 'manage': return manage();
    case 'profile': return profilePage(); case 'settings': return settings(); case 'success': return success();
    default: return welcome();
  }
}
function render() {
  let page = pageSet.has(currentPage()) ? currentPage() : 'welcome';
  if (!isSignedIn() && !['welcome','login','register','settings'].includes(page)) page='welcome';
  mount.innerHTML = header(page);
  // En Ionic, algunos eventos de formulario no cruzan el límite de Web Components
  // durante el burbujeo. Vincular el submit DIRECTAMENTE a cada formulario
  // evita que el navegador haga un GET con ?name=... sin guardar el producto.
  mount.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', onSubmit);
  });
}

async function refreshApi(showMessage = true) {
  if (!state.apiUrl) return notify('No hay URL de API configurada. Se mantiene el catálogo local.', 'error');
  try {
    const list = await apiRequest(state.apiUrl, 'GET', '/api/products');
    if (!Array.isArray(list)) throw new Error('La API no devolvió una lista válida.');
    state.products = list.map(normalizeProduct);
    await saveProducts();
    if (showMessage) notify(`Se consultó la API correctamente: ${state.products.length} productos.`);
    else render();
  } catch(error) { notify(`No se pudo actualizar desde la API: ${emailError(error)}. Se conserva el catálogo local.`, 'error'); }
}

async function onSubmit(event) {
  // IMPORTANTE: el input oculto name="id" en product-form puede ocultar la
  // propiedad nativa form.id y devolver un HTMLInputElement. Leer el atributo.
  const formId = event.target.getAttribute('id');
  if (!['login-form','register-form','checkout-form','product-form','settings-form'].includes(formId)) return;
  event.preventDefault();
  event.stopPropagation();
  const form = event.currentTarget;
  if (form.dataset.saving === 'true') return;
  form.dataset.saving = 'true';
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  const fields = Object.fromEntries(new FormData(form).entries());
  try {
    if (formId === 'login-form') {
      await loginUser(fields.email, fields.password);
      state.demo=false;await setStored('demo',false);state.notification=null;nav('catalog');
    } else if (formId === 'register-form') {
      const user=await registerUser(fields.name,fields.email,fields.password);
      state.profile={...state.profile,name:fields.name,requestedRole:fields.role};await saveProfile();
      state.demo=false; await setStored('demo',false);
      state.user=user;notify('Cuenta creada con Firebase. El perfil solicitado no otorga privilegios administrativos.');nav('catalog');
    } else if(formId === 'checkout-form') {
      if (!state.cart.length) throw new Error('Agrega un producto al carrito.');
      state.selectedPayment=fields.payment;
      state.orders.push({ fecha:new Date().toISOString(), metodo:fields.payment, total:cartTotal(state.cart), articulos:state.cart });
      await setStored('orders',state.orders); state.cart=[];await saveCart();
      state.notification=null;nav('success');
    } else if(formId === 'settings-form') {
      state.apiUrl=validateApiUrl(fields['api-url']);await setStored('api-url',state.apiUrl);
      notify(state.apiUrl?'URL guardada. Pulsa «Probar conexión».':'Se activó el catálogo local.');
    } else if(formId === 'product-form') {
      const nombre=String(fields.name||'').trim();const precio=Number(fields.price);
      if (nombre.length<2 || !Number.isFinite(precio) || precio<=0 || precio>1e8) throw new Error('Verifica nombre y precio.');
      const id=fields.id?Number(fields.id):null;
      const product={...(id?{id}:{}),nombre,precio,imagen:fields.image};
      if (state.apiUrl) {
        await apiRequest(state.apiUrl,id?'PUT':'POST',id?`/api/products/${id}`:'/api/products',product);
        await refreshApi(false);
        notify(id?'Producto actualizado por API.':'Producto creado por API.');
      } else {
        state.products=upsertProduct(state.products,product);
        await saveProducts(); notify('Producto guardado localmente.');
      }
    }
  }catch(error){notify(emailError(error),'error');}
  finally {
    if (form.isConnected) {
      form.dataset.saving = 'false';
      if (submitButton) submitButton.disabled = false;
    }
  }
}

async function onAction(event) {
  const button=event.target.closest('[data-nav],[data-action]');if(!button)return;
  if(button.dataset.nav){state.notification=null;nav(button.dataset.nav);return;}
  const action=button.dataset.action,id=Number(button.dataset.id);
  try {
    if(action==='demo'){state.demo=true;await setStored('demo',true);state.notification=null;nav('catalog');}
    if(action==='logout'){await logoutUser();state.demo=false;state.user=null;await setStored('demo',false);state.notification=null;nav('welcome');}
    if(action==='add'){const p=state.products.find((v)=>v.id===id);if(!p)return;state.cart=addToCart(state.cart,p);await saveCart();notify(`${p.nombre} agregado al carrito.`);}
    if(action==='qty-plus'||action==='qty-minus'){state.cart=changeQuantity(state.cart,id,action==='qty-plus'?1:-1);await saveCart();render();}
    if(action==='clear-cart'){state.cart=[];await saveCart();notify('Carrito vaciado.');}
    if(action==='refresh-api'){await refreshApi();}
    if(action==='edit-product'){
      const product=state.products.find((p)=>p.id===id);if(!product)return;
      const form=document.getElementById('product-form');
      form.elements.namedItem('id').value=String(product.id);
      form.elements.namedItem('name').value=product.nombre;
      form.elements.namedItem('price').value=String(product.precio);
      form.elements.namedItem('image').value=product.imagen;
      form.scrollIntoView({behavior:'smooth'});
    }
    if(action==='delete-product'){
      if(!confirm('¿Eliminar este servicio del catálogo?'))return;
      if(state.apiUrl) { await apiRequest(state.apiUrl,'DELETE',`/api/products/${id}`);await refreshApi(false); }
      else{state.products=removeProduct(state.products,id);await saveProducts();}
      notify('Producto eliminado.');
    }
    if(action==='take-photo'){const photo=await choosePhoto();state.profile.photo=photo;await saveProfile();notify('Fotografía guardada localmente.');}
    if(action==='test-api'){
      const info=await apiRequest(state.apiUrl,'GET','/api/health');
      notify(`Conexión correcta con la API: ${info.status || 'activa'}.`);
    }
    if(action==='disable-api'){state.apiUrl='';await setStored('api-url','');notify('Se usan productos locales; la API quedó desactivada.');}
  }catch(error){notify(emailError(error),'error');}
}

async function onChange(event){
  if(event.target.id!=='photo-upload'||!event.target.files?.length)return;
  const file=event.target.files[0];
  if(!file.type.startsWith('image/'))return notify('Selecciona una imagen válida.','error');
  const reader=new FileReader();
  reader.onload=async()=>{try{state.profile.photo=await shrinkImage(reader.result);await saveProfile();notify('Fotografía guardada localmente.');}catch(error){notify(emailError(error),'error');}};
  reader.readAsDataURL(file);
}

export async function startApp(){
  state.cart=await getStored('cart',[]);
  state.products=(await getStored('products',initialProducts)).map(normalizeProduct);
  state.profile=await getStored('profile',{});
  state.orders=await getStored('orders',[]);
  state.apiUrl=await getStored('api-url',import.meta.env.VITE_API_URL||'');
  state.demo=await getStored('demo',false);
  if(!Array.isArray(state.cart))state.cart=[];
  if(!Array.isArray(state.products))state.products=initialProducts;
  if(!Array.isArray(state.orders))state.orders=[];
  window.addEventListener('hashchange',()=>{state.notification=null;render();});
  mount.addEventListener('click',onAction);
  // Los eventos submit se vinculan a cada formulario dentro de render().
  mount.addEventListener('change',onChange);
  onUserChanged((user)=>{state.user=user;render();});
  render();
}
