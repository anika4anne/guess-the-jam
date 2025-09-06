# Guess The Jam
What your project is/does (and what it's called)
- My project is guess the jam, and is basially a guessing game for songs!
Why you made your project
- I made my projects because i used to always play skribbl.io with my cousisn and i thought it would be really fun to play a guess the song game with them instead
How you made your project
- I made my projet using next.js, and t3-app for setting up the project, also i used a youtube api to get the song name and artist name from youtube videos

What you struggled with and what you learned
- Something I struggled with was getting the YouTube video to be unmuted, because due to autoplay, it would always be muted and nobody could hear the songs. So to overcome this, I added a volume up button on the bottom of the actual game, and when you click it, it unmutes the audio, and you can finally hear the game. Also i struggled with finding something that will be music, i first used spotify but no matter how much i tried the spotify would have to either be logging in to access the music or manually click play. Since it was lke embded, i couldn't cover it up bc if i covered it up, players can click the play button, so then i went for youtube music but that didn't work because youtube music doesn't have an embed thing. Hence, my last option was youtube video playlist ebded and that finally worked!!



You can clone my website with the following commands (if you want to)

git clone (https://github.com/anika4anne/guess-the-jam.git)
cd dice
npm install
npm start

Website: (https://guessthejam.space/)
Some things to know: I've got the background image for free from google (yes i've check for copyright and it's made for people to use)

Images:
Homepage
<img width="1719" height="1076" alt="image" src="https://github.com/user-attachments/assets/1ea96f83-6b34-43c8-ae84-73d47f3eea66" />
[i've spent hours on canva tryna get the bottom part to be more down bc originally it covered most of the screen]
There's a play now button for the actual game where you hear the song and guess what it is

Play Now page:
<img width="1719" height="1077" alt="image" src="https://github.com/user-attachments/assets/e60b7516-9e39-4bb5-b5f3-1bcf2c0bd25b" />
Over here you can choose which year you want to play in (only choose one year) & you can choose how many players are playing on same laptop screen
it's different because on single player mode it just asks you, but with more people each players answers are masked so nobody else can see what your tying

Here's single player mode:

<img width="1728" height="1071" alt="image" src="https://github.com/user-attachments/assets/74a02bcb-27b9-43fb-a2f5-59b7fde4d2da" />
There should be a green volume up button on the bottom, you NEED to CLICK it in order to here the music. Why? Because youtube automatically mutes autoplayed songs, so thats why you need to click that button to unmute the video

<img width="1105" height="728" alt="image" src="https://github.com/user-attachments/assets/a8db3ab8-5d4c-443e-867e-25c1a7e17af5" />

Thats what single player mode looks like when you are trying to answer 

<img width="481" height="281" alt="image" src="https://github.com/user-attachments/assets/aac02f30-f0d2-40fe-ab61-845f4c66a26b" />
it also checks whether you got it right or wrong and gives you points accordingly (i find out song names by using the youtube api)

Multiplayer on same device:
<img width="1704" height="1072" alt="image" src="https://github.com/user-attachments/assets/6932d9f1-45a8-4eaf-bc94-490117a705c8" />
you can see that the scoreboard on the bottom now has the three players
<img width="1234" height="940" alt="image" src="https://github.com/user-attachments/assets/125645b5-0fab-400d-9103-12aa6cdb4828" />
See!! Whenever you type its now masked so none of the other players can see it until everyone submits, and if you don't remeber what you typed you can always unmask it by clicking the eye
<img width="387" height="420" alt="image" src="https://github.com/user-attachments/assets/b4983aeb-287e-4abc-bfc3-f99a8612687b" />

<img width="1697" height="1068" alt="image" src="https://github.com/user-attachments/assets/92e6cfe8-d788-4b4d-879d-dc73cf59fe9b" />
When everyone answers it looks like that, if its green it means its right and red means wrong


Game completes board
<img width="1687" height="1075" alt="image" src="https://github.com/user-attachments/assets/c7b54500-5cf0-47ab-a3dd-08602d337b20" />
So (this is actually a party background off of google lol) 
anyways i've added some cool effects (confetti)
and it shows who won by gathering up the data from the scoreboard

GUESS ARTIST MODE!!!!
<img width="1716" height="1074" alt="image" src="https://github.com/user-attachments/assets/fa23b823-41ba-4a61-af4b-b4f856bc4eb8" />
You can choose which artists you want to play the game with. Anyways, so essentially what the game does is that it shows a song name ex. trouble and you have to guess who sang that song, (yes, it's multiple choice it makes a little easier for you)

<img width="1715" height="1083" alt="image" src="https://github.com/user-attachments/assets/7f387f6f-20aa-400f-8022-18aecf6b2742" />
Like this is what it looks like after you start the game, and you can press the answer and then get the points added to you

LYRICS CHALLENGE:
<img width="1715" height="1073" alt="image" src="https://github.com/user-attachments/assets/60ca2182-b15c-4d67-ba86-feafaf21b9dd" />
There will be a lyrics from a random song, and you have to guess what the next few words are
You can choose between three different modes, easy, medium, and hard

<img width="879" height="799" alt="image" src="https://github.com/user-attachments/assets/05a71ec9-726e-42a4-9e05-c79f421bce7b" />
To make it harder, you only get 10 seconds to type your answer, and if you don't compelete it in time it moves on to the next questions and you get a 0 for the one you didn't submit on time

This is how it grades you, too see if it matches with the correct answer
<img width="830" height="645" alt="image" src="https://github.com/user-attachments/assets/710c5128-40ae-424d-a279-8d7cb7069bed" />

Then this is how the results look like 
<img width="1055" height="651" alt="image" src="https://github.com/user-attachments/assets/c1122c71-ad7d-48c3-92d8-1208e60dab10" />



There's a few more stuff my website can do but it's pretty minor, but you should proabaly also know this
Before the lyrics challenege and artist button were there i used to have private rooms and it was a really cool idea. I even made a chat to guess mode like skribbl io but for guessing the song, but i needed a server for it to work. So before messing anything up in this repo i wanted to see if i could actually make a server(i've never made one ever) with my raspberry pi for my dice game, but after pulling out all nighters and trying raliways, digital ocean, render, adn a bunch of other stuff i decided it wasn't gonna happen anytime soon. And since i couldn't get the dice game to work, there was probabaly gonna be no way i could get this server to work for this game. (Also might be because i have a very old rapsberry pi and can't run pnpm or literally anything)
















