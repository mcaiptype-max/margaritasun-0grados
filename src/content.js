// ─────────────────────────────────────────────────────────────
//  TODO EL TEXTO DE LA PÁGINA VIVE AQUÍ (español / japonés).
//  Para cambiar algo, edita este archivo; no hace falta tocar
//  los componentes.
// ─────────────────────────────────────────────────────────────

export const SITE = {
  brand: 'Margarita Sun',
  company: '0 Grados',
  // URL final en Vercel (la misma que va en el QR).
  url: 'https://margaritasun-0grados.vercel.app',
  // Si colocan su etiqueta final como /public/etiqueta.png
  // (proporción 195 × 80 mm), la botella 3D la usará en lugar
  // de la etiqueta dibujada por código.
  customLabel: '/etiqueta.png',
}

// ─────────────────────────────────────────────────────────────
//  FOTOS "DETRÁS DE CÁMARAS"
//  Guarden sus fotos en /public/fotos/ con estos nombres
//  (o cambien los nombres aquí). Si una foto no existe, se
//  muestra una tarjeta de "Foto próximamente".
// ─────────────────────────────────────────────────────────────
export const GALLERY = [
  { src: '/fotos/01.jpg', es: 'Ingredientes frescos', ja: '新鮮な素材' },
  { src: '/fotos/02.jpg', es: 'Preparando la mezcla', ja: 'ミックスを準備' },
  { src: '/fotos/03.jpg', es: 'Pasteurización', ja: '加熱殺菌' },
  { src: '/fotos/04.jpg', es: 'Envasado en vidrio', ja: 'ガラス瓶に充填' },
  { src: '/fotos/05.jpg', es: 'Etiquetado', ja: 'ラベル貼り' },
  { src: '/fotos/06.jpg', es: 'Armado del exhibidor', ja: 'ディスプレイの組み立て' },
  { src: '/fotos/07.jpg', es: 'Entarimado', ja: 'パレット積み' },
  { src: '/fotos/08.jpg', es: 'El equipo 0 Grados', ja: '0 Gradosチーム' },
]

