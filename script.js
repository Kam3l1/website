// Skrypt JavaScript nie jest potrzebny do animacji, 
// ponieważ wykorzystujemy animację CSS do obrotu 3D

// Można dodać interakcje, jeśli to potrzebne
document.addEventListener('DOMContentLoaded', function() {
    // Dodatkowa funkcjonalność może być dodana tutaj w przyszłości
});// Obracanie zdjęcia w prawo płynnie i nieprzerwanie, podobnie do hellfire.lol
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
