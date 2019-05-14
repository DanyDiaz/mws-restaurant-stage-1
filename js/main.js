let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initIndexedDB();
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
  registerServiceWorker();
  fetchAndSaveReviews();
  addEventsForElements();
});

/**
 * Defines several events for the html elements
 */
addEventsForElements = () => {
  let btnIgnore = document.getElementById('btnIgnore');

  //Add click event for ignore button
  if(btnIgnore) {
    btnIgnore.addEventListener('click', function() {
      hideOfflineNotification();
    });
  }
}
/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token=sk.eyJ1IjoiZGFueWRpYXoiLCJhIjoiY2pxcTJ1dmptMDgxODQzbHB2bDk2dzJneCJ9.KEjkkpXABSLv90wwi5fKuw', {
    mapboxToken: 'sk.eyJ1IjoiZGFueWRpYXoiLCJhIjoiY2pxcTJ1dmptMDgxODQzbHB2bDk2dzJneCJ9.KEjkkpXABSLv90wwi5fKuw',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  changeKeyboardBehaviorForMap();

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
  * Improve keyboard handling for the leaflet map
  */
changeKeyboardBehaviorForMap = () => {
  //Remove key handling for map div
  const map = document.getElementById('map');
  map.setAttribute('tabindex', '-1');
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      if(restaurants && restaurants.length > 0 && restaurants[0].offline) {
        showOfflineNotification();
      } else if(restaurants && restaurants.length > 0) {
        //Send possible pending reviews
        DBHelper.sendPendingReviews();
        //Hide "offline" notification
        hideOfflineNotification();
      }
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Shows offline notification
 */
showOfflineNotification = () => {
  document.getElementById('notification').style.display = 'flex';
}

/**
 * Hides offline notification
 */
hideOfflineNotification = () => {
  document.getElementById('notification').style.display = 'none';
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
  addRolesToMarkers();
}

/**
  * Add ARIA roles to map markers
  */
addRolesToMarkers = () => {
  var mapImages = document.getElementsByClassName("leaflet-marker-icon");
  var i;
  for (i = 0; i < mapImages.length; i++) {
    mapImages[i].setAttribute("role", "link");
  }
}

/**
  * Create sources for a picture
  */
createSources = (sourceInfo) => {
  const source = document.createElement('source');
  source.media = sourceInfo.media;
  source.srcset = sourceInfo.srcset;
  return source;
}
/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const picture = document.createElement('picture');
  restaurant.sources.forEach(sourceInfo => {
    picture.append(createSources(sourceInfo));
  })
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.photographDescription;
  picture.append(image);
  li.append(picture);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', 'View details for ' + restaurant.name +
        ' restaurant');
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    marker.on("keypress", onKeyPressed);
    function onKeyPressed(e) {
      if(e.originalEvent.key === "Enter") {
        onClick();
      }
    }
    self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

/**
 * It will register the service worker that will cache all the assets of the
 * site.
 */
registerServiceWorker = () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service_worker.js')
    .then(function(reg) {
      console.log('ServiceWorker registration successful with scope: ', reg.scope);
    })
    .catch(function(error) {
      console.log('Error registering service worker');
    });
  }
}

/**
 * It will open a new database in indexed db
 */
initIndexedDB = () => {
  IndexedDatabase.openAndConfigureDatabase();
}

/**
 * It will fetch restaurant reviews and save it to indexedDB
 */
fetchAndSaveReviews = () => {
  DBHelper.fetchReviews();
}