let restaurantsdb;
class IndexedDatabase {
  /**
   * Database name.
   */
  static get databaseName() { return 'restaurantApp' }
  /**
   * Current data base version.
   */
  static get currentDbVersion() { return 1 }
  /**
   * ObjectStore for restaurants.
   */
  static get restaurantsObjectStoreName() { return 'restaurants' }
  /**
   * ObjectStore for reviews.
   */
  static get reviewsObjectStoreName() { return 'reviews' }

  /**
   * ObjectStore for pending reviews.
   */
  static get pendingReviewsOSN() { return 'pendingreviews' }

  /**
   * Get all the restaurant information from IndexedDb
   */
  static getRestaurantsInformation() {
    if(!restaurantsdb) return Promise.resolve(null);
    
    return new Promise((resolve, reject) => {
      restaurantsdb.then(function(db) {
        let store = db.transaction(IndexedDatabase.restaurantsObjectStoreName, 'readonly')
                .objectStore(IndexedDatabase.restaurantsObjectStoreName);

        let request = store.getAll();
        request.onsuccess = function(event) {
          resolve(event.target.result);
        }

        request.onerror = function() {
          reject('Error getting restaurants information from IndexedDB');
        }
      });
    });
  }

  /**
   * Get all the reviews information from IndexedDb
   */
  static getReviewsInformation(id) {
    if(!restaurantsdb) return Promise.resolve(null);
    
    return new Promise((resolve, reject) => {
      restaurantsdb.then(function(db) {
        let store = db.transaction(IndexedDatabase.reviewsObjectStoreName, 'readonly')
                .objectStore(IndexedDatabase.reviewsObjectStoreName);
        let restaurantIndex = store.index('restaurant_id')

        let request = restaurantIndex.getAll(parseInt(id));
        request.onsuccess = function(event) {
          resolve(event.target.result);
        }

        request.onerror = function() {
          reject('Error getting reviews information from IndexedDB');
        }
      });
    }).then(function(data) {
      return new Promise((resolve, reject) => {
        IndexedDatabase.getPendingReviewsInformation(id)
        .then(function(pendingData) {
          let allData = data.concat(pendingData);
          resolve(allData); 
        }).catch(function(errorMessage) {
          reject(errorMessage);
        });  
      });
    });
  }

