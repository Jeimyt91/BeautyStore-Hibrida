# Beauty Store Híbrida · Android, iOS y Web

**Proyecto migrado a partir de:** `BeutiqueStore-main.zip` (Android nativo, Kotlin).
**Tecnologías de la nueva versión:** Ionic Core (interfaz web), Vite, JavaScript, Capacitor, Firebase Authentication (opcional), Capacitor Camera y Preferences, y API REST con Node.js.

> **Estado real de la entrega:** se incluye el **código fuente híbrido**, las imágenes originales, la API y pruebas automáticas. No incluye APK, IPA ni carpetas `android/` y `ios/` compiladas: estas se generan en cada computador después de instalar las dependencias. No se ha probado todavía el funcionamiento de la interfaz en un teléfono real ni en iOS. El servidor API y la lógica del carrito sí se probaron con Node.js (5 casos aprobados).

## 1. ¿Qué se conservó del proyecto Kotlin?

| Proyecto nativo recibido | Implementación híbrida |
|---|---|
| Pantalla inicial, ingreso y registro | `src/app.js` con navegación web responsiva |
| Firebase Auth: login por correo | `src/auth.js`: login y registro reales con Firebase cuando se configura |
| Registro nativo que solo muestra “Registro exitoso” | Ahora se llama `createUserWithEmailAndPassword` cuando Firebase está configurado |
| Google Sign-In de Android | **No migrado**: requiere integración OAuth específica para WebView nativa |
| Corte de Cabello, Facial, Manicura y Colorimetría | Catálogo inicial y fotos originales conservados |
| `Carrito` singleton de Kotlin | `src/cart.js` y almacenamiento local `Preferences` persistente |
| Cámara Android | `@capacitor/camera` + alternativa de selección de imagen |
| Gestión de productos vista en la demostración | CRUD local y CRUD por API REST de prueba |
| Selección de PSE / tarjeta en la demostración | Simulación **sin pagos reales ni datos bancarios** |
| Ubicación GPS en MainActivity | **No migrada**: no forma parte de la demostración central ni los requisitos mínimos |

**Importante:** la versión original es **nativa Android**. Esta entrega no cambia mágicamente Kotlin a iOS: rehace la interfaz y funciones principales con tecnologías web compartidas, y Capacitor permite producir proyectos nativos para Android/iOS a partir de ese mismo código.

## 2. Preparación en Windows

Instala lo siguiente:

1. **Node.js 22 LTS o superior**, desde https://nodejs.org/.
2. **Visual Studio Code**, desde https://code.visualstudio.com/.
3. **Android Studio 2025.2.1 o superior**, con Android SDK (API 24 o superior) desde https://developer.android.com/studio.
4. Ten conexión a Internet para la primera instalación de paquetes.

Verifica en PowerShell o el terminal de VS Code:

```powershell
node -v
npm -v
```

## 3. Abrir y ejecutar la aplicación híbrida en el navegador

1. Descomprime `BeautyStore_Hibrida_Android_iOS.zip` en una carpeta fácil de localizar, por ejemplo `C:\Proyectos\BeautyStore-Hibrida`.
2. Abre Visual Studio Code → **Archivo → Abrir carpeta** → selecciona `BeautyStore-Hibrida`.
3. Abre **Terminal → Nuevo terminal**.
4. Ejecuta:

```powershell
npm install
npm run dev
```

5. Abre la dirección que muestre Vite (habitualmente `http://localhost:5173`).
6. Entra por **«Modo demostración»**. Así podrás explorar el catálogo, agregar productos, probar el carrito, la administración de productos y los pagos simulados sin configurar Firebase todavía.

## 4. Probar el servicio API real (GET, POST, PUT, DELETE)

Se incluye una **API REST local hecha en Node.js**, sin servicios ni paquetes adicionales. Sirve para evidenciar servicios API, pero **no tiene autenticación ni permisos** y no debe exponerse públicamente.

1. Abre **un segundo terminal** de VS Code sin cerrar el anterior.
2. Ejecuta:

