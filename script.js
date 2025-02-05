const API_URL = 'http://localhost:3000/api';

// DOM Elements
const addItemBtn = document.getElementById('addItemBtn');
const addItemForm = document.getElementById('addItemForm');
const submitItemBtn = document.getElementById('submitItem');
const cancelAddBtn = document.getElementById('cancelAdd');
const searchInput = document.getElementById('searchInput');
const inventoryList = document.getElementById('inventoryList');
const totalValueEl = document.getElementById('totalValue');
const editModal = document.getElementById('editModal');
const editForm = {
    name: document.getElementById('editName'),
    quantity: document.getElementById('editQuantity'),
    price: document.getElementById('editPrice'),
    category: document.getElementById('editCategory')
};

let items = [];
let editingId = null;

// Event Listeners
addItemBtn.addEventListener('click', () => {
    addItemForm.classList.toggle('hidden');
    addItemBtn.textContent = addItemForm.classList.contains('hidden') ? 'Add New Item' : 'Cancel';
});

submitItemBtn.addEventListener('click', addItem);
cancelAddBtn.addEventListener('click', () => addItemForm.classList.add('hidden'));
searchInput.addEventListener('input', filterItems);
document.getElementById('saveEdit').addEventListener('click', saveEdit);
document.getElementById('cancelEdit').addEventListener('click', () => editModal.classList.add('hidden'));

// Functions
async function fetchItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        items = await response.json();
        renderItems(items);
        updateTotalValue();
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

function renderItems(itemsToRender) {
    inventoryList.innerHTML = itemsToRender.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>${item.category}</td>
            <td>$${(item.quantity * item.price).toFixed(2)}</td>
            <td class="action-buttons">
                <button onclick="editItem(${item.id})" class="edit-btn">Edit</button>
                <button onclick="deleteItem(${item.id})" class="delete-btn">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function addItem() {
    const newItem = {
        name: document.getElementById('itemName').value,
        quantity: parseInt(document.getElementById('itemQuantity').value),
        price: parseFloat(document.getElementById('itemPrice').value),
        category: document.getElementById('itemCategory').value
    };

    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });

        if (response.ok) {
            addItemForm.classList.add('hidden');
            addItemBtn.textContent = 'Add New Item';
            clearForm();
            await fetchItems();
        }
    } catch (error) {
        console.error('Error adding item:', error);
    }
}

function editItem(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        editingId = id;
        editForm.name.value = item.name;
        editForm.quantity.value = item.quantity;
        editForm.price.value = item.price;
        editForm.category.value = item.category;
        editModal.classList.remove('hidden');
    }
}

async function saveEdit() {
    if (!editingId) return;

    const updatedItem = {
        name: editForm.name.value,
        quantity: parseInt(editForm.quantity.value),
        price: parseFloat(editForm.price.value),
        category: editForm.category.value
    };

    try {
        const response = await fetch(`${API_URL}/items/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
        });

        if (response.ok) {
            editModal.classList.add('hidden');
            await fetchItems();
        }
    } catch (error) {
        console.error('Error updating item:', error);
    }
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await fetchItems();
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

function filterItems() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    renderItems(filteredItems);
}

function updateTotalValue() {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    totalValueEl.textContent = `Total Value: $${total.toFixed(2)}`;
}

function clearForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('itemQuantity').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemCategory').value = '';
}

// Initial load
fetchItems();
