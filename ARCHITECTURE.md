# Arquitectura del Sistema - TGames.com

Este documento describe la arquitectura y el diseño técnico de la plataforma **TGames.com**.

## 🚀 Visión General e Ideología
TGames es una plataforma de juegos web diseñada bajo la filosofía **"Llegar y Jugar"**. El objetivo es eliminar cualquier fricción entre el usuario y el contenido, permitiendo que el juego sea el protagonista absoluto.

### Principios Fundamentales
- **Cero Fricción:** Interfaz invisible y minimalista.
- **Velocidad Extrema:** Cada milisegundo cuenta. Uso de caché agresiva para acceso instantáneo a más de 20,000 títulos.
- **Soberanía Tecnológica:** Independencia de plataformas de terceros mediante un motor propio y optimizado.

---

## 🎨 Diseño y Estética
El sistema sigue un enfoque de **Minimalismo Absoluto**:
- **Paleta Binaria:** Uso exclusivo de Blanco (#FFFFFF) y Negro (#000000).
- **Contraste Puro:** Máxima legibilidad y aspecto arquitectónico.
- **Tipografía:** `Comfortaa` para la marca ("tudexgames" en minúsculas) e `Inter` para todo el resto.

---

## 🏗️ Stack Tecnológico

### Frontend
- **Framework:** [Nuxt 3](https://nuxt.com/) (Vue.js 3).
- **Estilos:** CSS Vanilla (Custom) con variables nativas.
- **Renderizado:** Enfoque en pre-renderizado e hidratación rápida para minimizar el TTFB (Time to First Byte).

### Backend (Server-side)
- **Runtime:** [Nitro](https://nitro.unjs.io/) (integrado en Nuxt).
- **Base de Datos:** MySQL para persistencia (el catálogo reside en una ubicación remota, lo que hace vital la capa de caché).
- **Caché (El Escudo):** [Redis](https://redis.io/) actúa como un "escudo de datos" entre la aplicación y la DB remota.
- **Internacionalización (i18n):** `@nuxtjs/i18n` (frontend) + tabla `translations` (backend) con soporte para 15 idiomas.

### Infraestructura
- **Contenerización:** Docker para orquestación de App + Redis.
- **PWA:** Diseño adaptativo que se comporta como una App nativa.

---

## 📡 Flujo de Datos y API

El sistema implementa el patrón **Cache-Aside**:

1.  **Solicitud:** El usuario pide un juego o lista.
2.  **Consulta Redis:** Se verifica si el contenido está en la caché local (milisegundos).
3.  **Fallback DB:** Si no está en Redis, se consulta la base de datos remota.
4.  **Hidratación:** El dato se guarda en Redis con un TTL (Time To Live) inteligente y se entrega al usuario.

### Endpoints Principales
- `/api/games`: Catálogo paginado con traducciones dinámicas.
- `/api/games/[slug]`: Detalles extendidos del juego.
- `/api/search`: Motor de búsqueda optimizado.
- `/api/interactions`: Registro de votos y vistas.

---

## ⚡ Estrategias de Rendimiento
- **Infinite Scroll:** `IntersectionObserver` para carga infinita sin recargas de página.
- **Lazy Loading:** Imágenes optimizadas con `@nuxt/image`.
- **Proxy de Assets:** Los juegos y miniaturas se sirven mediante reglas de proxy para centralizar el flujo de datos.

---

## 📂 Estructura del Proyecto
```text
├── assets/          # CSS global (Binario), Fuentes
├── components/      # Componentes UI minimalistas
├── docs/            # Manifiestos y esquemas SQL
├── i18n/            # Traducciones del sistema
├── pages/           # Rutas (Index, Game, etc.)
├── server/
│   ├── api/         # Endpoints con lógica de caché
│   └── utils/       # Conectores de DB y Redis
└── nuxt.config.ts   # Orquestación del sistema
```
