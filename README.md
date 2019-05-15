# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 3

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage Three**, you will take the connected application you built in **Stage One** and **Stage Two** and add additional functionality. You will add a form to allow users to create their own reviews. If the app is offline, your form will defer updating to the remote database until a connection is established. Finally, you’ll work to optimize your site to meet even stricter performance benchmarks than the previous project, and test again using [Lighthouse](https://developers.google.com/web/tools/lighthouse/).

### How to set up this project?

1. Before setting up this project, set up the restaurants information API server from [this repository](https://github.com/DanyDiaz/mws-restaurant-stage-3). Follow the instructions in the README file of that repository.
2. Clone this repository in your computer (git clone https://github.com/DanyDiaz/mws-restaurant-stage-1.git).
3. Inside the **build** folder in the reposity, start up a simple HTTP server to serve up the site files on your local computer. For example, Python has some simple tools to do this, and you don't even need to know Python. It can be already installed on your computer.
    * In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to [Python's website](https://www.python.org/downloads/) to download and install the software.
   * Note -  For Windows systems, Python 3.x is installed as `python` by default. To start a Python 3.x server, you can simply enter `python -m http.server 8000`.
4. With your server running, visit the site: `http://localhost:8000`

### Specification

You will be provided code for an updated [Node development server](https://github.com/DanyDiaz/mws-restaurant-stage-3) and a README for getting the server up and running locally on your computer. The README will also contain the API you will need to make JSON requests to the server. Once you have the server up, you will begin the work of improving your **Stage Two** project code.

### Requirements
**Add a form to allow users to create their own reviews:** In previous versions of the application, users could only read reviews from the database. You will need to add a form that adds new reviews to the database. The form should include the user’s name, the restaurant id, the user’s rating, and whatever comments they have. Submitting the form should update the server when the user is online.

**Add functionality to defer updates until the user is connected:** If the user is not online, the app should notify the user that they are not connected, and save the users' data to submit automatically when re-connected. In this case, the review should be deferred and sent to the server when connection is re-established (but the review should still be visible locally even before it gets to the server.)

**Meet the new performance requirements:** In addition to adding new features, the performance targets you met in **Stage Two** have tightened. Using Lighthouse, you’ll need to measure your site performance against the new targets.

 - **Progressive Web App** score should be at 90 or better.
 - **Performance** score should be at **90** or better.
 - **Accessibility** score should be at 90 or better.

You can audit your site's performance with Lighthouse by using the Audit tab of Chrome Dev Tools.

### Project Rubric

Your project will be evaluated by a Udacity code reviewer according to the Restaurant Reviews: Stage 3 [rubric](https://review.udacity.com/#!/rubrics/1132/view).