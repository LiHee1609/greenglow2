/**
 * HỆ THỐNG GỬI MAIL XÁC NHẬN ĐƠN HÀNG TỰ ĐỘNG - GREENGLOW
 * Tích hợp giữa Snipcart SDK và EmailJS API
 */

// 1. Khởi tạo cấu hình EmailJS bằng Public Key chính xác của bạn
if (typeof emailjs !== 'undefined') {
    emailjs.init({
        publicKey: "1w0j-6pvjxCmpeyIe"
    });
    console.log("✅ [EmailJS] Đã khởi tạo thành công.");
} else {
    console.error("❌ [EmailJS] Chưa nạp được thư viện SDK. Hãy kiểm tra lại thẻ script CDN trong phần <head>.");
}

/**
 * Hàm tổng hợp thông tin đơn hàng từ Snipcart và kích hoạt gửi mail qua EmailJS
 * @param {Object} order - Đối tượng dữ liệu đơn hàng trả về từ Snipcart
 */
function sendOrderConfirmationEmail(order) {
    console.log("🚀 [EmailJS] Bắt đầu xử lý dữ liệu gửi email cho đơn hàng...", order);

    // Trích xuất an toàn thông tin khách hàng (phòng trường hợp thông tin bị khuyết)
    const customerName = order.customer?.name || order.billingAddress?.fullName || "Khách hàng GreenGlow";
    const customerEmail = order.customer?.email || order.billingAddress?.email || order.email;
    const orderId = order.token || order.id || "N/A";
    
    // Định dạng số tiền thành định dạng Việt Nam Đồng trực quan (Ví dụ: 500.000 ₫)
    const orderTotal = typeof order.total === 'number' 
        ? order.total.toLocaleString('vi-VN') + ' ₫' 
        : order.total + ' ₫';

    // Ghép tên các sản phẩm đã mua thành chuỗi văn bản dễ đọc
    let orderItems = "Sản phẩm mỹ phẩm hữu cơ GreenGlow";
    if (order.items && order.items.items) {
        orderItems = order.items.items.map(item => `${item.name} (SL: ${item.quantity})`).join(', ');
    }

    // Đóng gói các tham số truyền khớp với các biến {{customer_name}}, {{customer_email}}... trên Template EmailJS
    const emailParams = {
        customer_name: customerName,
        customer_email: customerEmail,
        order_id: orderId,
        order_total: orderTotal,
        order_items: orderItems
    };

    // Tiến hành gọi API gửi mail của EmailJS (Dùng chính xác Service ID và Template ID của bạn)
    emailjs.send('service_p65f7pf', 'template_lqd21a2', emailParams)
        .then((response) => {
            console.log('🎉 [EmailJS] Thư xác nhận đơn hàng đã được gửi đi thành công!', response.status, response.text);
        })
        .catch((err) => {
            console.error('❌ [EmailJS] Gặp sự cố trong quá trình gửi mail:', err);
        });
}

/**
 * Đăng ký bộ lắng nghe sự kiện khi Snipcart đã sẵn sàng
 */
function initializeSnipcartListener() {
    console.log("✅ [Snipcart] Bộ lắng nghe đơn hàng của GreenGlow đã sẵn sàng hoạt động.");
    
    // Lắng nghe sự kiện khách bấm nút "Đặt hàng" thành công hoàn toàn
    Snipcart.events.on('order.completed', (order) => {
        console.log("🔔 [Snipcart] Xác nhận giao dịch đặt hàng thành công hoàn tất!");
        sendOrderConfirmationEmail(order);
    });
}

// Kiểm tra chống lỗi nạp bất đồng bộ của Snipcart SDK
if (window.Snipcart) {
    initializeSnipcartListener();
} else {
    document.addEventListener('snipcart.ready', () => {
        initializeSnipcartListener();
    });
}
