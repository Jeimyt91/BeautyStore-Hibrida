# Informe breve de migración · Kotlin a Ionic + Capacitor

## Diagnóstico del proyecto nativo recibido

El ZIP entregado contiene un proyecto Android con `applicationId` y `namespace` `com.sena.beautystore`, `minSdk=27`, `targetSdk=35` y Activities Kotlin. En `LoginActivity.kt` se usa Firebase Auth para el inicio de sesión por correo, y Google Sign-In mediante APIs de Android. En `RegistroActivity.kt`, el formulario valida campos y muestra un Toast de éxito, **pero no crea una cuenta Firebase**. En `ProductListActivity.kt` aparecen cuatro productos predefinidos. El `Carrito.kt` es un singleton en memoria, por lo que no garantiza persistencia entre reinicios. En `MainActivity.kt` existe un intento de obtener ubicación GPS.

## Decisiones de migración

- **Una sola base de código:** HTML/CSS/JavaScript con componentes Ionic y empaquetado nativo mediante Capacitor.
- **Autenticación:** sustituir la capa de Auth Kotlin por SDK web Firebase. Login y registro por correo cuando se configura Firebase. El inicio con Google queda pendiente por requerir integración OAuth apropiada.
- **Productos:** mantener nombre, precio y fotografías originales; añadir CRUD persistente local y API REST académica.
- **Carrito:** trasladar el modelo a `cart.js` con pruebas y persistencia en `Preferences`.
- **Cámara:** trasladar el uso básico de cámara/galería a Capacitor Camera; almacenar una fotografía pequeña en el dispositivo.
- **Pago:** ofrecer solo la selección académica del método, sin cobro ni captura de datos bancarios.
- **Rol solicitado:** el formulario no puede autootorgar permisos administrativos; controlar realmente roles exige servidor o reglas autenticadas.

## Requisito de aplicación híbrida

El proyecto contiene código compartido de la interfaz y lógica. Las carpetas Android e iOS se crean con Capacitor una vez instaladas las dependencias. La compatibilidad se verifica únicamente tras ejecutar y documentar pruebas por plataforma; el código híbrido por sí solo no demuestra que todas las funcionalidades funcionen en ambas.

## Puntos no migrados

- Inicio de sesión nativo con Google.
- Solicitud automática de ubicación.
- Procesamiento real de pagos y backend seguro de administración (no existían completos en el ZIP base).
- Pruebas de funcionamiento de iOS o compilación nativa final: pendientes.

## Diferencia entre implementación y evidencia

Esta entrega implementa fuentes híbridas y una API de ejemplo. La API y funciones del carrito fueron sometidas a pruebas automáticas (5 pruebas, 0 fallos). Las capturas del video original muestran el proyecto Android nativo y no son evidencia de funcionamiento de esta migración; se necesitan nuevas capturas de emulador y del HUAWEI físico ejecutando esta versión.
