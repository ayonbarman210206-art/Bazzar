const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
  storageBucket: "YOUR_BUCKET"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser;

// LOGIN
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(res => {
    currentUser = res.user;
    loadProducts();
    loadMyProducts();
  });
}

// GO DASHBOARD
function goDashboard() {
  window.location.href = "dashboard.html";
}

// CREATE STORE
function createStore() {
  db.collection("stores").doc(currentUser.uid).set({
    name: storeName.value,
    whatsapp: whatsapp.value
  });
  alert("Store Saved");
}

// ADD PRODUCT WITH IMAGE UPLOAD
function addProduct() {
  const file = document.getElementById("imageFile").files[0];

  const ref = storage.ref("products/" + Date.now());
  ref.put(file).then(() => {
    ref.getDownloadURL().then(url => {

      db.collection("products").add({
        name: productName.value,
        price: price.value,
        image: url,
        sellerId: currentUser.uid
      });

      alert("Product Added!");
      loadMyProducts();
    });
  });
}

// LOAD ALL PRODUCTS
function loadProducts() {
  db.collection("products").get().then(snapshot => {
    products.innerHTML = "";

    snapshot.forEach(doc => {
      const p = doc.data();

      db.collection("stores").doc(p.sellerId).get().then(storeDoc => {
        const store = storeDoc.data();

        const link =
          https://wa.me/${store.whatsapp}?text=I want to buy ${p.name};

        products.innerHTML += `
          <div class="product-card">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>৳ ${p.price}</p>
            <a href="${link}" target="_blank">
              <button>Buy</button>
            </a>
          </div>
        `;
      });
    });
  });
}

// LOAD MY PRODUCTS (SELLER)
function loadMyProducts() {
  db.collection("products")
    .where("sellerId", "==", currentUser.uid)
    .get()
    .then(snapshot => {

      myProducts.innerHTML = "";

      snapshot.forEach(doc => {
        const p = doc.data();

        myProducts.innerHTML += `
          <div class="product-card">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <button onclick="deleteProduct('${doc.id}')">Delete</button>
          </div>
        `;
      });
    });
}

// DELETE PRODUCT
function deleteProduct(id) {
  db.collection("products").doc(id).delete();
  loadMyProducts();
}

// SEARCH
function searchProduct() {
  const val = document.getElementById("search").value.toLowerCase();

  document.querySelectorAll(".product-card").forEach(card => {
    const name = card.querySelector("h3").innerText.toLowerCase();
    card.style.display = name.includes(val) ? "block" : "none";
  });
}