export const content = {
  es: {
    nav: { story: 'Historia', pack: 'Empaque', ritual: 'Ritual', origin: 'Origen', studio: 'Estudio' },
    hero: {
      eyebrow: 'Sin alcohol · Hecha en Puebla',
      title: 'Margarita Sun',
      subtitle: 'El amanecer de Puebla, embotellado para Japón.',
      cta: 'Descubrir',
      drag: 'Arrastra para girar',
    },
    marquee: ['0% alcohol', 'Frutos rojos', 'Talavera poblana', 'Puebla → Japón', 'Vidrio reciclable', 'Pasteurizada'],
    story: {
      kicker: 'La idea',
      text: 'Una margarita sin alcohol con jugos de naranja, frutos rojos y limón, pensada para brindar a cualquier hora. Su color recuerda al sol saliendo sobre los volcanes, y su etiqueta lleva la Talavera que pinta las calles de Puebla.',
    },
    anatomy: {
      kicker: 'El envase',
      title: 'Cada detalle tiene una razón',
      items: [
        { t: 'Vidrio', d: 'Inerte: no altera el sabor y se recicla infinitas veces sin perder calidad.' },
        { t: 'Tapa metálica', d: 'Tapa dorada de rosca que sella la bebida desde Puebla hasta tu mesa.' },
        { t: 'Etiqueta bilingüe', d: 'Español y japonés, con diseño de Talavera poblana.' },
        { t: 'Pasteurizada', d: 'Proceso térmico que cuida la frescura sin conservadores de más.' },
      ],
    },
    ingredients: {
      kicker: 'Dentro de la botella',
      title: 'Pocos ingredientes, mucho sabor',
      items: [
        { k: 'orange', t: 'Naranja', d: 'Jugo de naranja: dulzor y frescura.' },
        { k: 'berry', t: 'Frutos rojos', d: 'Su color de amanecer y su sabor.' },
        { k: 'lime', t: 'Limón', d: 'La acidez clásica de una margarita.' },
        { k: 'zero', t: '0% alcohol', d: 'Pasteurizada, 250 mL. Para todas las ocasiones.' },
      ],
    },
    stats: [
      { v: 0, s: '%', l: 'alcohol' },
      { v: 100, s: '%', l: 'vidrio reciclable' },
      { v: 2, s: '', l: 'idiomas en la etiqueta' },
      { v: 12000, s: '+ km', l: 'de Puebla a Tokio' },
    ],
    ritual: {
      kicker: 'Ritual',
      title: 'Cómo disfrutarla',
      steps: [
        { t: 'Enfría', d: 'Consérvala en refrigeración, entre 0 y 10 °C.' },
        { t: 'Agita', d: 'Agita suavemente la botella antes de abrir.' },
        { t: 'Sirve', d: 'En copa, sobre hielo.' },
        { t: 'Decora', d: 'Con frutos rojos deshidratados. ¡Salud!' },
      ],
    },
    origin: {
      kicker: 'Origen',
      title: 'De Puebla a Japón',
      text: 'Sale en camión de Puebla al puerto de Manzanillo y cruza el Pacífico en buque hasta Yokohama, la puerta de entrada a Tokio.',
      from: 'Puebla',
      port: 'Puerto de Manzanillo',
      arrive: 'Puerto de Yokohama',
      to: 'Tokio',
      legs: [
        { k: 'truck', t: 'Por carretera', v: '≈ 870 km', d: 'Puebla → Manzanillo · ~10 h' },
        { k: 'ship', t: 'Por mar', v: '≈ 11,200 km', d: 'Manzanillo → Yokohama · ~16 días' },
        { k: 'pin', t: 'Destino', v: 'Tokio', d: 'Vía Yokohama · ~30 km' },
      ],
      note: 'Ruta aproximada. Tiempos de referencia de servicios directos Manzanillo–Yokohama.',
    },
    green: {
      kicker: 'Sustentable',
      title: 'Pensada para volver a empezar',
      items: [
        { t: 'Vidrio', d: 'Enjuaga la botella y deposítala en vidrio. En Japón va en la recolección de botellas (びん).' },
        { t: 'Tapa', d: 'Retírala y sepárala del vidrio antes de reciclar.' },
        { t: 'Caja', d: 'Nuestro exhibidor es de cartón corrugado reciclable.' },
      ],
    },
    pack: {
      kicker: 'Del envase a la tarima',
      title: 'Así viaja a Japón',
      hint: 'Sigue bajando',
      stages: [
        { tag: 'Envase', t: 'La botella', d: 'Vidrio de 250 mL con tapa metálica dorada, etiqueta bilingüe español · japonés y etiqueta colgante de papel kraft.' },
        { tag: 'Empaque', t: 'Caja de cartón corrugado', d: 'Caja regular de 35 × 25 × 25 cm (medidas externas) que se arma levantando sus paredes y solapas.' },
        { tag: 'Empaque', t: '24 botellas protegidas', d: 'Separadores de cartón en cuadrícula de 6 × 4 para que el vidrio no choque entre sí.' },
        { tag: 'Marcado', t: 'Cierre y marcado', d: 'Solapas cerradas con cinta. Pictogramas ISO 780 (este lado arriba, frágil, mantener seco, 0–10 °C, estiba máx. 3) y marcas de embarque 0G · MS261111 · TOKYO · VIA YOKOHAMA · C/N 1/4.' },
        { tag: 'Embalaje', t: 'Entarimado', d: '4 cajas en arreglo de molinete sobre una tarima de 65 × 65 cm tratada según NIMF 15; solo una va llena y el hueco central lleva papel kraft como relleno.' },
        { tag: 'Protección', t: 'Esquineros', d: 'Protegen las aristas de las cajas y reparten la presión del fleje.' },
        { tag: 'Sujeción', t: 'Fleje', d: 'Cintas de polipropileno que aseguran las cajas a la tarima.' },
        { tag: 'Listo para exportar', t: 'Playo', d: 'Película estirable que envuelve la carga, la protege del polvo y la humedad y la mantiene estable.' },
      ],
    },
    ar: {
      kicker: 'Realidad aumentada',
      title: 'Ponla en tu mesa',
      text: 'Abre la cámara de tu celular y mira Margarita Sun a tamaño real sobre cualquier superficie.',
      cta: 'Ver en mi espacio',
      desktop: 'Abre esta página en tu celular para verla en realidad aumentada. Aquí puedes girarla con el mouse.',
      download: 'Descargar modelo 3D (.glb)',
      loading: 'Cargando 3D…',
      unsupported: 'Este navegador no abre realidad aumentada. En iPhone usa Safari; en Android usa Chrome con la app “Servicios de Google Play para RA” instalada.',
      hint: 'Tip: en iPhone ábrela en Safari y en Android en Chrome para ver la botella en tu mesa.',
      failed: 'No se pudo abrir la cámara. En Android instala “Servicios de Google Play para RA” desde Play Store; en iPhone abre la página en Safari.',
      loadError: 'No se pudo cargar el visor 3D. Revisa tu conexión e intenta de nuevo.',
    },
    bts: {
      kicker: 'Detrás de cámaras',
      title: 'Hecho a mano en Puebla',
      text: 'Así preparamos, envasamos y etiquetamos cada botella.',
      soon: 'Foto próximamente',
    },
    ritualFx: 'Toca para decorar',
    studio: {
      kicker: 'Estudio',
      title: 'Crea tu propio anuncio',
      text: 'Gira la botella digital, elige un fondo y descarga la imagen para redes.',
      cta: 'Abrir estudio',
      back: '← Volver',
      bg: 'Fondo',
      format: 'Formato',
      text_on: 'Texto',
      download: 'Descargar imagen',
      reset: 'Centrar',
      tagline: 'El amanecer, sin alcohol.',
      bgs: { sunrise: 'Amanecer', talavera: 'Talavera', night: 'Noche', cream: 'Crema' },
    },
    footer: {
      made: 'Proyecto académico de Envase y Embalaje · BUAP',
      by: 'Una marca de',
    },
  },

  ja: {
    nav: { story: 'ストーリー', pack: '梱包', ritual: '楽しみ方', origin: '産地', studio: 'スタジオ' },
    hero: {
      eyebrow: 'ノンアルコール · メキシコ・プエブラ産',
      title: 'Margarita Sun',
      subtitle: 'プエブラの朝日を、日本へ。',
      cta: 'もっと見る',
      drag: 'ドラッグして回転',
    },
    marquee: ['アルコール0%', 'ベリー', 'プエブラのタラベラ焼き', 'プエブラ → 日本', 'リサイクル可能なガラス', '加熱殺菌済み'],
    story: {
      kicker: 'コンセプト',
      text: 'オレンジ・ベリー・ライムの果汁で作った、ノンアルコールのマルガリータ。いつでも乾杯できる一本です。その色は火山の向こうに昇る朝日を、ラベルはプエブラの街を彩るタラベラ焼きを表しています。',
    },
    anatomy: {
      kicker: 'ボトル',
      title: 'すべてのディテールに理由がある',
      items: [
        { t: 'ガラス', d: '味を変えず、品質を落とさずに何度でもリサイクルできます。' },
        { t: '金属キャップ', d: 'ゴールドのスクリューキャップで、プエブラから食卓までしっかり密閉。' },
        { t: '二か国語ラベル', d: 'スペイン語と日本語。タラベラ焼きのデザイン。' },
        { t: '加熱殺菌', d: '熱処理で鮮度を守ります。' },
      ],
    },
    ingredients: {
      kicker: 'ボトルの中身',
      title: 'シンプルな素材、豊かな味わい',
      items: [
        { k: 'orange', t: 'オレンジ', d: 'オレンジ果汁の甘さと爽やかさ。' },
        { k: 'berry', t: 'ベリー', d: '朝日のような色と味わい。' },
        { k: 'lime', t: 'ライム', d: 'マルガリータらしい爽やかな酸味。' },
        { k: 'zero', t: 'アルコール0%', d: '加熱殺菌・250ml。どんな場面でも。' },
      ],
    },
    stats: [
      { v: 0, s: '%', l: 'アルコール' },
      { v: 100, s: '%', l: 'リサイクル可能なガラス' },
      { v: 2, s: '', l: 'ラベルの言語' },
      { v: 12000, s: '+ km', l: 'プエブラから東京まで' },
    ],
    ritual: {
      kicker: '楽しみ方',
      title: 'おいしい飲み方',
      steps: [
        { t: '冷やす', d: '要冷蔵（0〜10 °C）。よく冷やしてどうぞ。' },
        { t: '振る', d: '開ける前にやさしく振ってください。' },
        { t: '注ぐ', d: '氷を入れたグラスに注いで。' },
        { t: '飾る', d: 'ドライベリーを添えて。乾杯！' },
      ],
    },
    origin: {
      kicker: '産地',
      title: 'プエブラから日本へ',
      text: 'プエブラからトラックでマンサニージョ港へ。そこから船で太平洋を渡り、東京の玄関口・横浜港へ。',
      from: 'プエブラ',
      port: 'マンサニージョ港',
      arrive: '横浜港',
      to: '東京',
      legs: [
        { k: 'truck', t: '陸路', v: '約870 km', d: 'プエブラ → マンサニージョ · 約10時間' },
        { k: 'ship', t: '海路', v: '約11,200 km', d: 'マンサニージョ → 横浜 · 約16日' },
        { k: 'pin', t: '目的地', v: '東京', d: '横浜経由 · 約30 km' },
      ],
      note: 'ルートはおおよそです。所要時間はマンサニージョ–横浜直行便の目安です。',
    },
    green: {
      kicker: 'サステナブル',
      title: 'もう一度、はじまるために',
      items: [
        { t: 'びん', d: '中を軽くすすいで、「びん」の日に出してください。' },
        { t: 'キャップ', d: 'リサイクルの前に外して、分けて出してください。' },
        { t: '箱', d: 'ディスプレイ箱はリサイクル可能な段ボールです。' },
      ],
    },
    pack: {
      kicker: 'ボトルからパレットへ',
      title: '日本への旅',
      hint: 'スクロールして続きを見る',
      stages: [
        { tag: '容器', t: 'ボトル', d: '250mlのガラス瓶、ゴールドの金属キャップ、二か国語ラベルとクラフト紙のタグ。' },
        { tag: '包装', t: '段ボールケース', d: '外寸35 × 25 × 25 cmの段ボールケース。側面とフラップを起こして組み立てます。' },
        { tag: '包装', t: '24本をしっかり保護', d: '6 × 4の段ボール仕切りで、瓶同士がぶつかりません。' },
        { tag: 'ケースマーク', t: '封かんと表示', d: 'フラップをテープで封かん。取扱い表示（ISO 780：天地無用・割れ物注意・水濡れ防止・0〜10 °C・3段積みまで）と荷印 0G · MS261111 · TOKYO · VIA YOKOHAMA · C/N 1/4。' },
        { tag: '梱包', t: 'パレット積み', d: 'ISPM 15処理済みの65 × 65 cmパレットにピンホイール積みで4ケース。中身入りは1ケースのみ、中央のすき間にはクラフト紙の緩衝材。' },
        { tag: '保護', t: 'コーナーガード', d: 'ケースの角を守り、バンドの圧力を分散します。' },
        { tag: '固定', t: 'PPバンド', d: 'ポリプロピレンのバンドでケースをパレットに固定。' },
        { tag: '輸出準備完了', t: 'ストレッチフィルム', d: '荷物を包み、ほこりや湿気から守り、荷崩れを防ぎます。' },
      ],
    },
    ar: {
      kicker: 'AR',
      title: 'テーブルの上に置いてみよう',
      text: 'スマートフォンのカメラで、実物大のMargarita Sunをどこにでも。',
      cta: 'ARで見る',
      desktop: 'ARはスマートフォンでこのページを開いてご覧ください。ここではマウスで回転できます。',
      download: '3Dモデルをダウンロード (.glb)',
      loading: '3Dを読み込み中…',
      unsupported: 'このブラウザはARに対応していません。iPhoneはSafari、AndroidはChrome（「Google Play開発者サービス（AR）」が必要）でお試しください。',
      hint: 'ヒント：iPhoneはSafari、AndroidはChromeで開くと、テーブルの上にボトルを置けます。',
      failed: 'カメラを起動できませんでした。Androidは「Google Play開発者サービス（AR）」をインストール、iPhoneはSafariで開いてください。',
      loadError: '3Dビューアを読み込めませんでした。接続を確認してもう一度お試しください。',
    },
    bts: {
      kicker: 'メイキング',
      title: 'プエブラで手づくり',
      text: '一本一本、こうして作り、詰め、ラベルを貼っています。',
      soon: '写真は近日公開',
    },
    ritualFx: 'タップしてベリーを飾る',
    studio: {
      kicker: 'スタジオ',
      title: 'オリジナル広告をつくろう',
      text: 'デジタルボトルを回して背景を選び、SNS用の画像をダウンロード。',
      cta: 'スタジオを開く',
      back: '← 戻る',
      bg: '背景',
      format: 'サイズ',
      text_on: 'テキスト',
      download: '画像をダウンロード',
      reset: '中央に戻す',
      tagline: '朝日を、ノンアルコールで。',
      bgs: { sunrise: '朝日', talavera: 'タラベラ', night: '夜', cream: 'クリーム' },
    },
    footer: {
      made: 'BUAP「包装・梱包」授業の学生プロジェクト',
      by: 'ブランド',
    },
  },
}
