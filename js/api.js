const rarityColors = {
  common:    '#9e9e9e',
  uncommon:  '#4caf50',
  rare:      '#2196f3',
  epic:      '#9c27b0',
  legendary: '#ff9800',
  mythic:    '#ffd700',
  exotic:    '#00bcd4',
  icon:      '#71c9f8',
  dc:        '#0080ff',
  marvel:    '#e23636',
  slurp:     '#3eccbb',
  shadow:    '#4d4d6b',
  star_wars: '#ffe81f'
};

async function fetchShop() {
  try {
    const res  = await fetch('https://fortnite-api.com/v2/shop');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('[api.js] fetchShop() failed:', err.message);
    return null;
  }
}


function getItemInfo(entry) {
  const item   = entry.brItems?.[0]
               || entry.tracks?.[0]
               || entry.instruments?.[0]
               || null;
  const bundle = entry.bundle || null;

  const name     = bundle?.name
                 || item?.name
                 || 'Unknown Item';
  const desc     = item?.description          || '';
  const rarity   = item?.rarity?.value        || 'common';
  const type     = item?.type?.displayValue   || (bundle ? 'Bundle' : 'Item');
  const typeRaw  = item?.type?.value          || 'bundle';
  const set      = item?.set?.value           || '';
  const intro    = item?.introduction?.text   || '';
  const giftable = entry.giftable             || false;
  const banner   = entry.banner?.value        || null;
  const price    = entry.finalPrice           || 0;


  const img = entry.newDisplayAsset?.renderImages?.[0]?.image
            || item?.images?.featured
            || item?.images?.icon
            || bundle?.image
            || '';

  return { name, desc, rarity, type, typeRaw, set, intro, img, price, giftable, banner };
}
