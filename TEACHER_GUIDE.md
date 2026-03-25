# 🎮 Pokemon Evolution Arena - Hướng Dẫn Giáo Viên

## 📖 Giới Thiệu

Pokemon Evolution Arena là một ứng dụng game hóa giúp tăng sự tham gia và động lực học tập cho học sinh 4-6 tuổi trong lớp học robotics.

## 🚀 Cài Đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Mở trình duyệt tại: http://localhost:3000
```

## 🎯 Cách Sử Dụng Trong Lớp

### Bước 1: Thiết Lập Game

1. Mở ứng dụng trên màn hình lớn hoặc máy chiếu
2. Chọn số lượng nhóm (2-6 nhóm)
3. Đặt tên cho mỗi nhóm
4. Chọn dòng Pokemon đại diện cho mỗi nhóm:
   - Bulbasaur -> Ivysaur -> Venusaur
   - Charmander -> Charmeleon -> Charizard
   - Squirtle -> Wartortle -> Blastoise
   - Pichu -> Pikachu -> Raichu
   - Gastly -> Haunter -> Gengar
   - Dratini -> Dragonair -> Dragonite
5. Nhấn "Bắt Đầu Game"

### Bước 2: Trong Giờ Học

1. **Hiển thị màn hình game** cho cả lớp thấy
2. **Giao nhiệm vụ** cho các nhóm (ví dụ: lắp ráp robot, kéo dây đúng, giải câu đố)
3. **Quan sát** học sinh làm việc nhóm
4. **Cộng điểm** khi nhóm hoàn thành tốt:
   - Mở teacher panel
   - Chọn nhóm cần cộng điểm
   - Nhấn nút điểm phù hợp:
     - **+5**: Hoàn thành tốt
     - **+10**: Xuất sắc!
   - Nếu cần trừ điểm: nhấn **-5**

### Bước 3: Trải Nghiệm Evolution

**Hệ thống tien hoa Pokemon:**

| Stage | Điểm cần | Dạng Pokemon | Hiệu ứng |
| ----- | -------- | ------------ | -------- |
| 1     | 0-9      | Pokemon gốc  | Xuất hiện từ đầu trận |
| 2     | 10-19    | Tiến hóa 1   | Đổi sang loài tiếp theo, overlay và âm thanh |
| 3     | 20+      | Tiến hóa cuối| Đạt dạng cuối, glow nổi bật và hiển thị MAX |

**Khi nhóm tiến hóa:**

- Animation đặc biệt xuất hiện (rung, flash, aura)
- Âm thanh "power up"
- Pokemon chuyển sang đúng loài tiến hóa tiếp theo
- Học sinh sẽ rất hào hứng!

### Bước 4: Theo Dõi Tiến Độ

- **Màn hình chính**: Hiển thị tất cả các nhóm với nhân vật và điểm
- **Bảng xếp hạng**: Trong panel điều khiển, xem ranking thời gian thực
- **Thanh tiến trình**: Mỗi team card có thanh tiến trình đến lần tiến hóa tiếp theo

## 🎨 Tính Năng Nổi Bật

### ✨ Animation Đẹp Mắt

- Nhân vật nhảy nhót liên tục
- Hiệu ứng aura cho stage cao
- Evolution animation đổi trực tiếp tu loai truoc sang loai sau
- Pokemon artwork lon, ro, de nhin tren may chieu

### 🔊 Âm Thanh

- "Ding" khi cộng điểm
- "Whoosh + Power Up" khi tiến hóa
- "Celebrate" khi đạt stage cuối

### 💾 Lưu Trữ Tự Động

- Game tự động lưu vào trình duyệt
- Khi refresh trang, có thể tiếp tục game cũ

## 💡 Tips Sử Dụng

### Trong Lớp Học

1. **Cộng điểm ngay lập tức**: Khi nhóm hoàn thành, cộng điểm ngay để tạo phản hồi즉시 (immediate feedback)

2. **Khuyến khích cạnh tranh lành mạnh**:
   - "Team A đang dẫn đầu! Team B có thể đuổi kịp không?"
   - "Wow! Team C vừa tiến hóa lên Charizard!"

3. **Công bằng trong phân điểm**:
   - Nhiệm vụ dễ: +5
   - Nhiệm vụ trung bình: +10
   - Nếu cần điều chỉnh hành vi: -5

4. **Tận dụng moment tiến hóa**:
   - Dừng lớp lại khi có nhóm tiến hóa
   - Để cả lớp chứng kiến animation
   - Vỗ tay cổ vũ cùng nhau!

### Các Kịch Bản Sử Dụng

**Kịch bản 1: Lắp ráp robot**

```
- Giao nhiệm vụ: "Lắp ráp robot xe theo mẫu"
- Team hoàn thành đúng → +10 điểm
- Team hoàn thành nhanh nhất → bonus +5 điểm
```

**Kịch bản 2: Lập trình cơ bản**

```
- Giao nhiệm vụ: "Lập trình robot đi thẳng"
- Mỗi bước đúng → +5 điểm
- Hoàn thành toàn bộ → +10 điểm
```

**Kịch bản 3: Làm việc nhóm**

```
- Cả nhóm tham gia tích cực → +5 điểm
- Giúp đỡ nhóm khác → +10 điểm
```

## 🔧 Quản Lý Game

### Reset Game

- Nhấn "Reset Game" trong Control Panel
- Hoặc "Reset session" trong teacher panel
- Xác nhận reset
- Trở về màn hình thiết lập

### Điều Chỉnh Trong Game

- Có thể trừ điểm nếu cần (-5 điểm)
- Không giới hạn điểm tối đa
- Pokemon tối đa là stage 3 (tiến hóa cuối)

## 🎪 Tối Ưu Trải Nghiệm

### Cho Học Sinh 4-6 Tuổi

1. **Màu sắc tươi sáng**: Mỗi nhóm có màu riêng dễ nhận diện
2. **Animation rõ ràng**: Trẻ em thích nhìn nhân vật nhảy và tiến hóa
3. **Âm thanh vui tươi**: Tăng cảm giác hào hứng
4. **Đơn giản**: Không có thao tác phức tạp

### Cho Giáo Viên

1. **Control đơn giản**: Chỉ cần nhấn nút cộng điểm
2. **Real-time**: Điểm và ranking cập nhật ngay lập tức
3. **Dễ nhìn**: Màn hình lớn, chữ to, màu nổi bật
4. **Linh hoạt**: Có thể reset và bắt đầu lại bất cứ lúc nào

## 📱 Yêu Cầu Kỹ Thuật

- Trình duyệt: Chrome, Edge, Safari mới nhất
- Thiết bị: Laptop/Desktop kết nối màn hình lớn hoặc máy chiếu
- Internet: Không bắt buộc (chạy local)
- Độ phân giải khuyến nghị: 1920x1080 trở lên

## ❓ FAQ

**Q: Game có lưu khi tắt trình duyệt không?**
A: Có! Game tự động lưu vào localStorage. Khi mở lại, bạn có thể chọn tiếp tục hoặc bắt đầu mới.

**Q: Có giới hạn số nhóm không?**
A: Có thể tạo 2-6 nhóm.

**Q: Tôi có thể thay đổi nhân vật giữa chừng không?**
A: Hiện tại chưa được. Cần reset game và thiết lập lại.

**Q: Điểm có bị giới hạn không?**
A: Không! Nhóm có thể đạt bao nhiêu điểm cũng được.

**Q: Làm sao để màn hình fullscreen?**
A: Nhấn F11 trên Windows hoặc Cmd+Ctrl+F trên Mac.

## 🎉 Chúc Bạn Có Tiết Học Vui Vẻ!

Nếu có thắc mắc hoặc cần hỗ trợ, hãy liên hệ team phát triển.

---

Made with ❤️ for MindX Education
