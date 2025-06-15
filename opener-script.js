// Importy Firebase bez zmian

// Konfiguracja Firebase bez zmian

// Rarity tiers bez zmian

const cases = {
    glorpCase: {
        id: 'glorpCase',
        name: 'Free Glorp Case',
        price: 0,
        image: 'glorpcase/case.png', // ŚCIEŻKA BEZ PREFIKSU
        items: [
            { file: 'glorpcase/Glorp-10.png' }, // ŚCIEŻKA BEZ PREFIKSU
            { file: 'glorpcase/Glorp-Jam-15.gif', weight: 40 }, // ŚCIEŻKA BEZ PREFIKSU
            { file: 'glorpcase/Christmas-Glorp-45.png' }, // ŚCIEŻKA BEZ PREFIKSU
            { file: 'glorpcase/Glorpium-50.png', weight: 15 }, // ŚCIEŻKA BEZ PREFIKSU
        ]
    },
    testCase: {
        id: 'testCase',
        name: 'Super Test Case',
        price: 500,
        image: 'glorpcase/test-case.png', // ŚCIEŻKA BEZ PREFIKSU
        items: [
            { file: 'glorpcase/Glorp-Cheer-50.gif' }, // ŚCIEŻKA BEZ PREFIKSU
            { file: 'glorpcase/Glorp-Feet-75.gif' }, // ŚCIEŻKA BEZ PREFIKSU
            { file: 'glorpcase/Rainbow-Glorp-100.gif', weight: 5 }, // ŚCIEŻKA BEZ PREFIKSU
        ]
    }
};

// ... reszta kodu JavaScript (funkcje pomocnicze, logika Firebase, itd.) ...
// Wklej tutaj CAŁY KOD JAVASCRIPT z poprzedniej odpowiedzi, upewniając się,
// że TYLKO sekcja "const cases = { ... }" jest taka jak powyżej.
// Link do poprawnego kodu dla pewności:
// https://gist.github.com/anonymous/511c97f1f1d17d5918a994ef0f948a39

// Dla pewności, oto cała sekcja displayCases z poprawną ścieżką w linku:
function displayCases() {
    const container = document.getElementById('cases-container');
    if (!container) return;
    container.innerHTML = '';
    for (const caseId in cases) {
        const caseData = cases[caseId];
        const caseElement = document.createElement('div');
        caseElement.className = 'case-item';
        caseElement.innerHTML = `
            <img src="${caseData.image}" alt="${caseData.name}">
            <h3>${caseData.name}</h3>
            <p>${caseData.price === 0 ? 'FREE' : `${caseData.price} Glorpies`}</p>
            <!-- ŚCIEŻKA BEZ PREFIKSU -->
            <a href="glorp-case.html?case=${caseId}" class="btn">Open</a>
        `;
        container.appendChild(caseElement);
    }
}
// Upewnij się, że w Twoim kodzie JS jest ta wersja funkcji.
