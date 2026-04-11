// ============================================================
// DARI — Marketing
// File: js/storage.js
// Responsibility: ALL Firestore read/write operations for the project.
// Wishlist: save, remove, get all, check if item is saved
// Comments/Reviews: post, load into a DOM element, load user's own, delete
// The `db` and `auth` instances come from Kaedan's auth.js
// ============================================================


// ── DARI (Marketing): Save an item to the logged-in user's wishlist ──
// Saves the full item object so profile.html can display rich cards.
// itemData — flat object returned by Vasant's getItemInfo() from api.js
// itemId   — unique string key (offerId or item name)
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


// ── DARI (Marketing): Remove an item from the user's wishlist ──
// Called by the "Remove" button on profile.html
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


// ── DARI (Marketing): Get all wishlisted items for a user ──
// Returns an array of full item objects ordered newest-first.
// Called by loadWishlist() in profile.html
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


// ── DARI (Marketing): Check if a specific item is in the user's wishlist ──
// Returns true/false. Called by wishlist toggle buttons on browse.html and detail.html
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


// ── DARI (Marketing): Toggle wishlist — save if not saved, remove if saved ──
// Called by the wishlist button in browse.html modal and detail.html.
// If the user is not logged in, redirects to login.html.
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


// ── DARI (Marketing): Post a review/comment on an item ──
// itemId   — unique item key (offerId or name) used as the document grouping
// itemName — display name stored with the comment (for the "My Reviews" tab)
// text     — the review text from the textarea
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


// ── DARI (Marketing): Load comments for an item into a target DOM element ──
// Used by browse.html modal (targets #comments-list)
// and detail.html (targets #detail-comments-list via loadCommentsInto)
async function loadComments(itemId) {
  const listEl = document.getElementById('comments-list');
  if (!listEl) return;
  await _renderCommentsInto(itemId, listEl);
}

async function loadCommentsInto(itemId, listEl) {
  if (!listEl) return;
  await _renderCommentsInto(itemId, listEl);
}

// ── DARI (Marketing): Internal — query Firestore and render comment cards ──
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
      // Must show the username — examiner feedback: comments should show who wrote them
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


// ── DARI (Marketing): Get all reviews posted by a specific user ──
// Called by loadMyReviews() in profile.html for the "My Reviews" tab
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


// ── DARI (Marketing): Delete a comment by Firestore document ID ──
// Called by the "Delete" button on profile.html's My Reviews tab
async function deleteComment(commentId) {
  try {
    await db.collection('comments').doc(commentId).delete();
  } catch (err) {
    console.error('[storage.js] deleteComment failed:', err);
  }
}
