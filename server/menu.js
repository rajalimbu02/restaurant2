// Shared menu logic for both public and staff
const db = require('./db');

// Get all menu items (public)
function getMenu(req, res) {
    const sql = 'SELECT * FROM menu_items ORDER BY category, name';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching menu:', err);
            return res.status(500).json({ error: 'Failed to fetch menu' });
        }
        
        // Group items by category
        const groupedMenu = {};
        rows.forEach(item => {
            if (!groupedMenu[item.category]) {
                groupedMenu[item.category] = [];
            }
            groupedMenu[item.category].push(item);
        });
        
        res.json(groupedMenu);
    });
}

// Add menu item (staff only)
function addMenuItem(req, res) {
    const { name, category, price, description, meat_type, spice_level } = req.body;
    
    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const sql = `INSERT INTO menu_items (name, category, price, description, meat_type, spice_level) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [name, category, price, description, meat_type, spice_level], function(err) {
        if (err) {
            console.error('Error inserting item:', err);
            return res.status(500).json({ error: 'Failed to add item' });
        }
        
        res.json({ 
            success: true, 
            id: this.lastID,
            message: 'Item added successfully' 
        });
    });
}

// Update menu item (staff only)
function updateMenuItem(req, res) {
    const { id } = req.params;
    const { name, category, price, description, meat_type, spice_level } = req.body;
    
    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const sql = `UPDATE menu_items 
                 SET name = ?, category = ?, price = ?, description = ?, meat_type = ?, spice_level = ?
                 WHERE id = ?`;
    
    db.run(sql, [name, category, price, description, meat_type, spice_level, id], function(err) {
        if (err) {
            console.error('Error updating item:', err);
            return res.status(500).json({ error: 'Failed to update item' });
        }
        
        res.json({ 
            success: true, 
            message: 'Item updated successfully' 
        });
    });
}

// Delete menu item (staff only)
function deleteMenuItem(req, res) {
    const { id } = req.params;
    
    db.run('DELETE FROM menu_items WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).json({ error: 'Failed to delete item' });
        }
        
        res.json({ 
            success: true, 
            message: 'Item deleted successfully' 
        });
    });
}

module.exports = {
    getMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
};
