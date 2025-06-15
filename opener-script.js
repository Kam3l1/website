// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// =================================================================
// YOUR FIREBASE CONFIGURATION (Zaczerpnięte z Twojego zapytania)
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyD05uuzGixPPd44HMgoUexMhqYfkP_p_Lc", // ZABEZPIECZ TEN KLUCZ W GOOGLE CLOUD!
  authDomain: "case-opening-login.firebaseapp.com",
  projectId: "case-opening-login",
  storageBucket: "case-opening-login.appspot.com", // Poprawka: usunąłem 'firebasestorage'
  messagingSenderId: "330702259311",
  appId: "1:330702259311:web:8a16ee361963cdd8f8399a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =================================================================
// GAME DATA AND CONFIGURATION
// =================================================================
let currentUser = null;
let userData = null;

// Rarity tiers based on item price
const rarityTiers = {
    common: { minPrice: 0, class: 'rarity-common' },
    uncommon: { minPrice: 40, class: 'rarity-uncommon' },
    rare: { minPrice: 70, class: 'rarity-rare' },
    epic: { minPrice: 100, class: 'rarity-epic' },
    legendary: { minPrice: 250, class: 'rarity-legendary' }, // Example for very high-value items
    mythical: { minPrice: 99, class: 'rarity-mythical' }, // A special tier for Rainbow Glorp
};

const cases = {
    glorpCase: {
        id: 'glorpCase',
        name: 'Free Glorp Case',
        price: 0,
        image: 'glorpcase/case.png',
        items: [
            { file: 'glorpcase/Glorp-10.png' }, // Auto-weight based on price
            { file: 'glorpcase/Glorp-Jam-15.gif', weight: 40 }, // Custom higher weight
            { file: 'glorpcase/Christmas-Glorp-45.png' },
            { file: 'glorpcase/Glorpium-50.png', weight: 15 },
        ]
    },
    testCase: {
        id: 'testCase',
        name: 'Super Test Case',
        price: 500,
        image: 'glorpcase/test-case.png', // Create this image
        items: [
            { file: 'glorpcase/Glorp-Cheer-50.gif' },
            { file: 'glorpcase/Glorp-Feet-75.gif' },
            { file: 'glorpcase/Rainbow-Glorp-100.gif', weight: 5 }, // Very rare
        ]
    }
};

// =================================================================
// HELPER FUNCTIONS
// =================================================================

// Parses "Item Name-Price.ext" from a file path
function parseItemInfo(filePath) {
    const fileName = filePath.split('/').pop();
    const nameAndPrice = fileName.substring(0, fileName.lastIndexOf('.'));
    const parts = nameAndPrice.split('-');
    const price = parseInt(parts.pop(), 10);
    const name = parts.join(' ');
    return { name, price, file: filePath };
}

// Determines rarity class based on price. A more robust way than drop %
// because an item's value is constant, while its drop % can change per case.
function getRarityClassByPrice(price) {
    // Special case for rainbow
    if (price === 100) return rarityTiers.mythical.class;
    
    let highestTier = 'common';
    for (const tier in rarityTiers) {
        if (price >= rarityTiers[tier].minPrice) {
            highestTier = tier;
        }
    }
    // Mythical is special, don't auto-assign it
    return rarityTiers[highestTier].class === rarityTiers.mythical.class ? rarityTiers.legendary.class : rarityTiers[highestTier].class;
}

// Calculates a default "weight" if not provided. Lower price = higher weight = more common.
function calculateDefaultWeight(price) {
    if (price === 0) return 100;
    return Math.max(1, Math.round(100 / price));
}

// =================================================================
// AUTH & USER DATA
// =================================================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            const newUserData = {
                glorpies: 1000, // Starting with more to test the paid case
                inventory: [],
                username: `user_${currentUser.uid.substring(0, 6)}`
            };
            await setDoc(userRef, newUserData);
            userData = newUserData;
        } else {
            userData = userDoc.data();
        }
        
        initializePage();
    } else {
        signInAnonymously(auth).catch((error) => console.error("Anonymous sign-in failed:", error));
    }
});

async function saveUserData() {
    if (currentUser && userData) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, userData);
    }
}

function updateBalanceUI() {
    if (!userData) return;
    const balanceElement = document.getElementById('glorpies-balance');
    if (balanceElement) {
        balanceElement.textContent = userData.glorpies;
    }
}

// =================================================================
// PAGE INITIALIZATION ROUTER
// =================================================================

function initializePage() {
    updateBalanceUI();
    if (document.body.classList.contains('case-opening-page')) {
        setupCaseOpeningPage();
    } else {
        setupMainPage();
    }
}

// =================================================================
// MAIN PAGE (case-opener.html) LOGIC
// =================================================================

function setupMainPage() {
    setupTabs();
    displayCases();
    displayInventory();
    displayLeaderboard();
}

