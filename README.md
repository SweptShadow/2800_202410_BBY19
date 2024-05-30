# PROJECT TITLE AND TEAM
Golden Gaming

* Team Name: BBY-19 (Golden Gamers)

* Team Members: 
  - Anil Bronson: anilbronson12@gmail.com
  - Arsh Mann:    mannarsh33@gmail.com
  - Bryson Lindy: bslindy@gmail.com
  - Dil Bains:    dbainsit38@gmail.com
  - Owen Sweet:   o.sweet.work@gmail.com

## 1. Project Description
Our Group, Golden Gamer’s, are developing a web app to help seniors by integrating a simple accessible social media application with senior oriented games which will help battle boredom and maintain cognitive functions.

## 2. Project Technologies
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* Scoket.io
* Font used:  Gilroy-ExtraBold
* Adobe Stock images
* Cloudinary
* EJS, JQuery, Bootstrap
* dotenv, joi, passport
* express-session
* node.js
* mongodb

## 3. List of Files
Contents of project folder:
* Root
Top level of project folder: 
├── .git                      # Folder for git repo
├── controllers               # Folder for socket chat controller javascript
  /chatController.js          #
  /resetController.js         #
├── models                    # Folder containing modals for chat functionality
  /chatRoom.js                #
  /friendship.js              #
  /message.js                 #
  /user.js                    #
├── public                    # Public folder containing css, image, font and javascript
  ├── css
    /bingo.css
    /calendar.css
    /chat.css
    /checkersStyle.css
    /chess.css
    /games.css
    /jigsawStyle.css
    /overlay.css
    /profile.css
    /styles.css
    /sudokuStyle.css
  ├── fonts                   # Folder containing font
    /Gilroy-ExtraBold.otf     # font used
  ├── images                  # Folder for images
    ├── chessimg              # Folder for chess peice images (listing all chess peices)
    └── jigsaw                # Folder for jigsaw sample image (numbered from 0-24)
    /bingo.jpeg
    /bingo.jpg
    /cannon-shot-unscreen.gif
    /checkers.jpeg
    /defaultcat.jpg
    /defaultdog.jpg
    /defaultflower.jpg
    /eraser.png
    /favicon.ico
    /gaming_lady.png
    /gg.png
    /jigsaw.jpeg
    /logo.png
    /logo2.png
    /redo.png
    /Savannah.png
    /second-logo.jpg
    /spaceinvadershot.gif
    /stock.jpg
    /sudoku.png
    /undo.png
  └── js
    └── pieces                # Folder containing chess piece javascript for each piece
    /bingo.js                 # Bingo game script
    /bingoHubScript.js        # JS for bingo Hub page
    /calendar.js              # Calendar Javascript
    /checkersGameScript.js    # JS for checkers game script
    /checkersHubScript.js     # JS for checkers Hub page
    /chess.js                 # Chess game script
    /chessboard.js
    /friends.js
    /games.js                 # Script for main games page
    /gamesSpecific.js
    /groupScript.js           # JS for group page
    /header.js                # Script for the header
    /jigsawGameScript.js      # JS for jigsaw game
    /jigsawHubScript.js       # JS for jigsaw Hub page
    /login.js
    /profile.js
    /script.js
    /settings.js
    /signup.js
    /social.js
    /stack.js
    /sudokuGameScript.js      # JS for sudoku game
├── routes                    # Folder for routes used in chat rooms and friend requests
  /chatRoutes.js              
  /friendRoutes.js            
  /resetRoutes.js             
