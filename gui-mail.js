/**
 * =======================================================================================
 * HỆ THỐNG GỬI MAIL TỰ ĐỘNG SIÊU CẤP - GREENGLOW (PHIÊN BẢN TỰ VÁ LỖI)
 * Tích hợp thông minh giữa Snipcart SDK và EmailJS API
 * =======================================================================================
 * * Tính năng đặc biệt:
 * - Tự động tải thư viện EmailJS nếu website bị thiếu.
 * - Tự động sửa lỗi bất đồng bộ khi tải Snipcart.
 * - Hỗ trợ lệnh kiểm thử nhanh ngay trên Console trình duyệt (F12).
 */

(function() {
    const PUBLIC_KEY = "1w0j-6pvjxCmpeyIe";
    const SERVICE_ID = "service_p65f7pf";
    const TEMPLATE_ID = "template_lqd21a2";

    console.log("🚀 [GreenGlow Mailer] Hệ thống gửi mail đang khởi động...");

    // Hàm thực hiện gửi email qua EmailJS
    function sendOrderConfirmationEmail(order) {
        console.log("📦 [EmailJS] Đang chuẩn bị đóng gói dữ liệu đơn hàng...", order);

        const customerName = order.customer?.name || order.billingAddress?.fullName || "Khách hàng GreenGlow";
        const customerEmail = order.customer?.email || order.billingAddress?.email || order.email;
        const orderId = order.token || order.id || "N/A";
        
        const orderTotal = typeof order.total === 'number' 
            ? order.total.toLocaleString('vi-VN') + ' ₫' 
            : order.total + ' ₫';

        let orderItems = "Mỹ phẩm hữu cơ thiên nhiên GreenGlow";
        if (order.items && order.items.items) {
            orderItems = order.items.items.map(item => `${item.name} (SL: ${item.quantity})`).join(', ');
        } else if (order.items && Array.isArray(order.items)) {
            orderItems = order.items.map(item => `${item.name} (SL: ${item.quantity})`).join(', ');
        }

        const emailParams = {
            customer_name: customerName,
            customer_email: customerEmail,
            order_id: orderId,
            order_total: orderTotal,
            order_items: orderItems
        };

        console.log("📧 [EmailJS] Đang đẩy dữ liệu lên Template...", emailParams);

        emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams)
            .then((response) => {
                console.log('🎉 [EmailJS] Gửi thư xác nhận đơn hàng thành công rực rỡ!', response.status, response.text);
            })
            .catch((err) => {
                console.error('❌ [EmailJS] Gửi mail thất bại. Chi tiết lỗi:', err);
            });
    }

    // Khởi tạo EmailJS sau khi chắc chắn thư viện đã tải xong
    function initEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init({
                publicKey: PUBLIC_KEY
            });
            console.log("✅ [EmailJS] Khởi tạo thành công kết nối.");
            
            // Đăng ký lệnh kiểm thử nhanh toàn cục trên F12 Console để bạn test bất cứ lúc nào!
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
            console.log("💡 [Tips] Bạn có thể gõ lệnh: testSendMail('email_cua_ban@gmail.com') ngay tại đây và nhấn Enter để test gửi thư!");
        }
    }

    // TỰ ĐỘNG TẢI THƯ VIỆN EMAILJS NẾU THIẾU
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

    // KẾT NỐI BỘ LẮNG NGHE SỰ KIỆN SNIPCART
    function initializeSnipcartListener() {
        console.log("✅ [Snipcart] Đã kết nối thành công bộ lắng nghe đơn hàng.");
        Snipcart.events.on('order.completed', (order) => {
            console.log("🔔 [Snipcart] Phát hiện đơn hàng mới thanh toán hoàn tất!");
            sendOrderConfirmationEmail(order);
        });
    }

    // Xử lý nạp bất đồng bộ Snipcart
    if (window.Snipcart) {
        initializeSnipcartListener();
    } else {
        document.addEventListener('snipcart.ready', () => {
            initializeSnipcartListener();
        });
    }
})();