```powershell
npm run api
```

3. Abre `http://localhost:3000/api/health`: debe responder `{"status":"ok", ...}`.
4. Abre `http://localhost:3000/api/products`: deben aparecer los cuatro servicios.
5. En la app, entra a **API**, escribe `http://localhost:3000` y pulsa **Guardar dirección** y **Probar conexión**.
6. Ve a **Catálogo → Actualizar desde API**.
7. En **Gestionar**, crea un producto, edítalo y elimínalo. Se enviarán solicitudes POST, PUT y DELETE a la API. Puedes mostrar cada método en la pestaña **Network / Red** de las herramientas para desarrolladores del navegador.

La API guarda el catálogo editado en `server/local-products.json`, archivo que no se debe subir a GitHub. El modo local funciona incluso con la API desconectada.

## 5. Configurar Firebase Authentication real

El archivo `google-services.json` del proyecto nativo **NO sustituye** la configuración de una aplicación web de Firebase. Debes usar el **mismo proyecto Firebase** y registrar una aplicación **Web** en su consola.

1. Abre https://console.firebase.google.com/ y selecciona el proyecto del Beauty Store nativo.
2. Haz clic en **Configuración del proyecto** → **Tus aplicaciones** → **Agregar aplicación Web** (`</>`).
3. Registra la aplicación Web y copia las propiedades de su objeto `firebaseConfig`.
4. En VS Code, **copia** `.env.example` como `.env` (en PowerShell: `Copy-Item .env.example .env`).
5. Completa las variables `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID` con los valores reales del objeto Web.
6. En **Firebase Console → Authentication → Sign-in method**, habilita **Correo electrónico / Contraseña**.
7. Si pruebas desde navegador, agrega el dominio autorizado correspondiente en **Authentication → Settings → Authorized domains** cuando corresponda.
8. Reinicia `npm run dev`. Prueba **Registrarse** y **Iniciar sesión** con un correo de prueba.

**No subas `.env` a GitHub**, aunque la configuración web de Firebase no sea por sí sola una clave privada del servidor. El archivo se excluye mediante `.gitignore`.

**Roles:** el selector comprador/vendedor/administrador solo registra una preferencia; **no concede privilegios**. Antes de publicar una tienda real se deben implementar permisos en backend o reglas de Firebase verificables en el servidor. Tampoco se migró el botón Google Sign-In nativo.

## 6. Convertir y ejecutar en Android (emulador y teléfono físico)

En la raíz del proyecto, después de `npm install`:

```powershell
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

**¡Ejecuta `npx cap add android` solo una vez!** Si Android ya existe, usa únicamente `npm run build` y `npx cap sync android` después de cada cambio web.

En Android Studio:

1. Deja que termine **Gradle Sync**. Instala los componentes de Android SDK que se soliciten.
2. Para emulador, abre **Device Manager → Create device** y selecciona un teléfono virtual compatible (API 29 o mayor, preferiblemente).
3. Para teléfono físico HUAWEI EML-L29, habilita **Opciones de desarrollador → Depuración USB**, conecta el cable y acepta el permiso de depuración.
4. Selecciona el dispositivo o emulador en la barra superior y pulsa **Run** (triángulo verde).
5. Comprueba bienvenida, catálogo, cámara, carrito y simulación de pago. Para probar Firebase configura `.env` **antes de compilar**.

### Si necesitas acceder a la API desde el HUAWEI físico

- El computador y teléfono deben estar en la **misma red Wi-Fi**, y el firewall debe permitir el puerto 3000 del computador.
- Usa `ipconfig` para hallar el IPv4 local del computador (por ejemplo, `192.168.1.100`).
- En la pantalla **API** del celular escribe `http://192.168.1.100:3000` (no `localhost`).
- En desarrollo, Android puede bloquear HTTP sin cifrar. Si ocurre, abre `android/app/src/main/AndroidManifest.xml` y en la etiqueta `<application ...>` agrega **solo para la prueba local** `android:usesCleartextTraffic="true"`. Luego compila de nuevo.
- Para una app publicada, utiliza **HTTPS** y desactiva el uso de HTTP sin cifrar.

