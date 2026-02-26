// Consolidated Staff JavaScript

// ===== AUTHENTICATION =====
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include'
        });

        if (!response.ok) {
            window.location.href = '/staff/login.html';
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/staff/login.html';
        return null;
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    window.location.href = '/staff/login.html';
}

// ===== LOGIN PAGE =====
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageDiv = document.getElementById('message');
        const submitBtn = e.target.querySelector('.login-btn');
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        messageDiv.style.display = 'none';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = '/staff/dashboard.html';
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = result.error || 'Login failed';
                messageDiv.style.display = 'block';
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Network error. Please try again.';
            messageDiv.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// ===== DASHBOARD =====
if (document.getElementById('dashboardRole')) {
    async function loadDashboard() {
        const user = await checkAuth();
        if (!user) return;

        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = user.role.toUpperCase();
        document.getElementById('dashboardRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

        try {
            const response = await fetch('/api/public/menu');
            const menuData = await response.json();

            const totalItems = Object.values(menuData).reduce((sum, items) => sum + items.length, 0);
            const totalCategories = Object.keys(menuData).length;

            document.getElementById('totalItems').textContent = totalItems;
            document.getElementById('totalCategories').textContent = totalCategories;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    loadDashboard();
}

// ===== MENU MANAGEMENT =====
let currentEditId = null;

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'add') {
        document.querySelector('.tab:nth-child(1)').classList.add('active');
        document.getElementById('add-tab').classList.add('active');
    } else {
        document.querySelector('.tab:nth-child(2)').classList.add('active');
        document.getElementById('manage-tab').classList.add('active');
        loadItems();
    }
}

if (document.getElementById('addForm')) {
    checkAuth();

    document.getElementById('addForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (currentEditId) {
            await updateItem();
        } else {
            await addItem();
        }
    });
}

