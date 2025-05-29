let sales = [];
let totalSales = [];
var totalPrice = 0;
const TAX_RATE = 0.12; // 12% tax

// --- Menu Data (simulating a database) ---
let menuItems = [
  { id: 'rice1', name: 'Longganisa w/Rice & Egg', price: 75.00, category: 'rice meals' },
  { id: 'rice2', name: 'Tocino w/Rice & Egg', price: 60.00, category: 'rice meals' },
  { id: 'rice3', name: 'Fried Chicken w/Rice', price: 40.00, category: 'rice meals' },
  { id: 'rice4', name: 'Porkchop w/Rice', price: 65.00, category: 'rice meals' },
  { id: 'drink1', name: 'Coca-Cola in Bottle', price: 10.00, category: 'drinks' },
  { id: 'drink2', name: 'Coke in 1.5 bottle', price: 70.00, category: 'drinks' },
  { id: 'bangus1', name: 'Daing na Bangus', price: 80.00, category: 'others' },
  { id: 'talong1', name: 'Fried Talong', price: 100.00, category: 'others' },
];

// --- UI Elements ---
const menuItemsContainer = document.getElementById('menuItemsContainer');
const salesTableBody = document.querySelector('#salesTable tbody');
const subtotalDisplay = document.getElementById('subtotalDisplay');
const taxDisplay = document.getElementById('taxDisplay');
const totalSalesDisplay = document.getElementById('totalSales');
const categoryButtons = document.querySelectorAll('.category-button');

// --- Menu Management Modal Elements ---
const menuManagementModal = document.getElementById('menuManagementModal');
const menuItemForm = document.getElementById('menuItemForm');
const newMenuItemName = document.getElementById('newMenuItemName');
const newMenuItemPrice = document.getElementById('newMenuItemPrice');
const newMenuItemCategory = document.getElementById('newMenuItemCategory');
const currentMenuItemsList = document.getElementById('currentMenuItems');

// --- Functions ---

function renderMenuItems(category = 'all') {
  menuItemsContainer.innerHTML = ''; // Clear previous items
  const filteredItems = category === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === category);

  if (filteredItems.length === 0) {
    menuItemsContainer.innerHTML = '<p style="text-align: center; color: #666;">No items in this category.</p>';
    return;
  }

  filteredItems.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.classList.add('menu-item-card');
    itemCard.innerHTML = `
      <h4>${item.name}</h4>
      <p>₱${item.price.toFixed(2)}</p>
    `;
    itemCard.dataset.itemId = item.id; // Store item ID for easy lookup
    itemCard.addEventListener('click', () => addSaleFromMenu(item.id));
    menuItemsContainer.appendChild(itemCard);
  });
}

function addSaleFromMenu(itemId) {
  const selectedItem = menuItems.find(item => item.id === itemId);
  if (!selectedItem) {
    alert('Error: Selected item not found in menu.');
    return;
  }

  // Check if item already exists in sales, increment quantity if so
  const existingSale = sales.find(sale => sale.id === itemId);
  if (existingSale) {
    existingSale.qty++;
    existingSale.total = existingSale.qty * existingSale.price;
  } else {
    sales.push({
      id: selectedItem.id,
      name: selectedItem.name,
      qty: 1,
      price: selectedItem.price,
      total: selectedItem.price
    });
  }
  updateTable();

}

function removeSale(index) {
  if (confirm(`Are you sure you want to remove ${sales[index].name}?`)) {
    sales.splice(index, 1);
    updateTable();
  }
}

