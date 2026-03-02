
/* ==========================================
   1. QUẢN LÝ ĐĂNG KÝ & ĐĂNG NHẬP
   ========================================== */

// --- Chuyển đổi qua lại giữa Form Đăng nhập và Đăng ký ---
function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if(loginForm && registerForm) {
        loginForm.classList.toggle('hidden');
        registerForm.classList.toggle('hidden');
    }
}

// --- Xử lý Logic Đăng ký & Đăng nhập ---
function handleAuth(event, type) {
    event.preventDefault();
    // Lấy danh sách người dùng từ LocalStorage hoặc mảng rỗng nếu chưa có
    let users = JSON.parse(localStorage.getItem('coffee_users')) || [];

    if (type === 'register') {
        const fullName = event.target.elements[0].value;
        const username = event.target.elements[1].value;
        const email    = event.target.elements[2].value;
        const password = event.target.elements[3].value;

        // Kiểm tra trùng lặp
        if (users.find(u => u.email === email || u.username === username)) {
            alert('Tên đăng nhập hoặc Email đã tồn tại!');
            return;
        }

        // Lưu người dùng mới
        users.push({ fullName, username, email, password });
        localStorage.setItem('coffee_users', JSON.stringify(users));
        alert('Đăng ký thành công! Hãy đăng nhập để bắt đầu.');
        toggleAuth();

    } else if (type === 'login') {
        const loginInput = document.getElementById('login-user').value;
        const passInput  = document.getElementById('login-pass').value;

        // Tìm người dùng khớp Username/Email và Mật khẩu
        const userFound = users.find(u => 
            (u.username === loginInput || u.email === loginInput) && u.password === passInput
        );

        if (userFound) {
            localStorage.setItem('currentUser', JSON.stringify(userFound));
            alert(`Chào mừng trở lại, ${userFound.fullName}!`);
            window.location.href = 'index.html'; // Chuyển hướng về trang chủ
        } else {
            alert('Thông tin đăng nhập không chính xác! Vui lòng thử lại.');
        }
    }
}

document.querySelector('.toggle-password')?.addEventListener('click', function() {
    const passwordInput = document.getElementById('login-pass');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

/* ==========================================
   2. CẬP NHẬT NAVBAR (Tên User & Dropdown)
   ========================================== */

function updateNavbarAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userArea = document.getElementById('nav-user-area');

    if (currentUser && userArea) {
        userArea.innerHTML = `
            <div class="user-menu-wrapper">
                <i class="fas fa-user-circle" style="font-size: 1.5rem; color: white;"></i>
                <span class="user-name" style="margin: 0 5px; color: white;">${currentUser.fullName}</span>
                <i class="fas fa-chevron-down" style="font-size: 0.7rem; color: white;"></i>
                
                <div class="dropdown-content">
                    <a href="#"><i class="fas fa-user-cog"></i> Hồ sơ cá nhân</a>
                    <a href="history.html"><i class="fas fa-history"></i> Lịch sử đơn hàng</a> 
                    <div class="dropdown-divider"></div>
                    <a href="#" id="logout-link" style="color: #ff4d4d !important;">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </a>
                </div>
            </div>
        `;

        // Gán sự kiện Đăng xuất sau khi tạo xong HTML
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("Bạn muốn đăng xuất khỏi Coffee House?")) {
                localStorage.removeItem('currentUser');
                location.reload();
            }
        });
    }
}

/* ==========================================
   3. QUẢN LÝ GIỎ HÀNG (CART)
   ========================================== */

let cart = JSON.parse(localStorage.getItem('coffee_cart')) || [];

function addToCart(id, name, price, img) {
    // 1. Kiểm tra đăng nhập
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert("Xin lỗi! Bạn cần đăng nhập để thực hiện mua sắm.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Xử lý logic thêm sản phẩm
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            img: img,
            quantity: 1
        });
    }

    // 3. Lưu và cập nhật giao diện
    localStorage.setItem('coffee_cart', JSON.stringify(cart));
    updateCartUI();
    
    // Hiển thị thông báo nhẹ nhàng
    console.log(`Đã thêm ${name} vào giỏ hàng`);
}

function updateCartUI() {
    const badge = document.getElementById('cart-count');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = totalItems;
        
        // Hiệu ứng "Bump" rung nhẹ khi có món mới
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 300);
    }
}

// Chạy các hàm khởi tạo khi load trang
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarAuth();
    updateCartUI();

    // Logic xử lý bật/tắt User Menu
    const userMenuWrapper = document.querySelector('.user-menu-wrapper');
    
    if (userMenuWrapper) {
        userMenuWrapper.addEventListener('click', function(e) {
            // Ngăn chặn sự kiện nổi bọt để không kích hoạt trình đóng menu ngay lập tức
            e.stopPropagation();
            this.classList.toggle('active');
        });
    }

    // Đóng menu khi click bất kỳ đâu bên ngoài
    window.addEventListener('click', () => {
        if (userMenuWrapper && userMenuWrapper.classList.contains('active')) {
            userMenuWrapper.classList.remove('active');
        }
    });
});


