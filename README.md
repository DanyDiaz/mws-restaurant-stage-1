# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 2

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage Two**, you will take the responsive, accessible design you built in Stage One and connect it to an external server. You’ll begin by using asynchronous JavaScript to request JSON data from the server. You’ll store data received from the server in an offline database using IndexedDB, which will create an app shell architecture. Finally, you’ll work to optimize your site to meet performance benchmarks, which you’ll test using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

### How to set up this project?

1. Before setting up this project, set up the restaurants information API server from [this repository](https://github.com/DanyDiaz/mws-restaurant-stage-2). Follow the instructions in the README file of that repository.
2. Clone this repository in your computer (git clone https://github.com/DanyDiaz/mws-restaurant-stage-1.git).
3. Inside the **build** folder in the reposity, start up a simple HTTP server to serve up the site files on your local computer. For example, Python has some simple tools to do this, and you don't even need to know Python. It can be already installed on your computer.
    * In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python -m http.server 8000`. If you don't have Python installed, navigate to [Python's website](https://www.python.org/downloads/) to download and install the software.
   * Note -  For Windows systems, Python 3.x is installed as `python` by default. To start a Python 3.x server, you can simply enter `python -m http.server 8000`.
4. With your server running, visit the site: `http://localhost:8000`

### Specification

You will be provided code for a Node development server and a README for getting the server up and running locally on your computer. The README will also contain the API you will need to make JSON requests to the server. Once you have the server up, you will begin the work of improving your **Stage One** project code.

The core functionality of the application will not change for this stage. Only the source of the data will change. You will use the `fetch()` API to make requests to the server to populate the content of your Restaurant Reviews app

### Requirements
**Use server data instead of local memory** In the first version of the application, all of the data for the restaurants was stored in the local application. You will need to change this behavior so that you are pulling all of your data from the server instead, and using the response data to generate the restaurant information on the main page and the detail page.

**Use IndexedDB to cache JSON responses** In order to maintain offline use with the development server you will need to update the service worker to store the JSON received by your requests using the IndexedDB API. As with **Stage One**, any page that has been visited by the user should be available offline, with data pulled from the shell database.

**Meet the minimum performance requirements** Once you have your app working with the server and working in offline mode, you’ll need to measure your site performance using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

Lighthouse measures performance in four areas, but your review will focus on three:

 - **Progressive Web App** score should be at 90 or better.
 - **Performance** score should be at 70 or better.
 - **Accessibility** score should be at 90 or better.

You can audit your site's performance with Lighthouse by using the Audit tab of Chrome Dev Tools.

### Project Rubric

Your project will be evaluated by a Udacity code reviewer according to the [Restaurant Reviews: Stage 2 rubric](https://review.udacity.com/#!/rubrics/1131/view).
