// Obracanie zdjęcia w prawo płynnie i nieprzerwanie, 
document.addEventListener('DOMContentLoaded', function() {
    const rotatingImage = document.getElementById('rotatingImage');
    let rotation = 0;
    
    function updateRotation() {
        rotation += 0.5; // Możesz dostosować prędkość zmieniając tę wartość
        rotatingImage.style.transform = `rotate(${rotation}deg)`;
        requestAnimationFrame(updateRotation);
    }
    
    updateRotation();
});
