# SNESvault

Emulador de Super Nintendo (SNES) en el navegador — misma estructura, funcionalidad y estética (adaptada) que [GENvault](https://genvaultapp.netlify.app/), tu emulador de Sega Mega Drive/Genesis.

Motor: [SuperNintendo.js](https://github.com/lrusso/SuperNintendo) (Snes9x 2005 transpilado a JS puro, sin WebAssembly — mismo autor y misma familia técnica que `Genesis.js`, que ya usás en GENvault).

## Estructura

```
index.html                 → página principal (2 columnas: consola | catálogo)
css/styles.css              → estilos (paleta violeta/gris SNES en vez del azul Sega)
js/SuperNintendo.min.js     → motor del emulador (vendorizado localmente — ver nota abajo)
js/app.js                   → toda la lógica de UI: carousel, controles, teclado, gamepad
js/gamepad-mappings.js      → mapeo especial para tu 8BitDo M30 (adaptado a botones SNES)
data/games.json             → catálogo de ROMs (arranca vacío — ver "Catálogo" abajo)
actualizar-portadas.html    → herramienta para autocompletar `cover` desde libretro-thumbnails
py/match_covers.py          → misma herramienta pero por CLI (Python)
py/servidor.py              → server local simple para probar el sitio (`python3 py/servidor.py`)
```

## ⚠️ Importante: el motor exige mismo origen

A diferencia de `Genesis.min.js`, el archivo `SuperNintendo.min.js` trae un chequeo de origen embebido: si el script no se sirve desde el mismo dominio que la página, tira `Error. This emulator cannot be used from a different origin.` Por eso ya viene vendorizado en `js/` (no un link a un CDN externo) — no lo muevas fuera del repo ni lo sirvas desde otro subdominio.

## Catálogo de ROMs

`data/games.json` arranca como un array vacío (`[]`) a propósito: no incluí ROMs de juegos comerciales de SNES en la entrega — son archivos con copyright de Nintendo, igual que los de Genesis lo son de Sega, y esa parte del catálogo la armás vos con tus propios archivos, tal como ya hacés en GENvault.

Cuando quieras cargar tu catálogo, cada entrada sigue el mismo formato que en GENvault:

```json
{
  "id": "supermetroid",
  "name": "Super Metroid",
  "region": "🇺🇸",
  "cover": "https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Super%20Metroid%20(USA).png",
  "url": "https://<tu-bucket>.r2.dev/projects/snesvault/Super%20Metroid.sfc"
}
```

- `url` apunta a donde vos alojes cada ROM `.sfc`/`.smc` (por ejemplo, el mismo bucket público de Cloudflare R2 que ya usás para GENvault — `pub-13140bd15eda49b4a3f35bc937ab1c58.r2.dev`, con un prefijo nuevo tipo `projects/snesvault/`). Recordá agregar `https://snesvaultapp.netlify.app` (o el dominio que uses) a los `AllowedOrigins` del CORS del bucket, sin barra final.
- `cover` es opcional: si no lo cargás, cae al ícono de cartucho placeholder. Podés autocompletarlo con `actualizar-portadas.html` (abierto vía `python3 py/servidor.py`, no con doble click) o con `python3 py/match_covers.py`, ambos ya apuntando a la carpeta correcta de portadas SNES en `libretro-thumbnails` (`Nintendo - Super Nintendo Entertainment System`).

## Controles

- **Teclado** — D-Pad con flechas; botones por default `A:W B:Q X:S Y:A L:Z R:X Start:Enter Select:ShiftDer` (son los defaults de fábrica de SuperNintendo.js). Todo editable desde "Ver Controles" → guardado en `localStorage` (`snesvault_keymap`).
- **Gamepad** — mapeo estándar (Standard Gamepad API) por default, también editable y guardado en `localStorage` (`snesvault_gpmap`).
- **8BitDo M30** — `js/gamepad-mappings.js` lo detecta por vendor/product ID y lo traduce directo a teclado, usando sus hombros físicos L/R para los hombros SNES.

## Deploy

Mismo flujo que GENvault: repo en GitHub + deploy en Netlify apuntando a la raíz. No hace falta build step, es sitio estático.

## Licencia / atribución

`SuperNintendo.js` es un fork de [snes9x2005-wasm](https://github.com/lrusso/snes9x2005-wasm) por lrusso, transpilado a JS pre-ES2015 (sin WASM), a su vez basado en Snes9x. El repo no trae un archivo `LICENSE` explícito — mismo estado que `Genesis.js` (basado en PicoDrive) que ya venís usando en GENvault, así que es la misma decisión/riesgo que ya tomaste ahí, aplicada acá.
