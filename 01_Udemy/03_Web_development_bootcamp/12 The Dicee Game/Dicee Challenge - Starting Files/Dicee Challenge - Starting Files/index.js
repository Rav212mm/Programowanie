///alert('GO');

var randomNumber1 = Math.random() * 6;
    randomNumber1 = Math.floor(randomNumber1) + 1;

var sciezka1 = '';
    sciezka1 = "dice" + randomNumber1 + ".png";
    sciezka_img1 = "images/" + sciezka1;

var image_no_1 = document.querySelector("body .container .dice .img1");
    image_no_1.setAttribute("src", sciezka_img1);

var randomNumber2 = Math.random() * 6;
    randomNumber2 = Math.floor(randomNumber2) + 1;

var sciezka2 = '';
    sciezka2 = "dice" + randomNumber2 + ".png";
    sciezka_img2 = "images/" + sciezka2;

var image_no_2 = document.querySelector("body .container .dice .img2");
    image_no_2.setAttribute("src", sciezka_img2);

if (randomNumber1 > randomNumber2) {
    document.querySelector("body h1").innerHTML = "Player 1 WINS !";
}

else if (randomNumber2 > randomNumber1) {
    document.querySelector("body h1").innerHTML = "Player 2 WINS !";
}

else document.querySelector("body h1").innerHTML = "DRAW !";