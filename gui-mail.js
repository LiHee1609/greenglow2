/**
 * =======================================================================================
 * HỆ THỐNG GỬI MAIL TỰ ĐỘNG - GREENGLOW (TỐI ƯU HÓA SNIPCART V3)
 * =======================================================================================
 */

(function() {
    const PUBLIC_KEY = "1w0j-6pvjxCmpeyIe";
    const SERVICE_ID = "service_p65f7pf";
    const TEMPLATE_ID = "template_lqd21a2";

    console.log("🚀 [GreenGlow Mailer] Hệ thống đang khởi động...");

    function sendOrderConfirmationEmail(order) {
        if (!order) {
            console.error("❌ [EmailJS] Dữ liệu đơn hàng không tồn tại!");
            return;
        }

        console.log("📦 [EmailJS] Đang xử lý đơn hàng:", order);

        // Chuẩn hóa thông tin
        const customerName = order.billingAddress?.fullName || order.shippingAddress?.fullName || "Khách hàng";
        const customerEmail = order.email || "Không có email";
        const orderId = order.token || order.id || "N/A";
        
        // Định dạng tiền tệ
        const orderTotal = (order.total || 0).toLocaleString('vi-VN') + ' ₫';

        // Xử lý danh sách sản phẩm
        let orderItems = "Mỹ phẩm GreenGlow";
        if (order.items && order.items.length > 0) {
            orderItems = order.items.map(item => `${item.name} (SL: ${item.quantity})`).join(', ');
        }

        const emailParams = {
            customer_name: customerName,
            customer_email: customerEmail,
            order_id: orderId,
            order_total: orderTotal,
            order_items: orderItems
        };

        emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams)
            .then((response) => {
                console.log('🎉 [EmailJS] Gửi thư thành công!', response.status);
            })
            .catch((err) => {
                console.error('❌ [EmailJS] Lỗi gửi mail:', err);
            });
    }

    function initEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init({ publicKey: PUBLIC_KEY });
            console.log("✅ [EmailJS] Đã sẵn sàng.");
        }
    }

    // Tự động tải thư viện nếu chưa có
    if (typeof emailjs === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = initEmailJS;
        document.head.appendChild(script);
    } else {
        initEmailJS();
    }

    // Lắng nghe sự kiện từ Snipcart
    function initializeSnipcartListener() {
        if (window.Snipcart) {
            Snipcart.events.on('cart.confirmed', (order) => {
                console.log("🔔 [Snipcart] Đơn hàng xác nhận, đang gửi mail...");
                sendOrderConfirmationEmail(order);
            });
        }
    }

    if (window.Snipcart) {
        initializeSnipcartListener();
    } else {
        document.addEventListener('snipcart.ready', initializeSnipcartListener);
    }
})();
