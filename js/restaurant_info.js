let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initIndexedDB();
  initMap();
  registerServiceWorker();
  addEventsForElements();
});

/**
 * Defines several events for the html elements
 */
addEventsForElements = () => {
  let sendButton = document.getElementById('butSend');
  let txtName = document.getElementById('txtUserName');
  let txtComment = document.getElementById('txtComment');
  let lblName = document.getElementById('lblEnterName');
  let lblComment = document.getElementById('lblEnterComment');
  let selRating = document.getElementById('sRating');
  let btnIgnore = document.getElementById('btnIgnore');
  let chkMarkFavorite = document.getElementById('chkMarkFavorite');

  //Add click event for ignore button
  if(btnIgnore) {
    btnIgnore.addEventListener('click', function() {
      hideOfflineNotification();
    });
  }
  //Add click event for ignore button
  if(chkMarkFavorite) {
    chkMarkFavorite.addEventListener('click', function() {
      let restaurantId = getParameterByName('id');
      let isFavorite = false;
      if(this.checked) {
        isFavorite = true;
      }
      DBHelper.markRestaurantAsFavorite(restaurantId, isFavorite);
    });
  }
  //Add keyup event for name text
  if(txtName) {
    txtName.addEventListener('keyup', function(event) {
      if(lblName.style.display == 'inline-block' 
        && txtName.value.trim().length > 0) {
        lblName.style.display = 'none';
      }
      this.value = this.value.replace(/[^a-zA-Z0-9 ]/g, '');
    });
  }
  //Add keyup event for comment textarea
  if(txtComment) {
    txtComment.addEventListener('keyup', function(event) {
      if(lblComment.style.display == 'inline-block' 
        && txtComment.value.trim().length > 0) {
        lblComment.style.display = 'none';
      }
    });
  }
  //Add click event for submit button
  if(sendButton) {
    sendButton.addEventListener('click', function() {
      let restaurantId = getParameterByName('id');
      if(areFieldsValid(txtName,txtComment,lblName, lblComment)) {
        const ul = document.getElementById('reviews-list');
        DBHelper.sendReview(txtName,txtComment,selRating, restaurantId)
        .then(function(review) {
          //Clear data
          txtName.value = '';
          txtComment.value = '';
          txtName.focus();
          //check if the review has "offline" property
          if(review && review.offline) {
            showOfflineNotification();
            delete review.offline;
          } else if(review) {
            //Send possible pending reviews
            DBHelper.sendPendingReviews();
            //hide "offline" notification
            hideOfflineNotification();
          }
          //Add review locally
          ul.appendChild(createReviewHTML(review));
        });
      }
    });
  }
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
 * Validates if the name and comment fields in the review were filled up properly
 */
areFieldsValid = (txtName,txtComment,lblName, lblComment) => {
  lblName.style.display = 'none';
  if(txtName.value.trim() === '') {
    txtName.value = '';
    lblName.style.display = 'inline-block';
    txtName.focus();
    return false;
  }

  lblComment.style.display = 'none';
  if(txtComment.value.trim() === '') {
    txtComment.value = '';
    lblComment.style.display = 'inline-block';
    txtComment.focus();
    return false;
  }

  return true;
}

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token=sk.eyJ1IjoiZGFueWRpYXoiLCJhIjoiY2pxcTJ1dmptMDgxODQzbHB2bDk2dzJneCJ9.KEjkkpXABSLv90wwi5fKuw', {
        mapboxToken: '<your MAPBOX API KEY HERE>',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      changeKeyboardBehaviorForMap();
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
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
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      //if we are offline, show the adequate notification
      if(restaurant && restaurant.offline) {
        showOfflineNotification();
        delete restaurant.offline;
      }
      else if(restaurant) {
        //Send possible pending reviews
        DBHelper.sendPendingReviews();
        //Hide "offline" notification
        hideOfflineNotification();
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
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
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  if(restaurant.is_favorite == 'true') {
    document.getElementById('chkMarkFavorite').checked = true;
  }

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const picture = document.getElementById('restaurant-picture');
  restaurant.sources.forEach(sourceInfo => {
    picture.append(createSources(sourceInfo));
  })
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.photographDescription;
  image.remove();
  picture.append(image);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('h4');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  const aDate = new Date(review.updatedAt)
  date.innerHTML = aDate.toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = '/restaurant.html?id=' + restaurant.id;
  a.innerHTML = restaurant.name;
  a.setAttribute('aria-current', 'page');
  li.appendChild(a);
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

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