  /**
   * Get all pending reviews information from IndexedDb
   * if an restaurant id is sent, only the reviews for that
   * restaurant will be consulted
   */
  static getPendingReviewsInformation(id) {
    if(!restaurantsdb) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      restaurantsdb.then(function(db) {
        let store = db.transaction(IndexedDatabase.pendingReviewsOSN, 'readonly')
                .objectStore(IndexedDatabase.pendingReviewsOSN);
        let restaurantIndex = store.index('restaurant_id')
        
        let request;
        if(id && id > 0) {
          request = restaurantIndex.getAll(parseInt(id));
        }
        else {
          request = restaurantIndex.getAll();
        }

        request.onsuccess = function(event) {
          resolve(event.target.result);
        }

        request.onerror = function() {
          reject('Error getting pending reviews information from IndexedDB');
        }
      });
    });
  }

  /**
   * It will add information to restaurants object store that was fetched from another server
   * @param {Restaurants information to add to IndexedDB} restaurants 
   */
  static pushRestaurantsInformation(restaurants) {
    if(!restaurantsdb) return;
    restaurantsdb.then(function(db) {
      let store = db.transaction(IndexedDatabase.restaurantsObjectStoreName, 'readwrite')
                    .objectStore(IndexedDatabase.restaurantsObjectStoreName);
      for(let restaurant of restaurants) {
        store.put(restaurant);
      }
    });
  }

  /**
   * It will add information to reviews object store that was fetched from another server
   * @param {Reviews information to add to IndexedDB} reviews 
   */
  static pushReviewsInformation(reviews) {
    if(!restaurantsdb) return;
    restaurantsdb.then(function(db) {
      let store = db.transaction(IndexedDatabase.reviewsObjectStoreName, 'readwrite')
                    .objectStore(IndexedDatabase.reviewsObjectStoreName);
      for(let review of reviews) {
        store.put(review);
      }
    });
  }

  /**
   * It will add information to pending reviews object store
   * @param {Reviews information to add to IndexedDB} pendingReviews 
   */
  static pushPendingReviewsInformation(pendingReviews) {
    if(!restaurantsdb) return;
    restaurantsdb.then(function(db) {
      let store = db.transaction(IndexedDatabase.pendingReviewsOSN, 'readwrite')
                    .objectStore(IndexedDatabase.pendingReviewsOSN);
      for(let review of pendingReviews) {
        review.id = parseInt(Date.now());
        store.put(review);
      }
    });
  }

  /**
   * Clear all pending reviews from IndexedDB
   */
  static clearPendingReviews() {
    if(!restaurantsdb) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      restaurantsdb.then(function(db) {
        let store = db.transaction(IndexedDatabase.pendingReviewsOSN, 'readwrite')
                .objectStore(IndexedDatabase.pendingReviewsOSN);
        
        let request = store.clear();
        
        request.onsuccess = function() {
          resolve('Success');
        }

        request.onerror = function() {
          reject('Error clearing Pending Reviews from IndexedDB');
        }
      });
    });
  }

  /**
  * Open and Configure the database
  */
  static openAndConfigureDatabase() {
    restaurantsdb = this.openIndexedDatabase(IndexedDatabase.databaseName, 
      IndexedDatabase.currentDbVersion, function(upgradeDb) {
        upgradeDb.createObjectStore(IndexedDatabase.restaurantsObjectStoreName, {
          keyPath: 'id'
        });

        let reviewsStore = upgradeDb.createObjectStore(IndexedDatabase.reviewsObjectStoreName, {
          keyPath: 'id'
        });

        let pendingReviewsStore = upgradeDb.createObjectStore(IndexedDatabase.pendingReviewsOSN, {
          keyPath: 'id'
        });

        reviewsStore.createIndex('restaurant_id', 'restaurant_id');
        pendingReviewsStore.createIndex('restaurant_id', 'restaurant_id');
      });
  }

  /**
  * Opens a database in IndexedDb and gives a javascript promise interface to
  * handle the database later
  */
  static openIndexedDatabase(name, version, callbackFunction) {
   if(!window.indexedDB)
       return Promise.resolve(null);
 
    return new Promise(function(resolve, reject) {
      let request = indexedDB.open(name, version);
        
      request.onerror = function(error) {
        reject('Error at opening database: ' + name + ', error: ' + error);
      }

      request.onupgradeneeded = function(event) {
        callbackFunction(event.target.result);
      }

      request.onsuccess = function() {
        resolve(this.result);
      }
    });
  }
}

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/`;
  }

  /**
   * URL for restaurants.
   */
  static get RESTAURANTS_PATH() {
    return DBHelper.DATABASE_URL + 'restaurants';
  }
  
  /**
   * URL for reviews.
   */
  static get REVIEWS_PATH() {
    return DBHelper.DATABASE_URL + 'reviews';
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.RESTAURANTS_PATH)
      .then(function(response) {
        if(!response.ok)
          throw Error(response.statusText);
        return response.json();
      })
      .then(function(restaurants) {
        callback(null, restaurants);
        IndexedDatabase.pushRestaurantsInformation(restaurants);        
      })
      .catch(function(errorStatus) {
        //If there was an error fetching data from server, it will be fetched from IndexedDB
        IndexedDatabase.getRestaurantsInformation()
        .then(function(data) {
          if(!data || data.length <= 0) {
            const error = (`Request failed. Returned status of ${errorStatus}`);
            callback(error, null);
          }
          else {
            //Indicate, we are offline
            for(let eachData of data) {
              eachData.offline = true;
            }
            callback(null, data);
          }
        });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    //first fetch possible reviews for that restaurant
    DBHelper.fetchReviewsByRestaurant(id)
    .then(function(reviews) {
      //then fetch for the restaurant information
      fetch(DBHelper.RESTAURANTS_PATH + '/' + id)
      .then(function(response) {
        if(!response.ok)
          throw Error(response.statusText);
        return response.json();
      })
      .then(function(restaurant) {
        //Push restaurant information in indexeddb
        IndexedDatabase.pushRestaurantsInformation([restaurant]);
        //Add possible reviews
        if(reviews) {
          restaurant.reviews = reviews;
        }
        callback(null, restaurant);
      })
      .catch(function(errorStatus) {
        //If there was an error fetching the restaurant from server, it will be fetched from IndexedDB
        IndexedDatabase.getRestaurantsInformation()
        .then(function(data) {
          if(!data || data.length <= 0) {
            const error = (`Request failed. Returned status of ${errorStatus}`);
            callback(error, null);
          }
          else {
            const restaurant = data.find(r => r.id == id);
            //Indicate we are offline
            restaurant.offline = true;
            //Add reviews of the restaurant
            if(restaurant) {
              if(reviews) {
                restaurant.reviews = reviews;
              }
              callback(null, restaurant);
            }
            else {
              callback('Restaurant does not exist', null);
            }
          }
        });
      });
    });
  }

  /**
   * Fetch reviews by RestaurantId
   */
  static fetchReviewsByRestaurant(id) {
    return fetch(DBHelper.REVIEWS_PATH + '/?restaurant_id=' + id)
      .then(function(response) {
        if(!response.ok)
          throw Error(response.statusText);
        return response.json();
      })
      .then(function(reviews) {
        IndexedDatabase.pushReviewsInformation(reviews);
        return reviews;
      })
      .catch(function(errorStatus) {
        //If there was an error fetching data from server, it will be fetched from IndexedDB
        return IndexedDatabase.getReviewsInformation(id)
        .then(function(data) {
          if(!data || data.length <= 0) {
            return null;
          }
          else {
            return data;
          }
        });
    });
  }

  /**
   * Fetch reviews
   */
  static fetchReviews() {
    fetch(DBHelper.REVIEWS_PATH)
      .then(function(response) {
        if(response.ok)
          return response.json();
      })
      .then(function(reviews) {
        IndexedDatabase.pushReviewsInformation(reviews);
      });
  }

  /**
   * It will escape html characters
   */
  static escapeHtml(text) {
    return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
  }

  /**
   * It will create the fetch post request to send the review,
   * and will add the review locally
   */
  static sendReview(txtName,txtComment,selRating, restaurantId) {
    let data = {
      'restaurant_id': parseInt(restaurantId),
      'name': txtName.value,
      'rating': selRating.value,
      'comments': DBHelper.escapeHtml(txtComment.value)
    };

    return fetch(DBHelper.REVIEWS_PATH, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      if(!response.ok)
          throw Error(response.statusText);
        return {
          'name': txtName.value,
          'updatedAt': Date.now(),
          'rating': parseInt(selRating.value),
          'comments': DBHelper.escapeHtml(txtComment.value)
        };
    })
    .then(function(review) {
      //Get again the reviews from the restaurant to update new review
      DBHelper.fetchReviewsByRestaurant(restaurantId);
      return review;
    })
    .catch(function(errorMessage) {
      data.updatedAt = Date.now();
      data.offline = true;
      let savedData = {
        'restaurant_id': data.restaurant_id,
        'name': data.name,
        'rating': data.rating,
        'comments': data.comments,
        'updatedAt': data.updatedAt
      };
      //for any error, it will put the reviews into pending reviews object store
      IndexedDatabase.pushPendingReviewsInformation([savedData]);
      return data;
    });
  }

  /**
   * It will create the fetch put request to indicate whether
   * a restaurant is a favorite one or not.
   */
  static markRestaurantAsFavorite(restaurantId, isFavorite) {
    let strFavorite = 'false';
    if(isFavorite) {
      strFavorite = 'true';
    }

    return fetch(DBHelper.RESTAURANTS_PATH + '/' + restaurantId + '/?is_favorite=' + strFavorite, {
      method: 'PUT'
    })
    .then(function(response) {
      if(!response.ok)
          throw Error(response.statusText);
        return;
    })
    .then(function() {
      /************************ update the favorite property of the restaurant in IndexedDB
       * DBHelper.fetchReviewsByRestaurant(restaurantId);
       */
      return;
    })
    .catch(function(errorMessage) {
      /******************
       * 1. Push the put request into indexedDB
       * 2. Also update restaurants information with the newest state
      data.updatedAt = Date.now();
      data.offline = true;
      let savedData = {
        'restaurant_id': data.restaurant_id,
        'name': data.name,
        'rating': data.rating,
        'comments': data.comments,
        'updatedAt': data.updatedAt
      };
      //for any error, it will put the reviews into pending reviews object store
      IndexedDatabase.pushPendingReviewsInformation([savedData]);
       */
      return;
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name + " restaurant",
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

  /**
   * When online again, it sends pending reviews to server
   */
  static sendPendingReviews() {
    //Get all the pending reviews
    IndexedDatabase.getPendingReviewsInformation()
    .then(function(pendingReviews) {
      if(pendingReviews && pendingReviews.length > 0) {
        //Clear the pending reviews object store (to avoid duplicates)
        IndexedDatabase.clearPendingReviews()
        .then(function(message) {
          //for each review, try to post them again to the server
          for(let review of pendingReviews) {
            let newData = {
              'restaurant_id': review.restaurant_id,
              'name': review.name,
              'rating': review.rating,
              'comments': review.comments
            }

            fetch(DBHelper.REVIEWS_PATH, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(newData)
            })
            .then(function(response) {
              if(!response.ok)
                  throw Error(response.statusText);
              return;
            })
            .then(function() {
              //Get again the reviews from the restaurant to update new review
              DBHelper.fetchReviewsByRestaurant(parseInt(review.restaurant_id));
              return;
            })
            .catch(function(errorMessage) {
              //for any error, it will put the reviews into pending reviews object store again
              IndexedDatabase.pushPendingReviewsInformation([review]);
              return;
            });
          }
        });
      }
    });
  }
}