async function addItem() {
    const messageDiv = document.getElementById('add-message');
    const submitBtn = document.querySelector('#addForm .submit-btn');
    
    const formData = {
        name: document.getElementById('add-name').value,
        category: document.getElementById('add-category').value,
        price: parseInt(document.getElementById('add-price').value),
        description: document.getElementById('add-description').value,
        meat_type: document.getElementById('add-meat-type').value,
        spice_level: document.getElementById('add-spice-level').value
    };
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
    
    try {
        const response = await fetch('/api/staff/menu/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = `✓ ${result.message}`;
            messageDiv.style.display = 'block';
            document.getElementById('addForm').reset();
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        } else {
            throw new Error(result.error || 'Failed to add item');
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = `✗ ${error.message}`;
        messageDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Item to Menu';
    }
}

async function updateItem() {
    const messageDiv = document.getElementById('add-message');
    const submitBtn = document.querySelector('#addForm .submit-btn');
    
    const formData = {
        name: document.getElementById('add-name').value,
        category: document.getElementById('add-category').value,
        price: parseInt(document.getElementById('add-price').value),
        description: document.getElementById('add-description').value,
        meat_type: document.getElementById('add-meat-type').value,
        spice_level: document.getElementById('add-spice-level').value
    };
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    try {
        const response = await fetch(`/api/staff/menu/update/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = `✓ ${result.message}`;
            messageDiv.style.display = 'block';
            
            document.getElementById('addForm').reset();
            resetFormToAddMode();
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
                switchTab('manage');
            }, 2000);
        } else {
            throw new Error(result.error || 'Failed to update item');
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = `✗ ${error.message}`;
        messageDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
    }
}

function resetFormToAddMode() {
    currentEditId = null;
    const submitBtn = document.querySelector('#addForm .submit-btn');
    submitBtn.textContent = 'Add Item to Menu';
}

async function loadItems() {
    const container = document.getElementById('items-container');
    container.innerHTML = '<p class="loading">Loading items...</p>';
    
    try {
        const response = await fetch(`/api/public/menu?t=${Date.now()}`);
        const menuData = await response.json();
        
        container.innerHTML = '';
        
        if (Object.keys(menuData).length === 0) {
            container.innerHTML = '<p class="loading">No items in menu yet.</p>';
            return;
        }
        
        Object.keys(menuData).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.marginBottom = '2rem';
            
            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category;
            categoryTitle.style.color = '#8B0000';
            categoryTitle.style.marginBottom = '1rem';
            categoryDiv.appendChild(categoryTitle);
            
            menuData[category].forEach(item => {
                const itemRow = createItemRow(item);
                categoryDiv.appendChild(itemRow);
            });
            
            container.appendChild(categoryDiv);
        });
        
    } catch (error) {
        container.innerHTML = '<p class="loading" style="color: #dc3545;">Error loading items</p>';
        console.error('Error loading items:', error);
    }
}

function createItemRow(item) {
    const row = document.createElement('div');
    row.className = 'item-row';
    
    const info = document.createElement('div');
    info.className = 'item-info';
    
    const name = document.createElement('h3');
    name.textContent = item.name;
    info.appendChild(name);
    
    const details = document.createElement('p');
    details.innerHTML = `<strong>Rs ${item.price}</strong> | ${item.description || 'No description'}`;
    info.appendChild(details);
    
    const meta = document.createElement('p');
    meta.textContent = `${item.meat_type || ''} ${item.spice_level ? '• ' + item.spice_level : ''}`;
    info.appendChild(meta);
    
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editItem(item);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteItem(item.id, item.name);
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    row.appendChild(info);
    row.appendChild(actions);
    
    return row;
}

function editItem(item) {
    switchTab('add');
    
    document.getElementById('add-name').value = item.name;
    document.getElementById('add-category').value = item.category;
    document.getElementById('add-price').value = item.price;
    document.getElementById('add-description').value = item.description || '';
    document.getElementById('add-meat-type').value = item.meat_type || '';
    document.getElementById('add-spice-level').value = item.spice_level || '';
    
    currentEditId = item.id;
    
    const submitBtn = document.querySelector('#addForm .submit-btn');
    submitBtn.textContent = 'Update Item';
    
    window.scrollTo(0, 0);
}

async function deleteItem(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }
    
    const messageDiv = document.getElementById('manage-message');
    
    try {
        const response = await fetch(`/api/staff/menu/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = `✓ ${result.message}`;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
            
            loadItems();
        } else {
            throw new Error(result.error || 'Failed to delete item');
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = `✗ ${error.message}`;
        messageDiv.style.display = 'block';
    }
}

// ===== SETTINGS =====
if (document.getElementById('passwordForm')) {
    let currentUser = null;

    async function initSettings() {
        const user = await checkAuth();
        if (!user) return;

        currentUser = user;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = user.role.toUpperCase();

        if (user.role === 'manager') {
            document.querySelectorAll('.manager-only').forEach(el => {
                el.style.display = 'block';
            });
            loadStaffUsers();
        }
    }

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageDiv = document.getElementById('password-message');
        const submitBtn = e.target.querySelector('.btn-primary');

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'New passwords do not match';
            messageDiv.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Changing...';

        try {
            const response = await fetch('/api/staff/users/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = '✓ ' + result.message;
                messageDiv.style.display = 'block';
                document.getElementById('passwordForm').reset();

                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 3000);
            } else {
                throw new Error(result.error || 'Failed to change password');
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = '✗ ' + error.message;
            messageDiv.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Change Password';
        }
    });

    if (document.getElementById('addStaffForm')) {
        document.getElementById('addStaffForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const messageDiv = document.getElementById('staff-message');
            const submitBtn = e.target.querySelector('.btn-primary');

            const formData = {
                name: document.getElementById('staffName').value,
                email: document.getElementById('staffEmail').value,
                password: document.getElementById('staffPassword').value,
                role: document.getElementById('staffRole').value
            };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Adding...';

            try {
                const response = await fetch('/api/staff/users/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = '✓ ' + result.message;
                    messageDiv.style.display = 'block';
                    document.getElementById('addStaffForm').reset();

                    loadStaffUsers();

                    setTimeout(() => {
                        messageDiv.style.display = 'none';
                    }, 3000);
                } else {
                    throw new Error(result.error || 'Failed to add staff user');
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = '✗ ' + error.message;
                messageDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Staff User';
            }
        });
    }

    async function loadStaffUsers() {
        const container = document.getElementById('users-list');
        container.innerHTML = '<p style="text-align: center; color: #666;">Loading...</p>';

        try {
            const response = await fetch('/api/staff/users', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to load staff users');
            }

            const users = await response.json();
            container.innerHTML = '';

            users.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';

                const userInfo = document.createElement('div');
                userInfo.className = 'user-info';

                const name = document.createElement('h4');
                name.innerHTML = `${user.name} <span class="role-badge">${user.role.toUpperCase()}</span>`;
                userInfo.appendChild(name);

                const email = document.createElement('p');
                email.textContent = user.email;
                userInfo.appendChild(email);

                userItem.appendChild(userInfo);

                if (user.id !== currentUser.id) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-delete';
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.onclick = () => deleteStaffUser(user.id, user.name);
                    userItem.appendChild(deleteBtn);
                }

                container.appendChild(userItem);
            });

        } catch (error) {
            container.innerHTML = '<p style="text-align: center; color: #dc3545;">Error loading staff users</p>';
            console.error('Error loading staff:', error);
        }
    }

    async function deleteStaffUser(id, name) {
        if (!confirm(`Are you sure you want to delete ${name}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/staff/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                alert('✓ ' + result.message);
                loadStaffUsers();
            } else {
                throw new Error(result.error || 'Failed to delete user');
            }
        } catch (error) {
            alert('✗ ' + error.message);
        }
    }

    initSettings();
}
