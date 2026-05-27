const CACHE = "financas-v1";
const ASSETS = [
  "/financas.html",
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"
];

// Instala e faz cache dos assets principais
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(["/financas.html"]).catch(() => {})
    )
  );
  self.skipWaiting();
});

// Limpa caches antigos
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estratégia: Network first, fallback para cache (Firebase sempre online)
self.addEventListener("fetch", e => {
  // Deixa requisições do Firebase sempre ir para a rede
  if (e.request.url.includes("firebaseio.com") ||
      e.request.url.includes("googleapis.com/identitytoolkit") ||
      e.request.url.includes("firebase")) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Salva no cache se for uma resposta válida
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
