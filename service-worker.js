/* =====================================================
   Badminton Doubles Manager
   Service Worker
   ===================================================== */

const CACHE_NAME =
    "badminton-manager-v1";

const CACHE_FILES = [

    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"

];

/* =====================================================
   Install
   ===================================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )

            .then(cache => {

                return cache.addAll(
                    CACHE_FILES
                );

            })

        );

        self.skipWaiting();

    }
);

/* =====================================================
   Activate
   ===================================================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()

            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if(
                            key !== CACHE_NAME
                        ){

                            return caches.delete(
                                key
                            );

                        }

                    })

                );

            })

        );

        self.clients.claim();

    }
);

/* =====================================================
   Fetch
   ===================================================== */

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            )

            .then(response => {

                if(response){

                    return response;

                }

                return fetch(
                    event.request
                );

            })

        );

    }
);
