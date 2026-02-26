// Menu loader - fetches menu items from backend and renders them dynamically

const API_URL = '';

// Load menu items from backend
async function loadMenu() {
    try {
        // Add cache-busting parameter
        const response = await fetch(`/api/public/menu?t=${Date.now()}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch menu');
        }
        
        const menuData = await response.json();
        console.log('Loaded menu data:', menuData); // Debug log
        renderMenu(menuData);
        
    } catch (error) {
        console.error('Error loading menu:', error);
        showError('Unable to load menu. Please make sure the server is running.');
    }
}

// Render menu items into the page
function renderMenu(menuData) {
    const mainElement = document.querySelector('.menu-page');
    
    if (!mainElement) {
        console.error('Menu page element not found');
        return;
    }
    
    // Clear existing content
    mainElement.innerHTML = '';
    
    // Check if menu is empty
    if (Object.keys(menuData).length === 0) {
        mainElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No menu items yet. Use the clerk panel to add items.</p>';
        return;
    }
    
    // Define category order
    const categoryOrder = [
        'Momo',
        'Traditional Eastern Nepali Pork Dishes',
        'Traditional Chicken Dishes',
        'Dal-Bhat Sets',
        'Snacks & Small Plates',
        'Local Specialties'
    ];
    
    // Render categories in order
    categoryOrder.forEach(category => {
        if (menuData[category] && menuData[category].length > 0) {
            const items = menuData[category];
            
            // Create category section
            const section = document.createElement('section');
            section.className = 'menu-category';
            
            // Category heading
            const heading = document.createElement('h2');
            heading.textContent = category;
            section.appendChild(heading);
            
            // Items grid
            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'menu-items';
            
            // Sort items by name
            items.sort((a, b) => a.name.localeCompare(b.name));
            
            // Create card for each item
            items.forEach(item => {
                const card = createMenuCard(item);
                itemsGrid.appendChild(card);
            });
            
            section.appendChild(itemsGrid);
            mainElement.appendChild(section);
        }
    });
    
    // Add any categories not in the predefined order (for custom categories)
    Object.keys(menuData).forEach(category => {
        if (!categoryOrder.includes(category) && menuData[category].length > 0) {
            const items = menuData[category];
            
            const section = document.createElement('section');
            section.className = 'menu-category';
            
            const heading = document.createElement('h2');
            heading.textContent = category;
            section.appendChild(heading);
            
            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'menu-items';
            
            items.sort((a, b) => a.name.localeCompare(b.name));
            
            items.forEach(item => {
                const card = createMenuCard(item);
                itemsGrid.appendChild(card);
            });
            
            section.appendChild(itemsGrid);
            mainElement.appendChild(section);
        }
    });
    
    // Apply random colors to cards
    applyRandomColors();
}

// Create a menu card element
function createMenuCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-card';
    
    // Item header (name and price)
    const header = document.createElement('div');
    header.className = 'item-header';
    
    const name = document.createElement('h3');
    name.textContent = item.name;
    
    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = `Rs ${item.price}`;
    
    header.appendChild(name);
    header.appendChild(price);
    card.appendChild(header);
    
    // Description
    if (item.description) {
        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = item.description;
        card.appendChild(description);
    }
    
    // Meta info (meat type and spice level)
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    
    if (item.meat_type) {
        const meatType = document.createElement('span');
        meatType.className = 'meat-type';
        meatType.textContent = item.meat_type;
        meta.appendChild(meatType);
    }
    
    if (item.spice_level) {
        const spiceLevel = document.createElement('span');
        spiceLevel.className = `spice-level ${item.spice_level.toLowerCase()}`;
        spiceLevel.textContent = item.spice_level;
        meta.appendChild(spiceLevel);
    }
    
    card.appendChild(meta);
    
    return card;
}

// Apply random colors to menu cards
function applyRandomColors() {
    const menuCards = document.querySelectorAll('.menu-card');
    const colorClasses = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
    
    menuCards.forEach(card => {
        const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];
        card.classList.add(randomColor);
    });
}

// Show error message
function showError(message) {
    const mainElement = document.querySelector('.menu-page');
    if (mainElement) {
        mainElement.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #8B0000;">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">⚠️ ${message}</p>
                <p style="color: #666;">Make sure to run: <code style="background: #f0f0f0; padding: 0.2rem 0.5rem; border-radius: 3px;">npm start</code></p>
            </div>
        `;
    }
}

// Load menu when page loads
document.addEventListener('DOMContentLoaded', loadMenu);
