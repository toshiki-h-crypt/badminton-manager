const CACHE_NAME =
"doubles-manager-v3";

const urlsToCache = [

    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"

];

self.addEventListener(
"install",
event=>{

    event.waitUntil(

        caches.open(
            CACHE_NAME
        )

        .then(cache=>{

            return cache.addAll(
                urlsToCache
            );

        })

        .then(()=>self.skipWaiting())

    );

});

self.addEventListener(
"activate",
event=>{

    event.waitUntil(

        caches.keys()

        .then(cacheNames=>Promise.all(

            cacheNames
                .filter(cacheName=>
                    cacheName.startsWith("doubles-manager-") &&
                    cacheName !== CACHE_NAME
                )
                .map(cacheName=>caches.delete(cacheName))

        ))

        .then(()=>self.clients.claim())

    );

});

self.addEventListener(
"fetch",
event=>{

    if (
        event.request.method !== "GET" ||
        new URL(event.request.url).origin !== self.location.origin
    ) {
        return;
    }

    event.respondWith(

        caches.open(CACHE_NAME)

        .then(cache=>fetch(
            new Request(
                event.request,
                { cache: "no-cache" }
            )
        )

        .then(response=>{

            if (response.ok) {
                return cache.put(
                    event.request,
                    response.clone()
                )
                .catch(()=>{})
                .then(()=>response);
            }

            return response;

        })

        .catch(()=>cache.match(event.request).then(response=>{

            if (response) {
                return response;
            }

            if (event.request.mode === "navigate") {
                return cache.match("./index.html");
            }

            return Response.error();

        })))

    );

});