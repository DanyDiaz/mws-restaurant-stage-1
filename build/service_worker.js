var cacheName="restaurant-reviews-v1",filesToCache=["/","css/styles.css","img/1_normal_1x.jpg","img/1_normal_2x.jpg","img/1_medium_1x.jpg","img/1_medium_2x.jpg","img/1_small_1x.jpg","img/1_small_2x.jpg","img/2_normal_1x.jpg","img/2_normal_2x.jpg","img/3_normal_1x.jpg","img/3_normal_2x.jpg","img/3_medium_1x.jpg","img/3_medium_2x.jpg","img/3_small_1x.jpg","img/3_small_2x.jpg","img/4_normal_1x.jpg","img/4_normal_2x.jpg","img/4_medium_1x.jpg","img/4_medium_2x.jpg","img/4_small_1x.jpg","img/4_small_2x.jpg","img/5_normal_1x.jpg","img/5_normal_2x.jpg","img/5_medium_1x.jpg","img/5_medium_2x.jpg","img/5_small_1x.jpg","img/5_small_2x.jpg","img/6_normal_1x.jpg","img/6_normal_2x.jpg","img/6_medium_1x.jpg","img/6_medium_2x.jpg","img/6_small_1x.jpg","img/6_small_2x.jpg","img/7_normal_1x.jpg","img/7_normal_2x.jpg","img/7_medium_1x.jpg","img/7_medium_2x.jpg","img/7_small_1x.jpg","img/7_small_2x.jpg","img/8_normal_1x.jpg","img/8_normal_2x.jpg","img/8_medium_1x.jpg","img/8_medium_2x.jpg","img/9_normal_1x.jpg","img/9_normal_2x.jpg","img/9_medium_1x.jpg","img/9_medium_2x.jpg","img/10_normal_1x.jpg","img/10_normal_2x.jpg","img/10_medium_1x.jpg","img/10_medium_2x.jpg","img/10_small_1x.jpg","img/10_small_2x.jpg","js/dbhelper.js","js/main.js","js/restaurant_info.js","/restaurant.html"];self.addEventListener("install",function(m){m.waitUntil(caches.open(cacheName).then(function(m){return m.addAll(filesToCache)}))}),self.addEventListener("activate",function(m){m.waitUntil(caches.keys().then(function(m){return Promise.all(m.filter(function(m){return m.startsWith("restaurant-reviews-")&&m!=cacheName}).map(function(m){return caches.delete(m)}))}))}),self.addEventListener("fetch",function(g){var m=new URL(g.request.url),i=!1;m.origin===location.origin&&"/restaurant.html"===m.pathname&&(i=!0),g.respondWith(caches.match(g.request,{ignoreSearch:i}).then(function(m){return m||fetch(g.request).then(function(m){return m}).catch(function(m){console.log("error while fetching:"+g.request.url)})}))});