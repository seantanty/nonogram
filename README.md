# Nonogram (app link)
Author: [Yongliang (Sean) Tan](https://seantanty.github.io/CS-5610-project1/index.html) & [Xinyi Ge](https://xinyijackiege.github.io/)\
Class Link: [Web Development](https://johnguerra.co/classes/webDevelopment_spring_2021/)
***
A nonogram playing web app for fun and web developement learning purposes.
<a href="demolink">Video demo</a>

## Table of Contents
1. [Project Objective](#project-objective)
2. [Screenshots](#screenshots)
3. [Features](#features)
4. [Technologies](#technologies)
5. [Setup](#Setup)
6. [Inspiration](#inspiration)
### Project Objective
***
This project is served as the 2nd project of Web Development course. 
It aims to create a backend application with Node + Express + Mongo and HTML5.
It should contains at least two web pages, at least 2 Mongo Collections and 1 form for interactions.
And the app is deployed by Heroku.

This project is able to play different sizes of nogograms(aka Japanese Puzzles, Kare Karala!).
It has functions including puzzle play, user authentication/authorization(register/login), leaderboards display and search puzzle/leaderboard by id.
All of them need interactions between frondend and backend, such as saving records to, and search a puzzle by puzzle id from database.  
From the project, we learn to design app functionaities, develop interactions accordingly (e.g. password, Mongo CRUD operations). 

### Screenshots
*** 
![Alt text](./images/Screenshot_play.png?raw=true "Play")
![Alt text](./images/Screenshot_user.png?raw=true "UserLogin")
![Alt text](./images/Screenshot_user1.png?raw=true "User")
![Alt text](./images/Screenshot_lb.png?raw=true "Leaderboard")

### Features
***
* There are both size and puzzle id options for users to choose a prefered puzzle.
* Playing a puzzle is user friendly, with playing instructions and features, count up timer, result alert and leaderboard display.
* Users can play without login.
* Records are atomatically saved for users after logging in to user profiles.
* Users can access to their user profiles and leaderboards of the puzzles.

### Technnogolies
* HTML5
* CSS: version 4.15
* Bootstrap: version 5.0.0-beta2
* JavaScript: version ES6
* Express: version 4.17.1
* mongodb: version 3.6.4

### Setup
***
If you would like to explore the app, install nodejs (https://nodejs.org/en/download/package-manager/)<br>
In your directory:\
$ npm install\
$ npm start\
go to localhost:3000 and enjoy!

### Inspiration
***
Part of codes for puzzle display and play are inspired by [1hella](https://github.com/1hella/html5-nonogram-game).