├── views                     # Folder containing ejs files
  ├── gameRules               # Folder containing game rules for each game which can be accessed via help button
    /bingoRules.ejs
    /checkersRules.ejs
    /chessRules.ejs
    /jigsawRules.ejs
  ├── games                   
    /chess.ejs                # Chess game main game page
  └── template                # Folder contaning templates used on all pages
    /chatOverlay.ejs          # Chat Overlay which gets imported to every page when called
    /footer.ejs               # Footer which gets imported to every page
    /header.ejs               # Header which gets imported to every page
    /viewTemplates.ejs        
  /404.ejs                    # Ejs file for 404 page
  /calendar.ejs               # Calender page
  /error.ejs                  # Error handling page
  /gameBingoHub.ejs           # Game Bingo Hub page
  /gameBingoPlay.ejs          # Game Bingo game page
  /gameCheckersHub.ejs        # Game Checkers Hub page
  /gameCheckersPlay.ejs       # Game Checkers game page
  /gameJigsawHub.ejs          # Game Jigsaw Hub page
  /gameJigsawPlay.ejs         # Game Jigsaw game page
  /games.ejs                  # main games page containing all games
  /gamesSpecific.ejs          # Refrencing specific game page path for chess
  /gameSudokuHub.ejs          # Game Sudoku Hub page
  /gameSudokuPlay.ejs         # Game Sudoku game page
  /group.ejs                  # Groups social page
  /login.ejs                  # Log in page
  /logout.ejs                 # Log out confirmation page
  /privacyPolicy.ejs          # Privacy policy page
  /profile.ejs                # Profile page
  /requestPassReset.ejs       # Request password page
  /resetPassword.ejs          # password reset confirmation page
  /room.ejs                   # Game Bingo Hub page
  /root.ejs                   # Main page
  /signup.ejs                 # Sign up page
  /social.ejs                 # Social hub page
  /termsOfService.ejs         # ToS page
├── node_modules              # Node modules used

├── package-lock.json         
├── .gitignore                # Git ignore file
├── .env                      # .env secrets file
├── about.html                # about us html file 
├── index.js                  # main index js file that opens with node
├── package.json              # package dependencies
├── README.md                 # lots of writing to follow read me
└── socket.js                 # javascript for using socket io


## 4. Installation
Instructions so a new developer can assemble a DEVELOPMENT ENVIRONMENT to contribute, including a list of tools, versions, and configuration instructions:

* .env file containing mongodb uri, google api key (production url), session secret hashing key and cloudinary secret (in accordance with notion the information is contained within the submitted file)
* mongodb used for back end database management
* socket and cloudinary for chat and image handling respectively
* set up environment:
  ->  Unpack the zip folder
  ->  Create a .env file in root folder and paste the secrets from the submitted file
  ->  open command line and npm i (should install all dependencies)

## 5. Features
Feature we currently have implemented:
* Sign up, log in, log out and basic user functionailty
* User profile with database handling information
* Default picture options for user if they do not wish to upload image
* Cloudinary used for image handling for uploaded picture
* Google sign up, to sign in with google account
* Theme modification for user prefrence (With colors oriented towards senior and elder's)
* Chat socket functionality, allowing 2 users to chat with each other via text
* Adding friends/ users via email address of users in database
* Calender functionality to set up events
* A games hub page which allows user to pick a game from 5 currently implemented ones
* A functional Chess game
* A functional Checkers game
* A functional Jigsaw game
* A functional Bingo game
* A functional Sudoku game
* A video call feature using socket io

Feature's we would like to add in the future when we have more time:
* Stat tracking for the games which saves user score into database
* Leaderboard system for the games
* Family group set up
* Invite people to the app via their email or phone number

## 6. Credits
* Adobe Stock images (Images used with student license)
* Socket io documentation
* https://socket.io/docs/v4/
* Cloudinary: https://www.youtube.com/watch?v=rZrPVI5FN-w&embeds_referring_euri=https%3A%2F%2Flearn.bcit.ca%2F&source_ve_path=MjM4NTE&feature=emb_title
* Microsoft Co-pilot for helping refactor some code https://copilot.microsoft.com/
* ChatGPT for helping code https://chat.openai.com/

## 7. Deliverable questions
* The main thing we used AI to help us in the app was for debugging and helping find broken code and help us with some coding
* We did not use Ai to create data sets or clean data sets
* We don't use any ai in our app (We planned to implement computer player logic but did not have time to figure it out)
* The main limitations we found in this project was the time we had to code as learning new things and trying to implement them took up more time than actually implementing all the features we wanted within the limited time
