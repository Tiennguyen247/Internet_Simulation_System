# 🌐 Internet Simulation System
### Hiểu Internet trong 5 phút — Không cần biết gì trước cũng được

> **Trang web này giúp bạn nhìn thấy tận mắt những thứ đang xảy ra bên trong mạng máy tính mỗi khi bạn gửi tin nhắn, xem video, hay truy cập một trang web.**

---

## 📖 Mục đích

Khi bạn nhắn tin cho bạn bè, tin nhắn đó **không đi thẳng** từ điện thoại bạn sang điện thoại họ. Nó bị cắt nhỏ ra thành nhiều mảnh, đi qua hàng chục thiết bị, rồi mới được ráp lại ở đầu kia.

Nghe phức tạp? Trang web này biến tất cả quá trình đó thành **hình ảnh chuyển động** để bạn tự nhìn thấy — không cần đọc sách, không cần thuộc công thức.

---

## 🚀 Cách mở trang web

1. Tải về 3 file: `index.html`, `style.css`, `script.js`
2. Đặt cả 3 file vào **cùng một thư mục**
3. Double-click vào file `index.html`
4. Trang tự mở trong trình duyệt — **không cần cài thêm gì**

> ✅ Dùng tốt nhất trên Google Chrome hoặc Microsoft Edge

---

## 🗺️ Trang web có gì?

Trang web gồm **5 phần (module)**, mỗi phần giải thích một khái niệm quan trọng của mạng máy tính. Bạn chuyển qua lại bằng cách bấm vào các tab ở đầu trang.

---

## 📦 Module 1 — Packet Core
**Câu hỏi được trả lời:** *Dữ liệu đi từ máy A sang máy B như thế nào?*

### Khái niệm đằng sau
Hãy tưởng tượng bạn muốn gửi một cuốn sách cho người bạn ở tỉnh khác qua bưu điện. Thay vì gửi cả cuốn sách trong một hộp lớn, bưu điện sẽ **xé sách ra từng trang**, bỏ vào phong bì nhỏ, gửi đi — rồi bạn bè bạn nhận đủ các phong bì và ráp lại thành sách.

Mạng máy tính hoạt động y hệt vậy. Mỗi "phong bì" được gọi là **packet**.

### Cách dùng
| Ô nhập | Ý nghĩa | Ví dụ |
|--------|---------|-------|
| Kích thước message | Tổng dung lượng dữ liệu cần gửi | 8000 bits |
| Kích thước mỗi packet | Mỗi "phong bì" chứa bao nhiêu | 1000 bits |
| Số router trung gian | Dữ liệu đi qua bao nhiêu trạm | 3 |
| Tốc độ link R | Đường truyền nhanh hay chậm | 1000 bps |
| Propagation delay | Khoảng cách vật lý giữa các trạm | 10 ms |

**Bấm ▶ Simulate** → Bạn sẽ thấy:
- Chấm cam di chuyển từ máy gửi → qua các router → đến máy nhận
- Bảng cho biết mỗi packet đến nơi lúc mấy giây
- Công thức tính delay hiện ra kèm số cụ thể

### Bật Packet Loss
Tích vào ô **"Bật Packet Loss"** để mô phỏng tình huống **đường truyền kém** — một số packet bị mất trên đường đi (giống như wifi yếu). Bạn sẽ thấy hàng bị đánh dấu đỏ trong bảng.

---

## 🗺️ Module 2 — Routing
**Câu hỏi được trả lời:** *Khi có nhiều đường đi, máy tính chọn đường nào?*

### Khái niệm đằng sau
Từ Hà Nội đi Sài Gòn, bạn có thể đi nhiều tuyến đường khác nhau. Google Maps chọn đường ngắn nhất cho bạn. Router trong mạng máy tính làm y hệt — nó chạy một **thuật toán tìm đường** để chọn con đường tốt nhất cho dữ liệu.

