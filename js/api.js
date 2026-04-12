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
               || entry.brItems?.[1]?.name
               || entry.tracks?.[0]?.title
               || 'Shop Item';
  const desc     = item?.description          || '';
  const rarity   = item?.rarity?.value
               || entry.brItems?.[1]?.rarity?.value
               || 'common';
  const type = item?.type?.displayValue
           || (bundle ? 'Bundle' : null)
           || entry.brItems?.[1]?.type?.displayValue
           || (entry.tracks?.[0] ? 'Music' : 'Item');
  const typeRaw  = item?.type?.value
               || entry.brItems?.[1]?.type?.value
               || 'bundle';
  const set      = item?.set?.value           || '';
  const intro    = item?.introduction?.text   || '';
  const giftable = entry.giftable             || false;
  const banner   = entry.banner?.value        || null;
  const price    = entry.finalPrice           || 0;


  const img = entry.newDisplayAsset?.renderImages?.[0]?.image
          || entry.newDisplayAsset?.renderImages?.[1]?.image
          || item?.images?.featured
          || item?.images?.icon
          || item?.images?.smallIcon
          || bundle?.image
          || entry.brItems?.[1]?.images?.featured
          || entry.brItems?.[1]?.images?.icon
          || entry.tracks?.[0]?.albumArt
          || entry.tracks?.[0]?.images?.coverArt
          || entry.tracks?.[0]?.images?.featured
          || entry.tracks?.[0]?.coverArtImage
          || '';

  return { name, desc, rarity, type, typeRaw, set, intro, img, price, giftable, banner };
}
