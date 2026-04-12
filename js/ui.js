
function buildItemCard(entry, delay = 0) {
  
  const info = getItemInfo(entry);
  
  const rc   = rarityColors[info.rarity] || '#888';

  const card = document.createElement('div');
  card.className = 'item-card';
  card.style.setProperty('--rc', rc);
  card.style.animationDelay = `${delay * 40}ms`;
  card.dataset.type   = info.typeRaw;
  card.dataset.rarity = info.rarity;
  card.innerHTML = `
    <div class="card-img-wrap">
      <div class="rarity-stripe"></div>
      ${info.banner
        ? `<div class="card-banner ${info.banner.toLowerCase() === 'new' ? 'card-banner--new' : ''}">${info.banner}</div>`
        : ''}
      <img class="card-img"
           src="${info.img}"
           alt="${info.name}"
           loading="lazy"
           onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%230a0f1e%22/></svg>'"/>
    </div>
    <div class="card-body">
      <div class="card-type" style="color:${rc}">${info.type}</div>
      <div class="card-name">${info.name}</div>
      ${info.set ? `<div class="card-set">${info.set}</div>` : ''}
      <div class="card-footer">
        <div class="card-price">
          <img class="vbuck-sm" src="https://fortnite-api.com/images/vbuck.png" alt="V-Bucks"/>
          ${Number(info.price).toLocaleString()}
        </div>
        ${info.giftable ? '<span class="card-gift">🎁</span>' : ''}
      </div>
    </div>`;

  return card;
}



function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}



function renderStars(n) {
  if (!n) return '';
  const count = Math.round(Math.min(5, Math.max(1, n)));
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}