### Cách dùng
1. Kéo thanh **"Số nodes"** để chọn số thiết bị trong mạng (4–8)
2. Bấm **🔀 Random Topology** để vẽ một mạng ngẫu nhiên
3. Chọn **Source** (điểm xuất phát) và **Destination** (điểm đến)
4. Chọn thuật toán:
   - **Dijkstra** — tìm đường ngắn nhất, dùng trong router thực tế (OSPF)
   - **Bellman-Ford** — tính từ nhiều hướng, dùng trong RIP protocol
5. Bấm **▶ Find Path**

**Bạn sẽ thấy:**
- Đường đi tối ưu highlight màu xanh lá
- Chấm cam di chuyển dọc theo đúng con đường đó
- Bảng **Routing Table** — khoảng cách từ điểm xuất phát đến mọi thiết bị trong mạng
- Con số trên mỗi đường là **"cost"** — càng nhỏ càng tốt

> 💡 **Thú vị:** Thử chọn thuật toán khác nhau — kết quả đường đi có thể giống hoặc khác nhau tùy cấu hình mạng.

---

## 🔗 Module 3 — TCP vs UDP
**Câu hỏi được trả lời:** *Tại sao video call đôi khi bị vỡ hình, còn tải file thì không bao giờ bị thiếu dữ liệu?*

### Khái niệm đằng sau
Có 2 cách gửi dữ liệu qua mạng:

**TCP** — giống gửi thư bảo đảm: gửi xong phải có xác nhận "đã nhận" (ACK). Nếu bị thất lạc, gửi lại. **Chậm hơn nhưng chắc chắn 100%.** → Dùng cho tải file, email, web.

**UDP** — giống phát thanh: cứ gửi liên tục, không cần xác nhận. Packet mất là mất luôn. **Nhanh hơn nhưng có thể mất dữ liệu.** → Dùng cho video call, game online, livestream.

### Cách dùng
1. Chọn **TCP** hoặc **UDP** bằng 2 nút lớn
2. Kéo thanh **"Số packets gửi"** (3–8 packets)
3. Kéo thanh **"Packet Loss Rate"** — càng cao càng nhiều packet bị mất
4. Bấm **▶ Simulate**

**Bạn sẽ thấy sơ đồ Time-Space Diagram:**
- Trục dọc = thời gian (từ trên xuống dưới)
- Đường chéo trái→phải = packet đang được gửi đi
- Đường chéo phải→trái (TCP) = ACK xác nhận đã nhận
- Dấu ❌ = packet bị mất
- Đường vàng đứt nét = gửi lại (retransmit)

> 💡 **Thử nghiệm hay:** Đặt loss rate 40%, chạy TCP rồi chạy UDP — so sánh Reliability % trong bảng thống kê. TCP luôn 100%, UDP thì không.

---

## 🌍 Module 4 — Application Layer
**Câu hỏi được trả lời:** *Khi gõ "google.com" vào trình duyệt, chuyện gì xảy ra đầu tiên?*

Module này có 2 phần — chuyển qua lại bằng 2 nút **DNS Resolution** và **HTTP Request**.

### Phần A: DNS Resolution
Máy tính chỉ hiểu địa chỉ IP như `142.250.185.78`, không hiểu tên miền như `google.com`. DNS là "danh bạ điện thoại" giúp chuyển tên → số.

**Cách dùng:**
1. Chọn tên miền từ danh sách
2. Tích "Cache hit" nếu muốn xem trường hợp máy đã nhớ địa chỉ rồi (nhanh hơn)
3. Bấm **▶ Resolve**

Bạn thấy từng bước hiện ra: Client hỏi Local DNS → Root DNS → TLD DNS → Authoritative NS → trả về IP. Đây là quá trình xảy ra trong vài ms mỗi khi bạn mở tab mới.

### Phần B: HTTP Request
Sau khi có IP, trình duyệt gửi yêu cầu lấy dữ liệu về. Đây gọi là HTTP request.

**Cách dùng:**
1. Chọn Method: `GET` (lấy dữ liệu) / `POST` (gửi dữ liệu lên)
2. Chọn URL (file cần lấy)
3. Chọn phiên bản HTTP
4. Bấm **▶ Send Request**

