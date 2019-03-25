//Cache name that the site will use
var cacheName = 'restaurant-reviews-v1';
//All the files that will be cached by the service worker
var filesToCache = [
  '/',
  'css/styles.css',
  'img/1_normal_1x.jpg', 'img/1_normal_2x.jpg', 'img/1_medium_1x.jpg',
  'img/1_medium_2x.jpg', 'img/1_small_1x.jpg', 'img/1_small_2x.jpg',
  'img/2_normal_1x.jpg', 'img/2_normal_2x.jpg',
  'img/3_normal_1x.jpg', 'img/3_normal_2x.jpg', 'img/3_medium_1x.jpg',
  'img/3_medium_2x.jpg', 'img/3_small_1x.jpg', 'img/3_small_2x.jpg',
  'img/4_normal_1x.jpg', 'img/4_normal_2x.jpg', 'img/4_medium_1x.jpg',
  'img/4_medium_2x.jpg', 'img/4_small_1x.jpg', 'img/4_small_2x.jpg',
  'img/5_normal_1x.jpg', 'img/5_normal_2x.jpg', 'img/5_medium_1x.jpg',
  'img/5_medium_2x.jpg', 'img/5_small_1x.jpg', 'img/5_small_2x.jpg',
  'img/6_normal_1x.jpg', 'img/6_normal_2x.jpg', 'img/6_medium_1x.jpg',
  'img/6_medium_2x.jpg', 'img/6_small_1x.jpg', 'img/6_small_2x.jpg',
  'img/7_normal_1x.jpg', 'img/7_normal_2x.jpg', 'img/7_medium_1x.jpg',
  'img/7_medium_2x.jpg', 'img/7_small_1x.jpg', 'img/7_small_2x.jpg',
  'img/8_normal_1x.jpg', 'img/8_normal_2x.jpg', 'img/8_medium_1x.jpg',
  'img/8_medium_2x.jpg',
  'img/9_normal_1x.jpg', 'img/9_normal_2x.jpg', 'img/9_medium_1x.jpg',
  'img/9_medium_2x.jpg',
  'img/10_normal_1x.jpg', 'img/10_normal_2x.jpg', 'img/10_medium_1x.jpg',
  'img/10_medium_2x.jpg', 'img/10_small_1x.jpg', 'img/10_small_2x.jpg',
  'img/silverware-1x.png', 'img/silverware-2x.png', 'img/silverware-3x.png',
  'img/silverware-4x.png', 'img/silverware-5x.png',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  '/restaurant.html',
  '/manifest.json'
];

/*
 * During install phase, all the files will be cached
 */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/*
 * While the service worker is being activated, the cache will be updated
 * if it is necessary
 */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(aCacheName) {
          return aCacheName.startsWith('restaurant-reviews-') &&
                 aCacheName != cacheName;
        }).map(function(aCacheName) {
          return caches.delete(aCacheName);
        })
      );
    })
  );
});

/*
 * Handling site requests in the fetch event
 */
self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);
  var ignoreQueryParameters = false;
  if(requestUrl.origin === location.origin &&
    requestUrl.pathname === "/restaurant.html") {
      ignoreQueryParameters = true;
    }
  //Check if the file requested exists in the cache first
  event.respondWith(
    caches.match(event.request, {ignoreSearch: ignoreQueryParameters})
    .then(function(response) {
      if(response) {
        return response;
      }
      else {
        return fetch(event.request)
            .then(function(res) {
              return res;
            })
            .catch(function(err) {
              console.log('error while fetching:' + event.request.url);
              return;
            });
      }
    })
  );
});
