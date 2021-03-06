//there is a bug where reset() is called multiple times on player2, I cannot figure it out in the time I have.
// also with that bug player 2 has a bug where it will read that the opponent is waiting for you.


// Initialize Firebase
var config = {
    apiKey: "AIzaSyB4uxXfEPiwWiqdp6pE1XhLtxPLTH0HrPM",
    authDomain: "rock-paper-scissors-eaefa.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-eaefa.firebaseio.com",
    projectId: "rock-paper-scissors-eaefa",
    storageBucket: "rock-paper-scissors-eaefa.appspot.com",
    messagingSenderId: "720021713997"
};
//this will prevent having the game progress without both players choosing
var hasBeenReset =true;
firebase.initializeApp(config);
var wins = 0;
var losses = 0;
var ties = 0;
var db = firebase.database()
var numberOfPlayers = 0;
var playerarray = ["player1", "player2"]
var players = db.ref("/players")
var otherPlayer = {}
var player1 = db.ref("/players/player1")
var player2 = db.ref("/players/player2")
var player1Assigned = false;
var player2Assigned = false;
var player1AssignedRef = db.ref("/players/player1/assigned")
var player2AssignedRef = db.ref("/players/player2/assigned")
var presenceRef
var choices = ["r", "p", "s"]
var opponentChoice = "";
var images =["Rock.png", "Paper.png", "Scissors.png"]

// this will store the local player variable.  it will include a password, username, total wins, total losses and something else, probably(at least all of that on the server, probably have current wins and losses with that too)
var localPlayer = {
    name: "",
    currentChoice: "",
    playerNumber: 0
}
player1AssignedRef.on("value", function (s) {
    player1Assigned = s.val()
})
player2AssignedRef.on("value", function (s) {
    player2Assigned = s.val()
})

// these two are so that we can get players.
player1.on("value", function (s) {
    if (localPlayer.playerNumber === 2) {
        $("#opponent").text("Your opponent is " + s.val().name)
        opponentChoice = s.val().currentChoice
        if(hasBeenReset){
            if (localPlayer.currentChoice !== "") {
                compareAnswers();
                $("#wait-text").text("")
            }
            else {
                $("#wait-text").text("opponent is waiting for you")
            }
        }else{
            hasBeenReset = true;
        }
    } else {
        if(s.val().name != localPlayer.name){
            if(s.val().name !== ""){
                $("#opponent").text("Your opponent is " + s.val().name)
            }else{
                $("#opponent").text("")
            }

        }
    }
})
player2.on("value", function (s) {
    if (localPlayer.playerNumber === 1) {
        $("#opponent").text("Your opponent is " + s.val().name)
        opponentChoice = s.val().currentChoice
        if(hasBeenReset){
            if (localPlayer.currentChoice !== "") {
                compareAnswers();
                $("#wait-text").text("")
            }
            else {
                $("#wait-text").text("opponent is waiting for you")
            }
        } else {
            hasBeenReset = true;
        }
    } else {
        if(s.val().name != localPlayer.name){
            if(s.val().name !== ""){
                $("#opponent").text("Your opponent is " + s.val().name)
            }else{
                $("#opponent").text("")
            }

        }
    }
})
$("#signin").on("submit", function (e) {
    e.preventDefault();
    localPlayer.name = $("#name").val().trim();


    if (!player1Assigned) {
        player1.set({
            assigned: true,
            name: localPlayer.name,
            currentChoice: "",
            reset: true
        })
        localPlayer.playerNumber = 1;
        createChoices()
        $("#signin").hide()
        presenceRef = db.ref("disconnectmessage")
        player1.onDisconnect().set({
            assigned: false,
            name: "",
            currentChoice: ""
        })
    }
    else if (!player2Assigned) {
        player2.set({
            name: localPlayer.name,
            currentChoice: "",
            assigned: true,
            reset: true
        })
        localPlayer.playerNumber = 2;
        createChoices()

        $("#signin").hide()
        player2.onDisconnect().set({
            assigned: false,
            name: "",
            currentChoice: ""
        })
    }
    else {
        alert("Game is already full")
    }
})


// make a function that compares answers
function compareAnswers() {
    if(hasBeenReset)
    if (localPlayer.currentChoice !== "") {
        if (localPlayer.currentChoice === 0 && opponentChoice === 2) {
            win()
        } else if (localPlayer.currentChoice > opponentChoice) {
            win()
        }
        else if (localPlayer.currentChoice === opponentChoice) {
            tie()
        }
        else {
            lose()
        }
        localPlayer.currentChoice = "";
        hasBeenReset = false;
    }
}
function win() {
    wins++
    $("#wins").text(wins)
    $("#result").text("You won!");
    reset();
}
function tie() {
    ties++
    $("#ties").text(ties)
    $("#result").text("You tied!");
    reset();
}
function lose() {
    losses++
    $("#losses").text(losses)
    $("#result").text("You lost!");
    reset()
}

function reset() {
    localPlayer.currentChoice = "";
    $("#wait-text").text("")
    if (localPlayer.playerNumber === 1) {
        player1.set({
            assigned: true,
            name: localPlayer.name,
            currentChoice: ""
        })
    }
    else {
        player2.set({
            assigned: true,
            name: localPlayer.name,
            currentChoice: ""
        })
    }
}

function createChoices() {
    choices.forEach(function (e, i) {
        var p = $("<img>").addClass("choice col-4 text-center ").attr("data-choice", i).attr("src", "assets/images/"+images[i]).text(e).attr("id", e)
        $("#choices").append(p);
    });
}


$(document).on("click", ".choice", function (e) {
    if (localPlayer.currentChoice === "") {
        if (localPlayer.playerNumber === 1) {
            var choice = $(this).attr("data-choice")
            localPlayer.currentChoice = choice;
            db.ref("/players/player1/currentChoice").set(choice);
        }
        else if (localPlayer.playerNumber === 2) {
            var choice = $(this).attr("data-choice")
            localPlayer.currentChoice = choice;
            db.ref("/players/player2/currentChoice").set(choice);
        }
        if (opponentChoice !== "") {
            compareAnswers()
        } else {
            $("#wait-text").text("Waiting for opponent")
        }
    }
})


