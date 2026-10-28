/* SilverDeck — offline-tuki.
   Sovellus on yksi tiedosto ja biisit ovat IndexedDB:ssä, joten pelkkä
   sivun tallennus riittää: ilman verkkoa soitin aukeaa ja omat biisit
   soivat. Versio on välimuistin nimessä, joten uusi käännös korvaa
   vanhan eikä jää roikkumaan.  */
const CACHE = 'silverdeck-1.14.0';
const TIEDOSTOT = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(TIEDOSTOT)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  /* Sivupyyntö: verkko ensin, jotta uusi versio tulee heti käyttöön,
     mutta välimuisti vastaa kun verkkoa ei ole. */
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r)
      .then(v => { const k = v.clone(); caches.open(CACHE).then(c => c.put('./index.html', k)); return v; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(v => v || fetch(r)));
});
