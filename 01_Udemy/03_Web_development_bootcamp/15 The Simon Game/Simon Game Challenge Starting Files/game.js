// alert("alarm!");

gamePattern = [];

function nextSequence() {
   
    randomNumber1 = Math.random() * 4;
    randomNumber1 = Math.floor(randomNumber1);

    return randomNumber1;
}

const buttonCollors = ["red", "blue", "green", "yellow"];

var co

var randomChosenColour = buttonCollors[nextSequence()];

gamePattern.push(randomChosenColour);

$('#green').css("background-color", "grey");

// $(document).ready(function(){
//     $("#green").hover(function() {
//         $(this).css("background-color", "grey");},
//         function() {
//             $(this).css("background-color", "green");
//             })
//     });

//$('#randomChosenColor').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);

//$('#district').css({opacity: 0});