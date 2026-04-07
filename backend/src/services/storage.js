// Simple file-based storage for order reconciliation and gallery images
// In production, replace with PostgreSQL/Redis
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

function ensureFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
}

function readJson(filePath) {
  ensureFile(filePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- Orders ---

function readOrders() {
  return readJson(ORDERS_FILE);
}

function writeOrders(orders) {
  writeJson(ORDERS_FILE, orders);
}

async function saveOrder(order) {
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
}

async function getOrderByStripeSessionId(sessionId) {
  const orders = readOrders();
  return orders.find(o => o.stripeSessionId === sessionId);
}

async function updateOrderStatus(sessionId, status) {
  const orders = readOrders();
  const idx = orders.findIndex(o => o.stripeSessionId === sessionId);
  if (idx !== -1) {
    orders[idx].status = status;
    writeOrders(orders);
  }
}

// --- Gallery Images ---

function readGallery() {
  return readJson(GALLERY_FILE);
}

function writeGallery(gallery) {
  writeJson(GALLERY_FILE, gallery);
}

async function saveGalleryImage(image) {
  const gallery = readGallery();
  const entry = {
    id: image.id || `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    imageUrl: image.imageUrl,
    prompt: image.prompt || '',
    createdAt: image.createdAt || new Date().toISOString(),
    aspectRatio: image.aspectRatio || 'landscape',
    upscaled: image.upscaled || false,
  };
  gallery.unshift(entry);
  writeGallery(gallery);
  return entry;
}

async function getGalleryImages() {
  return readGallery();
}

async function deleteGalleryImage(id) {
  const gallery = readGallery();
  const filtered = gallery.filter(img => img.id !== id);
  if (filtered.length !== gallery.length) {
    writeGallery(filtered);
    return true;
  }
  return false;
}

module.exports = {
  saveOrder,
  getOrderByStripeSessionId,
  updateOrderStatus,
  saveGalleryImage,
  getGalleryImages,
  deleteGalleryImage,
};
