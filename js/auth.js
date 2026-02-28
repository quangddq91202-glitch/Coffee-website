
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
// 1. TIỆN ÍCH: CHUYỂN TIẾNG VIỆT KHÔNG DẤU
// ==========================================
// --- 1. Tiện ích: Chuyển tiếng Việt không dấu ---
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
            card.style.display = "flex"; // Grid items thường dùng flex bên trong
        } else {
            card.style.display = "none";
        }
    });
}

// --- 3. Thực thi tìm kiếm ---
function executeSearch(keyword, isExact = false) {
    const searchKey = removeVietnameseTones(keyword);
    const cards = document.querySelectorAll('.product-card');
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

    // Thông báo nếu không có kết quả
    const grid = document.querySelector('.product-grid');
    let msg = document.getElementById('no-result-msg');
    if (!hasResults) {
        if (!msg) {
            msg = document.createElement('p');
            msg.id = 'no-result-msg';
            msg.innerHTML = `Sản phẩm "${keyword}" không tồn tại.`;
            msg.style.cssText = "color:white; grid-column:1/-1; text-align:center; padding:20px;";
            grid.appendChild(msg);
        }
    } else if (msg) msg.remove();
}

// --- 4. Gợi ý và Enter ---
function handleSearchInput() {
    const input = document.getElementById('product-search-input');
    const box = document.getElementById('search-suggestions');
    const filter = removeVietnameseTones(input.value);
    
    box.innerHTML = '';
    if (!filter) { box.style.display = "none"; return; }

    const cards = document.querySelectorAll('.product-card');
    let count = 0;

    cards.forEach(card => {
        const name = card.querySelector('.product-name').innerText;
        const img = card.querySelector('img').src;
        if (removeVietnameseTones(name).includes(filter)) {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `<img src="${img}" style="width:30px; margin-right:10px;"><span>${name}</span>`;
            item.onclick = () => {
                input.value = name;
                executeSearch(name, true); // Click chọn 1 sản phẩm
                toggleSearch();
            };
            box.appendChild(item);
            count++;
        }
    });
    box.style.display = count > 0 ? "block" : "none";
}

function handleSearchEnter(e) {
    if (e.key === 'Enter' && e.target.value.trim() !== "") {
        executeSearch(e.target.value, false);
        toggleSearch();
    }
}

function toggleSearch() {
    const bar = document.getElementById('simple-search-bar');
    const input = document.getElementById('product-search-input');
    if (bar.classList.contains('search-bar-hidden')) {
        bar.classList.replace('search-bar-hidden', 'search-bar-visible');
        setTimeout(() => input.focus(), 300);
    } else {
        bar.classList.replace('search-bar-visible', 'search-bar-hidden');
        // Không reset filterCategory ở đây để giữ kết quả tìm kiếm trên màn hình
    }
}


