// Obracanie zdjęcia o 360 stopni w prawo
const rotatingImage = document.getElementById('rotatingImage');
let angle = 0;

function rotateImage() {
    angle = (angle + 1) % 360;
    rotatingImage.style.transform = `rotate(${angle}deg)`;
    requestAnimationFrame(rotateImage);
}

// Uruchomienie animacji po załadowaniu strony
window.onload = function() {
    rotateImage();
};