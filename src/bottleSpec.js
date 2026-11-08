// ─────────────────────────────────────────────────────────────
//  MEDIDAS REALES DE LA BOTELLA (en milímetros)
//  Botella cuadrada de vidrio de 250 mL, tapa dorada y etiqueta
//  colgante de papel kraft. Medidas estimadas a partir de las
//  fotos del producto; ajústenlas con regla si quieren exactitud.
// ─────────────────────────────────────────────────────────────
export const BOTTLE = {
  bodyWidth: 52, //        ancho de cada cara del cuerpo cuadrado
  cornerRoundness: 6, //   2 = redonda · 5 = esquinas suaves · 10 = casi recta
  bodyHeight: 128, //      de la base hasta donde empieza a angostarse (hombro)
  shoulderHeight: 24, //   altura del hombro (de cuadrado a cuello redondo)
  neckDiameter: 26, //     diámetro del cuello
  neckHeight: 26, //       alto del cuello
  lipDiameter: 27, //      diámetro de la rosca (donde enrosca la tapa)
  capDiameter: 29.5, //    diámetro de la tapa
  capHeight: 19, //        alto de la tapa
  labelBottom: 16, //      altura de la etiqueta medida desde la base
  labelHeight: 80, //      alto de la etiqueta (195 × 80 mm)
  fillLevel: 150, //       hasta dónde llega la bebida, desde la base
  hangTag: true, //        etiqueta colgante de papel kraft con cordón

  colors: {
    liquid: '#e0203f', //  color de la bebida
    cap: '#c9a246', //     tapa metálica dorada
    capDetail: '#b38c33',
  },
}

// ── Empaque y embalaje (cm) ──────────────────────────────────
export const PACK = {
  box: { l: 35, w: 25, h: 25 }, // caja de cartón corrugado, medidas externas
  grid: { cols: 6, rows: 4 }, //   botellas por caja (6 × 4 = 24) con separadores
  dividerHeight: 15, //            alto de los separadores de cartón (cm)
  pallet: { l: 65, w: 65, h: 10 }, // tarima a escala
  boxesOnPallet: 4, //             solo la primera va llena
  maxStack: 3, //                  estiba máxima indicada en la caja

  // Datos del marcado real de la caja
  marks: {
    shipping: ['0G', 'MS261111', 'TOKYO', 'VIA YOKOHAMA'], // marcas de embarque
    product: 'MARGARITA SUN · NON-ALCOHOLIC BEVERAGE',
    productJa: 'マルガリータ・サン ノンアルコール飲料',
    contents: '24 × 250 mL',
    netWeight: '6.2 KG',
    grossWeight: '13 KG',
    bestBefore: '2026.12.11',
    lot: 'MS261111',
    company: 'CERO GRADOS BEBIDAS, S.A. DE C.V. · PUEBLA, MÉXICO',
    temp: 'KEEP REFRIGERATED 0–10 °C · 要冷蔵',
  },
}
