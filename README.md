# Margarita Sun · 0 Grados — sitio del QR

Sitio en React + Vite: botella 3D (Three.js), fondo animado (WebGL), animaciones
de texto (Motion + GSAP), versión ES / 日本語 y un **Estudio** para crear anuncios.

## Correr en tu compu
```bash
npm install
npm run dev        # abre http://localhost:5173
```

## Subir a Vercel (gratis)
1. Sube esta carpeta a un repositorio nuevo de GitHub (por ejemplo `margaritasun-0grados`).
2. En vercel.com → **Add New → Project** → importa el repositorio.
3. Vercel detecta Vite solo (Build: `npm run build`, Output: `dist`). Clic en **Deploy**.
4. Si el proyecto se llama `margaritasun-0grados`, la URL será `https://margaritasun-0grados.vercel.app`.
   Si te da otra, cámbiala en `src/content.js` → `SITE.url` y vuelve a generar el QR.

## Editar textos
Todo el texto (español y japonés) está en `src/content.js`.

## Medidas reales de la botella, la caja y la tarima
Todo está en `src/bottleSpec.js` (en mm y cm). Al cambiar los números se ajustan
la botella 3D, el empaque, la tarima y el marcado de la caja (lote, pesos, etc.).

## Realidad aumentada
Los modelos están en `public/models/` (`.glb` para Android, `.usdz` para iPhone).
Si cambian medidas, colores o etiqueta: abran `/#estudio`, descarguen
**3D .glb** y **3D .usdz**, y reemplacen los archivos de `public/models/`.

## Fotos "Detrás de cámaras"
Guárdenlas en `public/fotos/` como `01.jpg` … `08.jpg` (ver `LEEME.txt` ahí).

## Usar su etiqueta real en la botella 3D
Guarden su etiqueta final como `public/etiqueta.png` (proporción 195 × 80 mm,
por ejemplo 2048 × 840 px). La botella la usará automáticamente.
Orden de las caras de izquierda a derecha: frente | lado | reverso | lado.

## QR
`qr-margarita-sun.svg` (vectorial, para imprimir) apunta a `SITE.url`.
Imprímelo de mínimo 2 × 2 cm y pruébalo sobre la botella antes de imprimir todas.
Para regenerarlo: cambia la URL en `SITE.url` y genera uno nuevo en cualquier generador de QR (nivel de corrección H).

## Abrir directo el Estudio
`https://margaritasun-0grados.vercel.app/#estudio`