//=======================//
// Hàm xử lý thanh toán và lưu lịch sử
function processCheckout() {
    const cartData = JSON.parse(localStorage.getItem('coffee_cart')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        alert("Vui lòng đăng nhập để thanh toán!");
        window.location.href = 'login.html';
        return;
    }

    if (cartData.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    // 1. Tạo đơn hàng mới
    const newOrder = {
        orderId: 'CFH' + Math.floor(Math.random() * 100000),
        date: new Date().toLocaleString('vi-VN'),
        items: [...cartData], // Copy mảng giỏ hàng
        total: cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'Hoàn thành'
    };

    // 2. Lưu vào lịch sử riêng của User đó
    const historyKey = `history_${currentUser.username}`;
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    history.unshift(newOrder); // Đưa đơn mới lên đầu
    localStorage.setItem(historyKey, JSON.stringify(history));

    // 3. Xóa giỏ hàng và thông báo
    localStorage.removeItem('coffee_cart');
    alert("Thanh toán thành công! Đơn hàng đã được lưu vào lịch sử.");
    window.location.href = 'history.html'; // Chuyển thẳng đến trang lịch sử để kiểm tra
}

// ====SEARCH======
// ==========================================
// 1.CHUYỂN TIẾNG VIỆT KHÔNG DẤU
// ==========================================
function removeVietnameseTones(str) {
    if (!str) return "";
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str.toLowerCase().trim();
}

// --- 2. Lọc theo danh mục ---
function filterCategory(category, e) {
    // Cập nhật nút active
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (e && e.target) {
        e.target.classList.add('active');
    } else {
        const btnAll = document.querySelector(".cat-btn[onclick*='all']");
        if(btnAll) btnAll.classList.add('active');
    }

    // Hiển thị card theo mục
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const itemCat = card.getAttribute('data-category');
        if (category === 'all' || itemCat === category) {
            card.style.display = "flex"; 
        } else {
            card.style.display = "none";
        }
    });
}

// --- 3. Thực thi tìm kiếm ---
function executeSearch(keyword, isExact = false) {
    const searchKey = removeVietnameseTones(keyword);
    const cards = document.querySelectorAll('.product-card');
    const productSection = document.getElementById('products'); 
    let hasResults = false;

    cards.forEach(card => {
        const nameElement = card.querySelector('.product-name');
        if (!nameElement) return;
        const nameNoTone = removeVietnameseTones(nameElement.innerText);
        let isMatch = isExact ? (nameNoTone === searchKey) : nameNoTone.includes(searchKey);

        if (isMatch) {
            card.style.display = "flex";
            hasResults = true;
        } else {
            card.style.display = "none";
        }
    });

    // Cuộn đến phần sản phẩm nếu tìm thấy
    if (hasResults && productSection) {
        productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// --- 4. Gợi ý và Enter ---
// 1. Danh sách sản phẩm 
const productsData = [
    { name: "Cà phê hòa tan G7 3in1", img: "img/sp1.png" },
    { name: "Cà phê G7 Espresso", img: "img/sp2.png" },
    { name: "Nescafé Việt vị Tequila", img: "img/sp3.png" },
    { name: "Nescafé Espressoda", img: "img/sp4.png" }
];

// 2. Hàm xử lý gợi ý dùng chung cho mọi trang
function handleSearchInput() {
    const input = document.getElementById('product-search-input');
    const box = document.getElementById('search-suggestions');
    const keyword = removeVietnameseTones(input.value.toLowerCase().trim());
    
    box.innerHTML = '';
    if (!keyword) { box.style.display = "none"; return; }

    let count = 0;
    productsData.forEach(product => {
        const nameNoTone = removeVietnameseTones(product.name.toLowerCase());
        
        if (nameNoTone.includes(keyword)) {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <img src="${product.img}">
                <span>${product.name}</span>
            `;
            item.onclick = () => {
                input.value = product.name;
                box.style.display = "none";
                
                const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
                if (isHomePage) {
                    executeSearch(product.name, true);
                    toggleSearch();
                } else {
                    window.location.href = `index.html?search=${encodeURIComponent(product.name)}`;
                }
            };
            box.appendChild(item);
            count++;
        }
    });

    box.style.display = count > 0 ? "block" : "none";
}

function handleSearchEnter(e) {
    if (e.key === 'Enter') {
        const keyword = e.target.value.trim();
        if (keyword !== "") {
            // Kiểm tra xem có đang ở trang chủ không
            const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

            if (isHomePage) {
                // Nếu ở trang chủ: Thực hiện tìm kiếm và cuộn luôn
                executeSearch(keyword, false);
                toggleSearch();
                e.target.blur();
            } else {
                // Nếu ở trang khác (Cart/History): Chuyển hướng về index kèm tham số
                window.location.href = `index.html?search=${encodeURIComponent(keyword)}`;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Lấy tham số "search" từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {
        // Chờ một chút để các sản phẩm kịp render rồi mới tìm
        setTimeout(() => {
            // Điền từ khóa vào ô input (để người dùng biết mình đang tìm gì)
            const searchInput = document.getElementById('product-search-input');
            if(searchInput) searchInput.value = searchQuery;
            
            // Chạy hàm tìm kiếm
            executeSearch(searchQuery, false);
        }, 300);
    }
});

function toggleSearch() {
    const bar = document.getElementById('simple-search-bar');
    const input = document.getElementById('product-search-input');
    if (bar.classList.contains('search-bar-hidden')) {
        bar.classList.replace('search-bar-hidden', 'search-bar-visible');
        setTimeout(() => input.focus(), 300);
    } else {
        bar.classList.replace('search-bar-visible', 'search-bar-hidden');
        // Không reset filterCategory để giữ kết quả tìm kiếm trên màn hình
    }
}


