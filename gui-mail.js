/**
 * =======================================================================================
 * HỆ THỐNG GỬI MAIL TỰ ĐỘNG SIÊU CẤP - GREENGLOW (PHIÊN BẢN CHUẨN SNIPCART V3)
 * Tích hợp thông minh giữa Snipcart SDK v3 (cart.confirmed) và EmailJS API
 * =======================================================================================
 */

(function() {
    const PUBLIC_KEY = "1w0j-6pvjxCmpeyIe";
    const SERVICE_ID = "service_p65f7pf";
    const TEMPLATE_ID = "template_lqd21a2";

    console.log("🚀 [GreenGlow Mailer] Hệ thống gửi mail phiên bản Snipcart V3 đang khởi động...");

    function sendOrderConfirmationEmail(order) {
        console.log("📦 [EmailJS] Đang đóng gói dữ liệu đơn hàng thực tế từ Snipcart...", order);

        // Chuẩn hóa dữ liệu khách hàng (Snipcart v3 lưu trong billingAddress hoặc email trực tiếp)
        const customerName = order.customer?.name || order.billingAddress?.fullName || order.billingAddress?.name || "Khách hàng GreenGlow";
        const customerEmail = order.customer?.email || order.billingAddress?.email || order.email;
        const orderId = order.token || order.id || "N/A";
        
        // Định dạng tiền tệ VND (Ví dụ: 500.000 ₫)
        const orderTotal = typeof order.total === 'number' 
            ? order.total.toLocaleString('vi-VN') + ' ₫' 
            : order.total + ' ₫';

        // Chuẩn hóa danh sách sản phẩm đã mua
        let orderItems = "Mỹ phẩm hữu cơ thiên nhiên GreenGlow";
        let itemsArray = [];
        
        if (order.items && Array.isArray(order.items)) {
            itemsArray = order.items;
        } else if (order.items && order.items.items && Array.isArray(order.items.items)) {
            itemsArray = order.items.items;
        }

        if (itemsArray.length > 0) {
            orderItems = itemsArray.map(item => `${item.name} (SL: ${item.quantity})`).join(', ');
        }

        const emailParams = {
            customer_name: customerName,
            customer_email: customerEmail,
            order_id: orderId,
            order_total: orderTotal,
            order_items: orderItems
        };

        console.log("📧 [EmailJS] Đang đẩy dữ liệu chuẩn hóa lên Template...", emailParams);

        emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams)
            .then((response) => {
                console.log('🎉 [EmailJS] Gửi thư xác nhận đơn hàng thành công rực rỡ!', response.status, response.text);
            })
            .catch((err) => {
                console.error('❌ [EmailJS] Gửi mail thất bại. Chi tiết lỗi từ API:', err);
            });
    }

    function initEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init({
                publicKey: PUBLIC_KEY
            });
            console.log("✅ [EmailJS] Khởi tạo thành công kết nối.");
            
            // Đăng ký lệnh kiểm thử nhanh toàn cục trên F12 Console
            window.testSendMail = function(testEmail) {
                if (!testEmail) {
                    console.error("❌ Thiếu email nhận! Hãy gõ theo cú pháp: testSendMail('email_cua_ban@gmail.com')");
                    return "Vui lòng truyền email vào trong dấu ngoặc đơn!";
                }
                console.log("🧪 Đang kích hoạt đơn hàng giả lập gửi đến hòm thư:", testEmail);
                const mockOrder = {
                    customer: { name: "Người Thử Nghiệm", email: testEmail },
                    token: "GG-SIMULATED-" + Math.floor(Math.random() * 900000 + 100000),
                    total: 400000,
                    items: [
                        { name: "Kem Chống Nắng Thuần Chay GreenGlow Vegan Sunscreen", quantity: 1 }
                    ]
                };
                sendOrderConfirmationEmail(mockOrder);
                return "Đang truyền lệnh gửi... Hãy theo dõi log phía dưới hoặc kiểm tra hòm thư của bạn!";
            };
            console.log("💡 [Tips] Bạn có thể gõ lệnh: testSendMail('email_cua_ban@gmail.com') tại đây để kiểm tra.");
        }
    }

    if (typeof emailjs === 'undefined') {
        console.log("loader: Thư viện EmailJS chưa có sẵn. Đang tự động tải về từ CDN...");
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = function() {
            initEmailJS();
        };
        document.head.appendChild(script);
    } else {
        initEmailJS();
    }

    function initializeSnipcartListener() {
        console.log("✅ [Snipcart] Đã kết nối thành công bộ lắng nghe đơn hàng.");
        
        // SỬA ĐỔI QUAN TRỌNG: Đổi từ 'order.completed' sang 'cart.confirmed' cho chuẩn v3
        Snipcart.events.on('cart.confirmed', (cartState) => {
            console.log("🔔 [Snipcart] Phát hiện đơn hàng mới thanh toán hoàn tất (cart.confirmed)!");
            sendOrderConfirmationEmail(cartState);
        });
    }

    if (window.Snipcart) {
        initializeSnipcartListener();
    } else {
        document.addEventListener('snipcart.ready', () => {
            initializeSnipcartListener();
        });
    }
})();
