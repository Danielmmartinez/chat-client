#  Chat Client · La Taberna del Dragón Verde (React + STOMP)

Aplicación cliente en tiempo real construida con **React (Vite)** y **`@stomp/stompjs`**, conectada mediante WebSockets y peticiones HTTP REST al servidor **`chat-server`**.

---

##  Conexión con el Servidor (`chat-server`)

El cliente se comunica con el backend (`http://localhost:8080`) por dos vías:
1. **Canal WebSocket / STOMP (`ws://localhost:8080/ws`):**
   * **Se suscribe a:** `/topic/sala` para recibir en vivo mensajes de texto, alertas de entrada/salida, pergaminos (imágenes) y contratos fijados.
   * **Envía a:**
     * `/app/chat.unirse` al iniciar sesión con nombre y clase de aventurero.
     * `/app/chat.enviar` cada vez que se publica un mensaje (`TEXTO`, `IMAGEN` o `CONTRATO`).
2. **Canal HTTP REST (`POST http://localhost:8080/api/archivos`):**
   * Envía imágenes mediante `FormData` y recibe la URL generada para difundirla por STOMP.

---

## Tema Escogido: La Taberna del Dragón Verde (Fantasía Medieval / Nórdica)

El frontend base fue transformado por completo en una taberna medieval inmersiva con estética nórdica:
* **Pantalla de acceso ("El Gran Ayuntamiento"):** Fondo de fortaleza medieval y formulario en pergamino donde el usuario elige su nombre y oficio RPG (*Guerrero, Mago, Pícaro, Bardo, Paladín o Explorador*).
* **Salón Comunal:** Fondo de salón medieval con vigas de madera y muros de piedra, flanqueado por **mástiles con antorchas animadas** cuyo fuego parpadea dinámicamente.
* **Identidad gráfica:** Emblema vectorial propio de dragón vikingo en oro, sellos rúnicos y tipografía manuscrita (*Uncial Antiqua*, *Almendra SC*, *MedievalSharp* y *Crimson Text*).
* **Leyes del Gremio Nórdico:** Panel lateral tipo estela de piedra con las reglas del salón.

---
##  Funcionalidades Extra Implementadas

1. **Subida y exhibición de imágenes/pergaminos (`📜`):**
   * Permite seleccionar imágenes locales, subirlas al backend por HTTP y renderizarlas enmarcadas en tiempo real para todos los usuarios conectados.
2. **Tablón Público de Edictos y Contratos:**
   * Panel lateral izquierdo interactivo con modal para **clavar nuevos contratos de misión** (título, recompensa y descripción).
   * Cada contrato publicado se transmite en vivo por WebSocket como un bando oficial en el chat y se añade automáticamente al tablón lateral de todos los clientes.
3. **Caja de texto auto-expandible:**
   * `<textarea>` inteligente que crece verticalmente hasta 4-5 líneas con textos largos, permitiendo enviar con `Enter` y saltar línea con `Shift + Enter`.

---

##  Capturas del Funcionamiento

### Chat base multi-pestaña (Fase 1)
![Login y chat base multi-pestaña](docs/Captura%20de%20pantalla_20261112_101336.png)

![Conversación en tiempo real entre múltiples pestañas](docs/Captura%20de%20pantalla_20261112_101420.png)

### Inspección del WebSocket en DevTools (Handshake 101 y Frames STOMP)
![Handshake 101 Switching Protocols en DevTools](docs/Captura%20de%20pantalla_20261112_101657.png)

![Inspección de frames STOMP en Network WS](docs/Captura%20de%20pantalla_20261112_101740.png)

### Tema personalizado: La Taberna del Dragón Verde (Fase 2)
![Interfaz final temática de La Taberna del Dragón Verde](docs/Captura%20de%20pantalla_20261112_104927.png)

---

##  Cómo correr el cliente en local

### Requisitos previos
* **Node.js 20** o superior.
* Tener corriendo previamente el backend **`chat-server`** en el puerto `8080`.

### Pasos
```bash
# 1. Instalar las dependencias
npm install

# 2. Levantar el servidor de desarrollo Vite
npm run dev
```

Abre `http://localhost:5173` en **dos o más pestañas** del navegador, regístrate con distintos nombres/clases de aventurero y comienza a interactuar.