Bạn thấy đầy đủ nội dung request và response — đây chính xác là những gì trình duyệt của bạn đang gửi/nhận mỗi ngày, chỉ là thường bị ẩn đi.

---

## ⚡ Module 5 — End-to-End Simulation
**Câu hỏi được trả lời:** *Từ khi bấm Enter đến khi trang web hiện ra, hệ thống đã làm gì?*

Đây là phần **tổng hợp toàn bộ** — tất cả 4 module trên chạy liên tiếp nhau thành một pipeline hoàn chỉnh, đúng như cách Internet thực sự hoạt động.

### Cách dùng
1. Chọn **Domain** cần truy cập
2. Nhập **File cần tải** (KB) — kích thước trang web
3. Nhập **Tốc độ mạng** (Kbps) — mạng của bạn nhanh hay chậm
4. Bấm **🚀 Run Simulation**

**Bạn sẽ thấy 5 bước chạy tự động:**

| Bước | Tên | Chuyện gì xảy ra |
|------|-----|-----------------|
| 1 | 🔍 DNS | Tra cứu IP của domain |
| 2 | 🤝 TCP Handshake | Kết nối với server (SYN → SYN-ACK → ACK) |
| 3 | 📡 HTTP Request | Gửi yêu cầu lấy trang web |
| 4 | 🗺️ Packet Routing | Dijkstra chọn đường đi tối ưu |
| 5 | 📥 Data Received | Nhận dữ liệu, ráp lại thành trang web |

Cuối cùng hiện **tổng kết** với đầy đủ số liệu: DNS latency, RTT, số hops, thời gian tải — tính theo công thức thực tế.

> 💡 **Thử so sánh:** Chạy với tốc độ mạng 128 Kbps rồi chạy lại với 10,000 Kbps — xem tổng E2E delay thay đổi thế nào.

---

## ❓ Câu hỏi thường gặp

**Q: Trang web cần kết nối Internet không?**
Không. Tất cả chạy hoàn toàn offline trên máy bạn. Chỉ cần Chrome mở được file HTML là đủ.

**Q: Số liệu có phải số thật không?**
Công thức và thuật toán là thật — đúng như trong giáo trình. Topology mạng được random mỗi lần để minh họa, không phải topology của Internet thật.

**Q: Tôi nên xem module theo thứ tự nào?**
Nếu mới học: đi từ 1 → 5 theo thứ tự. Nếu đang ôn thi một chủ đề cụ thể: nhảy thẳng vào module đó.

**Q: Code được viết bằng gì?**
HTML + CSS + JavaScript thuần — không framework, không backend, không database. Mở được trên bất kỳ máy nào có trình duyệt.

---

## 📚 Bảng khái niệm nhanh

| Thuật ngữ | Giải thích đơn giản |
|-----------|---------------------|
| **Packet** | Mảnh nhỏ của dữ liệu, như trang sách trong phong bì |
| **Router** | Trạm trung chuyển, quyết định dữ liệu đi theo hướng nào |
| **IP Address** | Địa chỉ nhà của thiết bị trong mạng |
| **DNS** | Danh bạ điện thoại: chuyển tên miền → địa chỉ IP |
| **TCP** | Giao thức gửi có xác nhận — chắc chắn nhưng chậm hơn |
| **UDP** | Giao thức gửi không xác nhận — nhanh nhưng có thể mất |
| **Delay** | Thời gian để dữ liệu đi từ A đến B |
| **Throughput** | Tốc độ truyền dữ liệu thực tế (bits/giây) |
| **Dijkstra** | Thuật toán tìm đường ngắn nhất trong đồ thị |
| **HTTP** | Ngôn ngữ trình duyệt dùng để "nói chuyện" với web server |

---

*Được xây dựng để minh họa kiến thức môn Mạng Máy Tính.*
*Toàn bộ simulation chạy trên trình duyệt — không cần cài đặt, không cần Internet.*
