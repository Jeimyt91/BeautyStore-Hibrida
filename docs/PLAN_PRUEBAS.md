# Matriz de pruebas de Beauty Store Híbrida

**Estatus:** plan de verificación. No marcar como «aprobadas» las pruebas manuales hasta ejecutarlas realmente.

| Código | Plataforma | Acción | Resultado esperado | Evidencia a capturar | Estado |
|---|---|---|---|---|---|
| P-01 | Navegador | Abrir `npm run dev` | Bienvenida visible | URL y captura inicial | Pendiente |
| P-02 | Navegador | Ingresar en modo demostración | Mostrar catálogo sin crear cuenta | Pantalla catálogo | Pendiente |
| P-03 | Navegador | Configurar Firebase y registrarse | Se crea usuario en Firebase Authentication | Captura formulario y consola Firebase | Pendiente |
| P-04 | Navegador/Android | Iniciar sesión con correo | Se muestra catálogo autenticado | Pantalla usuario | Pendiente |
| P-05 | Navegador | GET a API | Lista los cuatro servicios | Pestaña Red / Postman | Pendiente |
| P-06 | Navegador | Crear, editar y eliminar producto conectado a API | POST, PUT y DELETE funcionales | Network, catálogo antes y después | Pendiente |
| P-07 | Navegador/Android | Agregar 2 veces un producto | Cantidad 2 y total correcto | Carrito y total | Pendiente |
| P-08 | Navegador/Android | Cerrar y reabrir app | Carrito permanece almacenado | Capturas antes y después | Pendiente |
| P-09 | Emulador Android | Tomar fotografía | Se abre cámara y se ve foto | Captura emulador | Pendiente |
| P-10 | HUAWEI EML-L29 físico | Tomar fotografía | Se abre cámara del teléfono y se guarda miniatura | Captura físico | Pendiente |
| P-11 | Android | Seleccionar PSE o Tarjeta | Confirmación de prueba, sin cobro | Selección y mensaje | Pendiente |
| P-12 | iOS, si hay Mac | Abrir y usar catálogo, carrito y cámara | Interfaz y capacidades funcionando | Simulador/iPhone | Pendiente |
| P-13 | Node.js | `npm test` | 5 pruebas automáticas aprobadas | Terminal con TAP `pass 5` | **Aprobada en preparación** |

## Registro para cada caso manual

Anotar: **fecha**, **equipo/dispositivo**, **versión de Android/iOS**, **pasos**, **resultado esperado**, **resultado real**, **captura**, **aprobado/fallido**, **observaciones** y **corrección**.

## Diferencia académica importante

Las grabaciones del proyecto Kotlin nativo anterior **no son pruebas de la aplicación híbrida**. Sirven como referencia funcional inicial. Para la evaluación de este entregable hay que repetir las pruebas en el proyecto `BeautyStore-Hibrida` recién convertido.
