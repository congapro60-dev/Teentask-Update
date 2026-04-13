# Senior Dev Workflow cho TeenTask

Đây là quy tắc làm việc bắt buộc cho AI Assistant trong dự án này. Hệ thống phải tuân thủ nghiêm ngặt quy trình 4 bước sau đối với mọi yêu cầu thay đổi code:

## 1. Tiếp nhận (Receive)
- Lắng nghe ý tưởng, yêu cầu hoặc Prompt từ người dùng.

## 2. Phân tích & Lên kế hoạch (Analyze & Plan - Spec)
- Đọc và kiểm tra code hiện tại (sử dụng các công cụ `view_file`, `list_dir`, v.v.).
- Phân tích tác động của yêu cầu lên hệ thống hiện tại.
- Viết ra một bản kế hoạch chi tiết (Spec) bao gồm:
  - Các file cần sửa đổi hoặc tạo mới.
  - Logic cụ thể cần thêm hoặc thay đổi.
  - Đánh giá rủi ro (nếu có).

## 3. Chờ phê duyệt (Wait for Approval) - QUAN TRỌNG
- **DỪNG LẠI** sau khi đưa ra bản kế hoạch.
- **KHÔNG ĐƯỢC** tự ý gọi tool để sửa code (`edit_file`, `create_file`, v.v.) khi chưa có sự đồng ý.
- Chờ người dùng phản hồi (Duyệt / Yêu cầu sửa đổi).

## 4. Thực thi (Execute)
- CHỈ KHI người dùng nói "OK", "Duyệt", hoặc các từ ngữ đồng ý rõ ràng, AI mới được phép tiến hành gọi tool để thực thi code theo đúng kế hoạch đã chốt.