## 7. Convertir a iOS (en un Mac)

**Un PC con Windows no puede compilar directamente un archivo IPA usando Xcode.** El mismo código fuente web puede usarse para iOS, pero la compilación y las pruebas nativas deben realizarse en **macOS con Xcode compatible**.

En el Mac, abre el proyecto, instala Node y Xcode, luego ejecuta:

```bash
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

En Xcode selecciona el simulador de iPhone o un iPhone físico y pulsa **Run**. Para la cámara agrega textos de permisos apropiados en `ios/App/App/Info.plist` para `NSCameraUsageDescription` y `NSPhotoLibraryUsageDescription`, si el plugin/build los requiere.

**Si usas API local:** usa una dirección accesible desde el iPhone y configura excepciones temporales de App Transport Security solo para desarrollo, o mejor sirve la API por HTTPS. El acceso a iOS aún necesita verificarse en un equipo Mac.

## 8. Pruebas automáticas y evidencias

Ejecuta en la terminal:

```powershell
npm test
```

Contiene 5 pruebas de datos, carrito y API. El resultado obtenido en el entorno de preparación fue **5 aprobadas y 0 fallidas**; la instalación de Ionic/Firebase/Capacitor y la compilación de APK/IPA **no se validaron** en este entorno.

Para el informe académico, registra:

- Capturas de **`npm run dev`** y de la pantalla de bienvenida.
- Registro e inicio de sesión **real** mediante Firebase, después de configurarlo.
- Consola de API (`npm run api`) y respuesta `GET /api/products`.
- Capturas de API REST en **Network** para POST, PUT y DELETE.
- Producto en catálogo, carrito antes/después del reinicio, cálculo del total.
- Foto tomada con cámara en el emulador y en el **HUAWEI EML-L29 físico**.
- Resultado de `npm test`, indicando los cinco casos aprobados.
- Pruebas en iOS **solo cuando se ejecuten realmente**; no afirmes que están realizadas por el hecho de existir Capacitor iOS.

Consulta `docs/PLAN_PRUEBAS.md` y `docs/MIGRACION.md`.

## 9. Publicar el código en GitHub

1. Crea un repositorio vacío en GitHub llamado, por ejemplo, `BeautyStore-Hibrida`.
2. Ejecuta desde la carpeta del proyecto:

```powershell
git init
git add .
git commit -m "Migracion academica a Ionic y Capacitor"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/BeautyStore-Hibrida.git
git push -u origin main
```

Sustituye `TU_USUARIO` por tu usuario. GitHub puede solicitar autenticación mediante navegador o token. Asegúrate de que `.env`, `node_modules` y la base de datos local no se incluyan.

## 10. Limitaciones honestas

- **No** es una conversión automática de los Activities Kotlin; es una **reimplementación** de las funcionalidades centrales en Ionic + JavaScript.
- No contiene proyectos Android o iOS generados; estos se crean con Capacitor y se deben compilar y probar.
- No existe un sistema de pagos: PSE y tarjeta son solo opciones visibles, y nunca se recogen datos bancarios.
- Login y registro reales requieren configurar Firebase. El modo demostración **no valida identidad**.
- La API de ejemplo no protege los endpoints contra usuarios no autorizados; úsala solo en un entorno académico local.
- Google Sign-In, ubicación y funciones no representadas en el ZIP original **no** se trasladaron automáticamente.
- El funcionamiento en iOS no se puede certificar sin pruebas en un Mac o iPhone.

## 11. Referencias oficiales

- Ionic JavaScript Quickstart: https://ionicframework.com/docs/javascript/quickstart
- Capacitor Getting Started: https://capacitorjs.com/docs/getting-started
- Capacitor Environment Setup: https://capacitorjs.com/docs/getting-started/environment-setup
- Firebase Auth correo y contraseña: https://firebase.google.com/docs/auth/web/password-auth
- Firebase Authentication: https://firebase.google.com/docs/auth/web/start