function updateTable() {
  salesTableBody.innerHTML = '';
  let currentSubtotal = 0;

  if (sales.length === 0) {
    salesTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No items in order.</td></tr>';
  } else {
    sales.forEach((sale, index) => {
      currentSubtotal += sale.total;
      const row = `
        <tr>
          <td>${sale.name}</td>
          <td>${sale.qty}</td>
          <td>₱${sale.price.toFixed(2)}</td>
          <td>₱${sale.total.toFixed(2)}</td>
          <td><button class="remove-item-btn" onclick="removeSale(${index})">Remove</button></td>
        </tr>
      `;
      salesTableBody.innerHTML += row;
    });
  }

  const taxAmount = currentSubtotal * TAX_RATE;
  const grandTotal = currentSubtotal + taxAmount;

  subtotalDisplay.innerText = currentSubtotal.toFixed(2);
  taxDisplay.innerText = taxAmount.toFixed(2);
  totalSalesDisplay.innerText = grandTotal.toFixed(2);
}

function clearAllSales() {
    sales = [];
    updateTable();
}

function processPayment() {
  if (sales.length === 0) {
    alert("No items in the order to process payment.");
    return;
  }
  const total = parseFloat(totalSalesDisplay.innerText);
  alert(`Processing payment for ₱${total.toFixed(2)}.`);
  
  // In a real system, you'd integrate with a payment processing API here

  totalPrice += parseFloat(totalSalesDisplay.innerText);

  totalSales = sales.concat([]);
  clearAllSales(); // Clear order after "payment"
}

// --- Menu Management Functions ---
function openMenuManagement() {
  menuManagementModal.style.display = 'flex'; // Use flex to center
  renderCurrentMenuItems();
}

function closeMenuManagement() {
  menuManagementModal.style.display = 'none';
}

function renderCurrentMenuItems() {
  currentMenuItemsList.innerHTML = '';
  if (menuItems.length === 0) {
    currentMenuItemsList.innerHTML = '<li>No menu items defined.</li>';
    return;
  }
  menuItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.name} (₱${item.price.toFixed(2)}) [${item.category}]</span>
      <button onclick="deleteMenuItem('${item.id}')">Delete</button>
    `;
    currentMenuItemsList.appendChild(li);
  });
}

menuItemForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = newMenuItemName.value.trim();
  const price = parseFloat(newMenuItemPrice.value);
  const category = newMenuItemCategory.value.trim().toLowerCase();
  const id = name.toLowerCase().replace(/\s/g, '-') + '-' + Math.random().toString(36).substr(2, 5); // Simple unique ID

  if (!name || isNaN(price) || price <= 0 || !category) {
    alert('Please enter valid details for the new menu item.');
    return;
  }

  // Check for duplicate name (optional, could allow if ID is unique)
  if (menuItems.some(item => item.name.toLowerCase() === name.toLowerCase())) {
    alert('An item with this name already exists. Consider updating it or using a different name.');
    return;
  }

  menuItems.push({ id, name, price, category });
  alert(`"${name}" added to menu.`);
  menuItemForm.reset();
  renderCurrentMenuItems(); // Update the list in the modal
  renderMenuItems(); // Update the main menu display
});

function deleteMenuItem(itemIdToDelete) {
  const itemToDelete = menuItems.find(item => item.id === itemIdToDelete);
  if (!itemToDelete) return;

  if (confirm(`Are you sure you want to delete "${itemToDelete.name}" from the menu?`)) {
    menuItems = menuItems.filter(item => item.id !== itemIdToDelete);
    renderCurrentMenuItems();
    renderMenuItems(); // Update the main menu display
    alert(`"${itemToDelete.name}" removed from menu.`);
    // Also, remove from current sales if it was part of an ongoing order
    sales = sales.filter(sale => sale.id !== itemIdToDelete);
    updateTable();
  }
}

// --- Event Listeners for Category Filtering ---
categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    categoryButtons.forEach(btn => btn.classList.remove('active')); // Deactivate all
    button.classList.add('active'); // Activate clicked
    renderMenuItems(button.dataset.category);
  });
});


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
  renderMenuItems(); // Render all items initially
  updateTable(); // Initialize sales table (empty)
});


function displaySales(){

for(let i=0;i < totalSales.length; i++){
alert(totalSales[i].name);
}

alert("AMONGUS "+ totalPrice);
}
