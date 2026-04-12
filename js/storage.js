async function saveToWishlist(uid, itemData, itemId) {
  try {
    await db
      .collection('wishlists')
      .doc(uid)
      .collection('items')
      .doc(itemId)
      .set({
        id:      itemId,
        name:    itemData.name,
        img:     itemData.img,
        rarity:  itemData.rarity,
        type:    itemData.type,
        set:     itemData.set   || '',
        price:   itemData.price || 0,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
  } catch (err) {
    console.error('[storage.js] saveToWishlist failed:', err);
  }
}


async function removeFromWishlist(uid, itemId) {
  try {
    await db
      .collection('wishlists')
      .doc(uid)
      .collection('items')
      .doc(itemId)
      .delete();
  } catch (err) {
    console.error('[storage.js] removeFromWishlist failed:', err);
  }
}


async function getWishlist(uid) {
  try {
    const snap = await db
      .collection('wishlists')
      .doc(uid)
      .collection('items')
      .orderBy('savedAt', 'desc')
      .get();
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('[storage.js] getWishlist failed:', err);
    return [];
  }
}

async function isWishlisted(itemId) {
  const user = auth.currentUser;
  if (!user) return false;
  try {
    const doc = await db
      .collection('wishlists')
      .doc(user.uid)
      .collection('items')
      .doc(itemId)
      .get();
    return doc.exists;
  } catch {
    return false;
  }
}


async function toggleWishlist(itemData, itemId) {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  const already = await isWishlisted(itemId);
  if (already) {
    await removeFromWishlist(user.uid, itemId);
  } else {
    await saveToWishlist(user.uid, itemData, itemId);
  }
}


async function postComment(itemId, itemName, text) {
  const user = auth.currentUser;
  if (!user || !text.trim()) return;
  try {
    await db.collection('comments').add({
      itemId,
      itemName:  itemName || itemId,
      text:      text.trim(),
      username:  user.displayName || user.email.split('@')[0],
      uid:       user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error('[storage.js] postComment failed:', err);
  }
}

async function loadComments(itemId) {
  const listEl = document.getElementById('comments-list');
  if (!listEl) return;
  await _renderCommentsInto(itemId, listEl);
}

async function loadCommentsInto(itemId, listEl) {
  if (!listEl) return;
  await _renderCommentsInto(itemId, listEl);
}

async function _renderCommentsInto(itemId, listEl) {
  listEl.innerHTML = '<p class="muted-text">Loading reviews…</p>';
  try {
    const snap = await db
      .collection('comments')
      .where('itemId', '==', itemId)
      .orderBy('createdAt', 'desc')
      .get();

    if (snap.empty) {
      listEl.innerHTML = '<p class="muted-text">No reviews yet — be the first!</p>';
      return;
    }

    listEl.innerHTML = '';
    snap.docs.forEach(doc => {
      const data = doc.data();
      const d    = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      const div  = document.createElement('div');
      div.className = 'comment-card';
      
      div.innerHTML = `
        <div class="comment-header">
          <span class="comment-user">${data.username}</span>
          <span class="comment-date">${d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</span>
        </div>
        <p class="comment-text">${data.text}</p>`;
      listEl.appendChild(div);
    });
  } catch (err) {
    console.error('[storage.js] loadComments failed:', err);
    listEl.innerHTML = '<p class="muted-text">Could not load reviews.</p>';
  }
}


async function getUserReviews(uid) {
  try {
    const snap = await db
      .collection('comments')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[storage.js] getUserReviews failed:', err);
    return [];
  }
}

async function deleteComment(commentId) {
  try {
    await db.collection('comments').doc(commentId).delete();
  } catch (err) {
    console.error('[storage.js] deleteComment failed:', err);
  }
}