function setupTabs() {
    document.querySelectorAll('.tab-link').forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.dataset.tab;
            document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

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
            <a href="glorp-case.html?case=${caseId}" class="btn">Open</a>
        `;
        container.appendChild(caseElement);
    }
}

function displayInventory() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!userData || userData.inventory.length === 0) {
        grid.innerHTML = '<p>Your inventory is empty. Open some cases!</p>';
        return;
    }

    userData.inventory.forEach((item, index) => {
        const rarityClass = getRarityClassByPrice(item.price);
        const itemElement = document.createElement('div');
        itemElement.className = `inventory-item ${rarityClass} ${item.locked ? 'locked' : ''}`;
        
        itemElement.innerHTML = `
            <div class="item-image-wrapper">
                <img src="${item.file}" alt="${item.name}">
            </div>
            <h4>${item.name}</h4>
            <p>Value: ${item.price} Glorpies</p>
            <div class="item-actions">
                <button class="btn sell-btn" data-index="${index}" ${item.locked ? 'disabled' : ''}>Sell</button>
                <button class="btn lock-btn" data-index="${index}">${item.locked ? 'Unlock' : 'Lock'}</button>
            </div>
        `;
        grid.appendChild(itemElement);
    });

    grid.querySelectorAll('.sell-btn').forEach(btn => btn.addEventListener('click', sellItem));
    grid.querySelectorAll('.lock-btn').forEach(btn => btn.addEventListener('click', toggleLockItem));
}

async function sellItem(event) {
    const index = parseInt(event.target.dataset.index);
    const item = userData.inventory[index];
    if (item.locked) return;

    userData.glorpies += item.price;
    userData.inventory.splice(index, 1);
    
    await saveUserData();
    updateBalanceUI();
    displayInventory();
}

async function toggleLockItem(event) {
    const index = parseInt(event.target.dataset.index);
    userData.inventory[index].locked = !userData.inventory[index].locked;
    await saveUserData();
    displayInventory();
}

async function displayLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '<p>Loading leaderboard...</p>';

    try {
        const q = query(collection(db, "users"), orderBy("glorpies", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        
        list.innerHTML = '';
        let rank = 1;
        querySnapshot.forEach(doc => {
            const user = doc.data();
            const li = document.createElement('li');
            li.textContent = `${rank}. ${user.username} - ${user.glorpies.toLocaleString()} Glorpies`;
            if (doc.id === currentUser.uid) {
                li.style.fontWeight = 'bold';
                li.style.color = 'var(--accent-color)';
            }
            list.appendChild(li);
            rank++;
        });
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        list.innerHTML = '<p>Could not load leaderboard.</p>';
    }
}


// =================================================================
// CASE OPENING PAGE (glorp-case.html) LOGIC
// =================================================================

function setupCaseOpeningPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const caseId = urlParams.get('case');
    const caseData = cases[caseId];

    if (!caseData) {
        document.body.innerHTML = '<h1>Case not found!</h1><a href="case-opener.html">Go back</a>';
        return;
    }

    document.getElementById('case-name-header').textContent = `Opening: ${caseData.name}`;
    const openBtn = document.getElementById('open-case-btn');
    openBtn.textContent = `Open (${caseData.price === 0 ? 'FREE' : `${caseData.price} Glorpies`})`;
    openBtn.addEventListener('click', () => openCase(caseData));
}

function getRandomItem(caseData) {
    // First, process items to get full info and ensure they have a weight
    const processedItems = caseData.items.map(item => {
        const info = parseItemInfo(item.file);
        const weight = item.weight || calculateDefaultWeight(info.price);
        return { ...info, weight };
    });

    const totalWeight = processedItems.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of processedItems) {
        if (random < item.weight) {
            return item;
        }
        random -= item.weight;
    }
}

async function openCase(caseData) {
    const openBtn = document.getElementById('open-case-btn');
    if (openBtn.disabled) return;
    
    if (userData.glorpies < caseData.price) {
        alert("Not enough Glorpies!");
        return;
    }

    openBtn.disabled = true;
    openBtn.textContent = 'Opening...';

    // Deduct price and update UI immediately
    userData.glorpies -= caseData.price;
    updateBalanceUI();
    
    const rouletteStrip = document.getElementById('roulette-strip');
    rouletteStrip.innerHTML = '';
    rouletteStrip.classList.remove('animate');
    rouletteStrip.style.transform = 'translateX(0)';

    const ROULETTE_LENGTH = 50;
    const WINNING_INDEX = ROULETTE_LENGTH - 4; // Stop on the 4th item from the end
    
    let stripItems = [];
    for (let i = 0; i < ROULETTE_LENGTH; i++) {
        const itemInfo = getRandomItem(caseData);
        stripItems.push(itemInfo);
        
        const itemElement = document.createElement('div');
        itemElement.className = `roulette-item`;
        itemElement.innerHTML = `<img src="${itemInfo.file}" alt="${itemInfo.name}">`;
        rouletteStrip.appendChild(itemElement);
    }
    
    const winningItem = stripItems[WINNING_INDEX];

    // Wait for the browser to render the strip before animating
    await new Promise(resolve => setTimeout(resolve, 100));

    const itemWidth = 150; // As defined in CSS
    const containerWidth = rouletteStrip.parentElement.offsetWidth;
    const randomOffset = (Math.random() - 0.5) * (itemWidth * 0.8);
    const finalPosition = -(WINNING_INDEX * itemWidth - containerWidth / 2 + itemWidth / 2 - randomOffset);
    
    rouletteStrip.classList.add('animate');
    rouletteStrip.style.transform = `translateX(${finalPosition}px)`;

    setTimeout(async () => {
        userData.inventory.push({
            name: winningItem.name,
            price: winningItem.price,
            file: winningItem.file,
            locked: false
        });
        
        await saveUserData();
        
        const resultWrapper = document.getElementById('result-item-wrapper');
        const rarityClass = getRarityClassByPrice(winningItem.price);
        resultWrapper.className = `inventory-item ${rarityClass}`; // Reuse inventory-item class for consistency
        resultWrapper.innerHTML = `<img src="${winningItem.file}" alt="${winningItem.name}">`;
        
        document.getElementById('result-item-name').textContent = winningItem.name;
        document.getElementById('result-display').style.display = 'block';
        openBtn.style.display = 'none';

    }, 3100); // Must be slightly longer than CSS transition
}
