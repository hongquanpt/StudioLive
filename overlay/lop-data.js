/*
 * DỮ LIỆU LỚP HỌC CHỮ (overlay/lop-data.js)
 * - Kho 2.076 câu hỏi tiếng Việt chia 30 chủ đề (gồm Đố mẹo, Lịch sử, Tiếng Anh).
 * - Bộ 330+ câu thoại Cô Giáo, 14 món quà thưởng đặt trên bàn, 10 bình chọn vui & 30 cặp chọn phe giờ ra chơi.
 * - Bộ lọc từ cấm & chuẩn hoá tên đọc an toàn trên sóng trực tiếp.
 * (Áp dụng từ https://github.com/workaipvlinh-byte/lop-hoc-chu — MIT License)
 */
(() => {
  'use strict';

  const RAW_GROUPS = [{"f":"01-truong-lop","cat":"Trường lớp","k":"Đây là thứ ở trường lớp.","s":"","q":[["PHẤN","Cô cầm cái này viết lên bảng đen.",1],["THƯỚC","Dùng để kẻ đường thẳng cho ngay.",1],["TẨY","Viết bút chì sai thì lấy cái này chùi đi.",1,["GÔM"]],["BÚT CHÌ","Ruột màu xám, càng gọt càng ngắn.",1],["COMPA","Có một chân nhọn, dùng để vẽ hình tròn.",2],["CẶP SÁCH","Ngày nào cũng đeo trên lưng tới trường.",1],["BẢNG CON","Tấm bảng nhỏ học sinh lớp một giơ lên cho cô xem.",2],["VỞ","Học sinh ghi bài vào đây, có dòng kẻ ô li.",1,["TẬP"]],["MỰC TÍM","Ngày xưa chấm ngòi bút vào lọ này để viết.",2],["GIẤY THẤM","Tờ giấy hồng đặt dưới tay cho khỏi lem mực.",3],["BẢNG ĐEN","Cô giáo viết bài lên đây cho cả lớp chép.",1],["LỚP TRƯỞNG","Bạn hô \"đứng dậy\" khi cô bước vào lớp.",2],["TRỰC NHẬT","Tới phiên thì ở lại quét lớp, lau bảng.",2],["TRỐNG TRƯỜNG","Đánh \"tùng tùng\" là hết giờ ra chơi.",2],["SỔ ĐẦU BÀI","Cô ghi nhận xét tiết học vào đây, bị ghi tên là sợ.",3],["KIỂM TRA MIỆNG","Đầu giờ cô gọi tên lên bảng trả bài.",3],["RA CHƠI","Giờ cả trường chạy ùa ra sân.",1],["KHĂN QUÀNG ĐỎ","Đội viên thắt cái này trên cổ.",3],["HỌC BẠ","Cuốn sổ ghi điểm tổng kết cả năm, có lời phê của cô.",2],["GIẤY KHEN","Học sinh giỏi cuối năm được phát tờ này.",2],["HỌC SINH GIỎI","Danh hiệu cuối năm của bạn điểm cao nhất lớp.",3],["HIỆU TRƯỞNG","Người đứng đầu cả trường.",2],["BẢO VỆ","Chú ngồi ở cổng trường, mở cổng đóng cổng.",2],["CĂNG TIN","Chỗ trong trường bán đồ ăn, nước uống.",2],["THƯ VIỆN","Phòng trong trường đầy sách cho học sinh mượn.",2],["SÂN TRƯỜNG","Chỗ chào cờ thứ hai đầu tuần.",2],["CHÀO CỜ","Sáng thứ hai cả trường đứng nghiêm làm việc này.",2],["ĐỒNG PHỤC","Quần áo giống nhau cả trường phải mặc.",2],["KHAI GIẢNG","Ngày năm tháng chín, mở đầu năm học mới.",2],["BẾ GIẢNG","Lễ cuối năm học trước khi nghỉ hè.",3],["NGHỈ HÈ","Ba tháng không phải đi học.",1],["BÀI TẬP","Cô giao về nhà làm.",1],["ĐIỂM MƯỜI","Điểm cao nhất trong bài kiểm tra.",1,["ĐIỂM 10"]],["ĐIỂM KÉM","Điểm thấp mang về sợ ba mẹ la.",2],["PHIẾU BÉ NGOAN","Tờ giấy nhỏ mầm non cuối tuần mới được phát.",3],["HỌP PHỤ HUYNH","Buổi ba mẹ lên trường gặp cô chủ nhiệm.",3],["CHỦ NHIỆM","Cô giáo phụ trách cả lớp.",2],["SÁCH GIÁO KHOA","Cuốn sách chính để học mỗi môn.",3],["BAO SÁCH","Lớp giấy bọc ngoài cho sách khỏi rách.",2],["NHÃN VỞ","Miếng giấy dán ngoài bìa ghi tên, lớp.",2],["HỘP BÚT","Đồ đựng bút, thước, tẩy.",1],["GỌT BÚT CHÌ","Đồ quay quay cho đầu bút chì nhọn lại.",3,["CHUỐT BÚT CHÌ"]],["BÚT MÁY","Cây bút bơm mực, nét thanh nét đậm.",2],["BÚT BI","Cây bút bấm tạch tạch, đầu có viên bi nhỏ.",1],["BÚT CHÌ MÀU","Hộp mười hai cây dùng để tô tranh.",3],["GIẤY KIỂM TRA","Tờ giấy có ô ghi điểm và lời phê.",3],["LỜI PHÊ","Dòng chữ đỏ cô ghi bên cạnh điểm.",2],["MỰC ĐỎ","Màu mực cô dùng để chấm bài.",2],["GHẾ ĐÁ","Chỗ ngồi dưới gốc cây sân trường.",2],["CỔNG TRƯỜNG","Tan học ba mẹ đứng chờ ở đây.",2],["TAN HỌC","Lúc trống đánh, cả lớp về nhà.",1],["ĐI MUỘN","Tới lớp trễ giờ, phải đứng ngoài cửa.",2],["TRỐN HỌC","Không tới lớp mà đi chơi lén.",2],["CHÉP PHẠT","Viết đi viết lại một câu nhiều lần vì bị phạt.",3],["QUAY CÓP","Lén nhìn tài liệu trong giờ thi.",2],["BÀI THI","Làm xong phải nộp lên cho giám thị.",1],["GIÁM THỊ","Người canh phòng thi.",2],["PHÒNG THI","Ngồi đây làm bài, có số báo danh.",2],["SỐ BÁO DANH","Dãy số mỗi thí sinh được phát khi đi thi.",3],["TỐT NGHIỆP","Học xong một cấp được trao bằng này.",2],["ĐẠI HỌC","Học xong cấp ba thì thi vào đây.",2],["MẪU GIÁO","Lớp học của các bé trước khi vào lớp một.",2,["MẦM NON"]],["CÔ GIÁO","Người mặc áo dài đứng lớp đây nè.",1],["HỌC TRÒ","Cách gọi khác của học sinh.",1],["BẠN THÂN","Người bạn ngồi cạnh chia nhau từng cái kẹo.",1],["BÀN ĐẦU","Chỗ ngồi gần bảng nhất.",1],["CUỐI LỚP","Chỗ ngồi xa bảng nhất, hay nói chuyện riêng.",2],["LAU BẢNG","Việc làm bằng khăn ướt sau mỗi tiết học.",1],["GIỜ TRUY BÀI","Mười lăm phút đầu giờ lớp trưởng kiểm tra bài.",3,["TRUY BÀI"]],["SINH HOẠT LỚP","Tiết cuối tuần cô nhận xét cả lớp.",3],["HỌC THÊM","Tan trường xong còn phải đi học ở nhà cô.",2],["THỜI KHÓA BIỂU","Bảng ghi hôm nào học môn gì.",3],["NGÀY NHÀ GIÁO","Ngày hai mươi tháng mười một tặng hoa thầy cô.",3]]},{"f":"02-con-vat","cat":"Con vật","k":"Đây là một con vật.","s":"","q":[["CON MÈO","Kêu meo meo, hay bắt chuột.",1,["MÈO"]],["CON CHÓ","Giữ nhà, thấy người lạ là sủa gâu gâu.",1,["CHÓ"]],["CON GÀ","Sáng nào cũng gáy ò ó o.",1,["GÀ"]],["CON VỊT","Kêu cạp cạp, bơi giỏi dưới ao.",1,["VỊT"]],["CON HEO","Ăn xong rồi ngủ, kêu ụt ịt.",1,["CON LỢN","HEO","LỢN"]],["CON TRÂU","Bạn của nhà nông, cày ruộng giỏi.",1,["TRÂU"]],["CON BÒ","Cho sữa tươi, kêu ò ò.",1,["BÒ"]],["CON NGỰA","Phi nước đại, có bờm dài.",2,["NGỰA"]],["CON DÊ","Có râu dưới cằm, kêu be be.",2,["DÊ"]],["CON THỎ","Tai dài, thích ăn cà rốt.",1,["THỎ"]],["CON CHUỘT","Gặm nhấm lén lút, sợ mèo.",1,["CHUỘT"]],["CON VOI","Con vật to nhất trên cạn, có vòi dài.",1,["VOI"]],["CON HỔ","Chúa sơn lâm, vằn vện.",1,["CON CỌP","HỔ","CỌP"]],["SƯ TỬ","Con đực có bờm, được gọi là vua của muôn thú.",2],["CON KHỈ","Leo trèo giỏi, thích ăn chuối.",1,["KHỈ"]],["HƯƠU CAO CỔ","Con vật có cổ dài nhất.",3],["NGỰA VẰN","Ngựa sọc đen trắng ở châu Phi.",2],["CÁ SẤU","Nằm phơi nắng bên sông, răng nhọn hoắt.",2],["CON RẮN","Bò trườn không có chân.",1,["RẮN"]],["CON RÙA","Đi chậm, mang mai trên lưng.",1,["RÙA"]],["CON ẾCH","Kêu ộp ộp sau cơn mưa.",1,["ẾCH"]],["CON CUA","Bò ngang, có hai cái càng.",1,["CUA"]],["CON TÔM","Lột vỏ chấm muối tiêu chanh, có râu dài.",1,["TÔM"]],["CON MỰC","Phun mực đen khi gặp nguy.",2,["MỰC"]],["BẠCH TUỘC","Có tám cái xúc tu.",2],["CÁ HEO","Thông minh, hay nhào lộn trên mặt biển.",2],["CÁ VOI","Loài to nhất đại dương, phun nước lên trời.",2],["CÁ MẬP","Hung dữ nhất biển, vây lưng nhọn.",2],["CÁ VÀNG","Nuôi trong bể kính, đuôi xòe.",2],["CHIM SẺ","Loài chim nhỏ xíu hay nhảy trên mái nhà.",2],["CHIM CÁNH CỤT","Chim không biết bay, sống ở xứ băng tuyết.",3],["CON CÚ","Mắt tròn to, thức đêm.",2,["CÚ MÈO"]],["CON VẸT","Bắt chước tiếng người.",2,["VẸT"]],["ĐẠI BÀNG","Chim săn mồi bay cao nhất.",2],["CHIM BỒ CÂU","Biểu tượng của hòa bình.",3,["BỒ CÂU"]],["CON CÒ","Lặn lội bờ ao trong ca dao.",2,["CÒ"]],["CHIM CÔNG","Xòe đuôi sặc sỡ như cái quạt.",3,["CON CÔNG"]],["CON ONG","Hút mật hoa, có ngòi chích.",1,["ONG"]],["CON BƯỚM","Cánh sặc sỡ bay quanh vườn hoa.",1,["BƯỚM"]],["CON KIẾN","Nhỏ xíu, đi thành hàng dài tha mồi.",1,["KIẾN"]],["CON MUỖI","Đêm vo ve, đốt sưng tay.",1,["MUỖI"]],["CON RUỒI","Bay vo ve quanh mâm cơm.",1,["RUỒI"]],["CON GIÁN","Ai thấy nó bay là hét toáng lên.",2,["GIÁN"]],["CON NHỆN","Giăng tơ ở góc nhà.",2,["NHỆN"]],["CHUỒN CHUỒN","Bay thấp thì mưa, bay cao thì nắng.",2],["ĐOM ĐÓM","Ban đêm bay lập lòe, đuôi phát sáng.",2],["CÀO CÀO","Côn trùng nhảy xa trên đồng cỏ.",3],["CON VE","Kêu ra rả mùa hè.",2,["VE SẦU"]],["CON DẾ","Đá nhau trong hộp diêm, kêu re re.",2,["DẾ"]],["CON ỐC","Mang nhà trên lưng, luộc chấm gừng.",2,["ỐC"]],["CON SÒ","Hai mảnh vỏ, nướng mỡ hành.",3,["SÒ"]],["CON NGHÊU","Sống dưới cát biển, nấu canh chua ngon.",3,["CON NGAO","NGHÊU","NGAO"]],["CON GẤU","Thích ăn mật ong, ngủ đông.",2,["GẤU"]],["GẤU TRÚC","Lông trắng đen, mê ăn tre.",2],["CON SÓC","Đuôi xù, ôm hạt dẻ trên cây.",2,["SÓC"]],["CON CÁO","Lông đỏ, nổi tiếng gian xảo trong truyện.",2,["CÁO"]],["CON SÓI","Tru lên mỗi đêm trăng tròn.",2,["SÓI","CHÓ SÓI"]],["CHUỘT TÚI","Nhảy bằng hai chân, có túi trước bụng, ở Úc.",3,["KANGAROO"]],["CON DƠI","Treo ngược mình ngủ ban ngày.",2,["DƠI"]],["CON NGỖNG","Kêu quác quác, hay rượt người lạ.",2,["NGỖNG"]],["CON CHIM","Có cánh, có lông vũ, biết hót.",1,["CHIM"]],["CON LƯƠN","Trơn tuột, nấu cháo rất ngon.",3,["LƯƠN"]],["CON CHẠCH","Giống lươn nhưng nhỏ, câu \"đầu voi đuôi...\"",3,["CHẠCH"]],["CON TẰM","Ăn lá dâu, nhả tơ.",3,["TẰM"]],["CON SÂU","Gặm lá cây, lớn lên thành bướm.",2,["SÂU"]],["CON GIUN","Sống trong đất, mưa xong bò lên mặt đường.",2,["GIUN","CON TRÙN"]],["CON TẮC KÈ","Đổi màu theo nơi đứng.",3,["TẮC KÈ"]],["CON THẰN LẰN","Đứt đuôi rồi mọc lại.",3,["THẰN LẰN"]],["CON LẠC ĐÀ","Có bướu trên lưng, đi sa mạc.",3,["LẠC ĐÀ"]],["CON HẢI CẨU","Vỗ tay giữ bóng trong rạp xiếc.",3,["HẢI CẨU"]],["CON SAO BIỂN","Hình ngôi sao năm cánh nằm dưới đáy biển.",3,["SAO BIỂN"]],["CON SỨA","Trong suốt như thạch, chạm vào bị ngứa rát.",3,["SỨA"]],["CON NAI","Có gạc trên đầu, chạy trong rừng.",2,["NAI"]],["CON TÊ GIÁC","Có sừng trên mũi, da dày.",3,["TÊ GIÁC"]]]},{"f":"03-cay-trai","cat":"Cây cối, hoa quả","k":"Đây là một loại quả.","s":"","q":[["QUẢ CHUỐI","Vỏ vàng, khỉ mê nhất.",1,["TRÁI CHUỐI","CHUỐI"]],["QUẢ CAM","Nhiều vitamin C, vắt lấy nước uống.",1,["TRÁI CAM","CAM"]],["QUẢ TÁO","Quả đỏ rơi trúng đầu Newton.",1,["TRÁI TÁO","TÁO"]],["QUẢ DƯA HẤU","Vỏ xanh ruột đỏ, ăn mùa hè.",2,["DƯA HẤU","TRÁI DƯA HẤU"]],["SẦU RIÊNG","Vua các loại trái cây, mùi thơm nức, gai tua tủa.",2],["MĂNG CỤT","Vỏ tím dày, ruột trắng như tép tỏi.",2],["CHÔM CHÔM","Quả đỏ có lông xù xì.",2],["THANH LONG","Vỏ hồng có tai xanh, ruột trắng chấm đen.",2],["MÍT","Quả to nhất, múi vàng, nhiều xơ.",1],["XOÀI","Chín vàng, ăn với muối ớt khi còn xanh.",1],["ỔI","Quả xanh giòn, chấm muối ớt.",1],["ĐU ĐỦ","Chín ruột cam, xanh thì nộm.",2],["NHÃN","Quả nhỏ vỏ nâu, cùi trắng ngọt lịm, đặc sản Hưng Yên.",2],["VẢI THIỀU","Đặc sản Lục Ngạn, vỏ đỏ sần.",2],["QUẢ BƯỞI","Múi to, Trung thu hay bày lên mâm.",1,["BƯỞI","TRÁI BƯỞI"]],["QUẢ DỪA","Uống nước xong nạo cơm.",1,["DỪA","TRÁI DỪA"]],["QUẢ KHẾ","Cắt ra hình ngôi sao, ăn một quả trả cục vàng.",2,["KHẾ"]],["QUẢ MẬN","Miền Bắc màu tím chua, miền Nam đỏ giòn.",2,["MẬN","TRÁI MẬN"]],["QUẢ NHO","Mọc thành chùm, làm rượu vang.",1,["NHO"]],["DÂU TÂY","Quả đỏ có hạt li ti ngoài vỏ, trồng ở Đà Lạt.",2],["VÚ SỮA","Bóp mềm rồi mút, nước trắng như sữa.",2],["MÃNG CẦU","Vỏ có mắt, ruột trắng nhiều hạt đen.",3,["NA"]],["QUẢ LÊ","Giòn nhiều nước, hình như cái hồ lô.",2,["LÊ"]],["QUẢ HỒNG","Chín đỏ mềm, ăn vào mùa thu.",2,["HỒNG"]],["QUẢ CÓC","Chua giòn, ăn với muối tôm.",2,["CÓC"]],["QUẢ ME","Chua lè, làm mứt hoặc nấu canh.",2,["ME"]],["QUẢ CHANH","Vắt vào nước mắm cho chua.",1,["CHANH"]],["QUẢ ỚT","Ăn vào cay xé lưỡi.",1,["ỚT"]],["QUẢ CÀ CHUA","Đỏ mọng, nấu canh hoặc làm sốt.",1,["CÀ CHUA"]],["DƯA CHUỘT","Thái lát ăn kèm cơm, mát.",2,["DƯA LEO"]],["CÀ RỐT","Củ màu cam, thỏ thích ăn.",1,[],"Đây là một loại rau củ."],["KHOAI LANG","Củ nướng thơm lừng mùa đông.",2,[],"Đây là một loại rau củ."],["KHOAI TÂY","Củ dùng để chiên thành que.",2,[],"Đây là một loại rau củ."],["CỦ HÀNH","Phi lên thơm phức.",2,["HÀNH"],"Đây là một loại rau củ."],["CỦ TỎI","Ma cà rồng sợ nhất.",2,["TỎI"],"Đây là một loại rau củ."],["CỦ GỪNG","Cay nồng, pha trà uống ấm bụng.",2,["GỪNG"],"Đây là một loại rau củ."],["BẮP CẢI","Lá cuộn tròn thành bắp.",2,[],"Đây là một loại rau củ."],["RAU MUỐNG","Rau luộc chấm nước tương, món quốc dân.",2,[],"Đây là một loại rau củ."],["SU HÀO","Củ xanh nhạt, xào hoặc nấu canh.",3,[],"Đây là một loại rau củ."],["BÍ ĐỎ","Ma Halloween khoét làm đèn.",2,["BÍ NGÔ"],"Đây là một loại rau củ."],["MƯỚP ĐẮNG","Ăn đắng nhưng mát, còn gọi là khổ qua.",3,["KHỔ QUA"],"Đây là một loại rau củ."],["CÂY TRE","Mọc quanh lũy làng, Thánh Gióng nhổ đánh giặc.",2,["TRE"],"Đây là một loại cây."],["CÂY ĐA","Cây cổ thụ đầu làng, có rễ buông thõng.",2,["ĐA"],"Đây là một loại cây."],["CÂY PHƯỢNG","Nở đỏ rực mùa hè, báo hiệu nghỉ học.",2,["HOA PHƯỢNG"],"Đây là một loại cây."],["CÂY BÀNG","Lá đỏ mùa đông, trồng ở sân trường.",3,["BÀNG"],"Đây là một loại cây."],["CÂY THÔNG","Lá kim, trang trí ngày Noel.",2,["THÔNG"],"Đây là một loại cây."],["CÂY XƯƠNG RỒNG","Cây đầy gai sống ở sa mạc.",3,["XƯƠNG RỒNG"],"Đây là một loại cây."],["CÂY LÚA","Cây cho ra hạt gạo.",1,["LÚA"],"Đây là một loại cây."],["CÂY NGÔ","Bắp có râu, luộc hay nướng đều ngon.",2,["BẮP","CÂY BẮP"],"Đây là một loại cây."],["CÂY MÍA","Ép lấy nước ngọt uống mùa hè.",2,["MÍA"],"Đây là một loại cây."],["HOA SEN","Quốc hoa Việt Nam, gần bùn mà chẳng hôi.",2,[],"Đây là một loài hoa."],["HOA HỒNG","Đẹp mà có gai, tặng người yêu.",1,[],"Đây là một loài hoa."],["HOA MAI","Hoa vàng chưng Tết miền Nam.",2,[],"Đây là một loài hoa."],["HOA ĐÀO","Hoa hồng chưng Tết miền Bắc.",2,[],"Đây là một loài hoa."],["HOA CÚC","Hoa vàng nhiều cánh nhỏ, nở mùa thu.",2,[],"Đây là một loài hoa."],["HOA HƯỚNG DƯƠNG","Luôn quay theo mặt trời.",3,[],"Đây là một loài hoa."],["HOA LAN","Hoa quý, treo chậu ở hiên nhà.",2,[],"Đây là một loài hoa."],["HOA SỮA","Mùa thu Hà Nội thơm nồng mùi hoa này.",3,[],"Đây là một loài hoa."],["HOA BAN","Hoa trắng của núi rừng Tây Bắc.",3,[],"Đây là một loài hoa."],["HOA GẠO","Hoa đỏ nở tháng ba trên cây cao đầu làng.",3,[],"Đây là một loài hoa."],["HOA MƯỜI GIỜ","Hoa nhỏ nở đúng giữa buổi sáng.",3,[],"Đây là một loài hoa."],["HOA TULIP","Hoa nổi tiếng của Hà Lan.",3,["TULIP"],"Đây là một loài hoa."],["HOA OẢI HƯƠNG","Hoa tím nổi tiếng ở Pháp, còn gọi lavender.",3,["LAVENDER"],"Đây là một loài hoa."],["CÂY CAU","Thân thẳng tắp, quả ăn với trầu.",3,["CAU"],"Đây là một loại cây cỏ."],["LÁ TRẦU","Lá têm với cau, mở đầu câu chuyện.",3,["TRẦU"],"Đây là một loại cây cỏ."],["CÂY DỪA","Thân cao, quả cho nước ngọt mát.",2,[],"Đây là một loại cây cỏ."],["NẤM","Mọc sau mưa, có loại ăn được, có loại độc.",2,[],"Đây là một loại cây cỏ."],["CỎ","Mọc khắp sân, trâu bò thích gặm.",1,[],"Đây là một loại cây cỏ."],["RÊU","Lớp xanh trơn mọc trên đá ẩm.",2,[],"Đây là một loại cây cỏ."],["QUẢ ĐÀO","Tôn Ngộ Không ăn trộm ở vườn của Vương Mẫu.",3,["ĐÀO TIÊN"]],["HẠT ĐIỀU","Hạt rang muối, đặc sản Bình Phước.",3,["ĐIỀU"],"Đây là một loại hạt hoặc củ."],["HẠT SEN","Nấu chè, giúp ngủ ngon.",3,[],"Đây là một loại hạt hoặc củ."],["ĐẬU PHỘNG","Rang lên ăn với xôi, còn gọi lạc.",2,["LẠC","CỦ LẠC"],"Đây là một loại hạt hoặc củ."],["CỦ SẮN","Luộc chấm đường, còn gọi khoai mì.",3,["SẮN","KHOAI MÌ"],"Đây là một loại hạt hoặc củ."],["QUẢ BƠ","Xay sinh tố béo ngậy.",2,["BƠ"]]]},{"f":"04-mon-an","cat":"Món ăn Việt","k":"Đây là món ăn trong bữa cơm người Việt.","s":"","q":[["PHỞ","Món nước nổi tiếng của Hà Nội, bánh dẹt, nước dùng xương.",1],["BÁNH MÌ","Ổ bánh giòn kẹp pate, chả, đồ chua.",1],["BÚN CHẢ","Bún ăn với thịt nướng than, chấm nước mắm chua ngọt.",2],["BÁNH CHƯNG","Bánh vuông gói lá dong, ăn ngày Tết.",2],["BÁNH TÉT","Bánh tròn dài gói lá chuối, Tết miền Nam.",2],["CƠM TẤM","Món cơm Sài Gòn có sườn nướng, bì, chả.",2],["NEM RÁN","Cuốn bánh đa nem rồi chiên vàng giòn.",2,["CHẢ GIÒ"]],["BÁNH XÈO","Đổ bột kêu xèo xèo, ăn cuốn rau sống.",2],["GỎI CUỐN","Bánh tráng cuốn tôm, thịt, bún, rau, không chiên.",2],["BÚN BÒ HUẾ","Bún sợi to, nước cay, có sả và giò heo.",3],["MÌ QUẢNG","Đặc sản Quảng Nam, sợi vàng, ít nước.",3],["CAO LẦU","Đặc sản Hội An, sợi dai, dùng nước giếng Bá Lễ.",3],["HỦ TIẾU","Món sợi nhỏ trong nổi tiếng Nam Vang.",2],["BÁNH CUỐN","Bột tráng mỏng cuốn nhân thịt mộc nhĩ.",2],["BÁNH BAO","Bánh tròn trắng hấp, nhân thịt trứng cút.",2],["XÔI","Nếp đồ chín, ăn sáng gói lá chuối.",1],["CHÁO","Gạo nấu nhừ, ăn khi ốm.",1],["CƠM","Món ăn bữa nào cũng có.",1],["CANH CHUA","Nấu với me, cà chua, thơm, giá.",2],["CÁ KHO TỘ","Kho trong nồi đất, nước sánh màu cánh gián.",3],["THỊT KHO TRỨNG","Món Tết miền Nam, nước dừa kho.",3],["RAU MUỐNG XÀO TỎI","Món rau xào xanh giòn, thơm mùi tỏi phi.",3],["ĐẬU PHỤ","Khối trắng mềm làm từ đậu nành, rán hay sốt cà.",2,["ĐẬU HŨ"]],["NƯỚC MẮM","Nước chấm làm từ cá, Phú Quốc nổi tiếng.",1],["MẮM TÔM","Chấm bún đậu, mùi nồng đặc trưng.",2],["BÚN ĐẬU","Đi kèm mắm tôm và chả cốm.",2,["BÚN ĐẬU MẮM TÔM"]],["CHẢ CÁ","Món Lã Vọng ăn với thì là.",3],["BÚN RIÊU","Bún có gạch cua nổi trên mặt.",2],["BÁNH CĂN","Bánh nhỏ đổ khuôn đất, đặc sản Phan Thiết, Đà Lạt.",3],["BÁNH KHỌT","Bánh nhỏ giòn rụm, đặc sản Vũng Tàu.",3],["BÁNH BÈO","Bánh nhỏ trong chén, rắc tôm chấy, đặc sản Huế.",3],["BÁNH ĐA","Bánh tráng nướng giòn, ăn với ốc hoặc cua.",2,["BÁNH TRÁNG"]],["BÁNH GIÒ","Bánh gói lá chuối hình chóp, nhân thịt mộc nhĩ.",3],["BÁNH TRÔI","Viên bột nếp nhân đường, ăn Tết Hàn thực.",3],["BÁNH CHAY","Ăn cùng bánh trôi ngày ba tháng ba.",3],["BÁNH DÀY","Bánh tròn trắng tượng trưng cho trời.",3],["BÁNH CỐM","Đặc sản Hàng Than, màu xanh lá cốm.",3],["NEM CHUA","Đặc sản Thanh Hóa, chua nhẹ, gói lá chuối.",3],["GIÒ LỤA","Gói lá chuối, khoanh tròn trắng hồng, ăn Tết.",3,["CHẢ LỤA"]],["LẨU","Nồi nước sôi giữa bàn, nhúng rau thịt.",1],["CƠM CHÁY","Lớp cơm giòn dính đáy nồi.",2],["BÒ BÍA","Cuốn bánh tráng với củ sắn, lạp xưởng, trứng.",3],["BÁNH ƯỚT","Bánh mỏng mềm ăn với chả lụa.",3],["BÚN MẮM","Món miền Tây nấu từ mắm cá linh, cá sặc.",3],["BÁNH CANH","Sợi bột to dai, nấu với cua hoặc giò heo.",2],["MÌ TÔM","Ăn cứu đói lúc nửa đêm, gói vài nghìn.",1,["MÌ GÓI"]],["TRỨNG VỊT LỘN","Luộc ăn với rau răm, muối tiêu.",3,["HỘT VỊT LỘN"]],["CHÁO LÒNG","Cháo nấu với lòng heo, ăn với quẩy.",3],["BÁNH TRÁNG TRỘN","Món ăn vặt Sài Gòn, trộn khô bò, trứng cút.",3],["XÔI XÉO","Xôi phủ đậu xanh và hành phi.",3],["BÚN THANG","Bún Hà Nội có trứng tráng, giò, gà xé.",3],["CÁ VIÊN CHIÊN","Xiên que ăn vặt trước cổng trường.",3],["CHÈ","Món ngọt đủ loại: đậu đỏ, bưởi, khúc bạch.",1],["BÁNH FLAN","Bánh trứng mềm mịn, có lớp caramen.",2,["BÁNH PLAN","CARAMEN"]],["SỮA CHUA","Ăn lạnh, men tốt cho tiêu hóa.",2,["DA UA"]],["BÁNH TRUNG THU","Bánh nướng, bánh dẻo ăn rằm tháng tám.",3],["MỨT","Món ngọt bày khay ngày Tết, có loại dừa, gừng.",2],["DƯA HÀNH","Ăn với thịt mỡ ngày Tết, chua giòn.",3],["GÀ LUỘC","Mâm cúng giao thừa không thể thiếu món này.",2],["NỘM","Rau củ trộn chua ngọt, còn gọi gỏi.",2,["GỎI"]],["BÁNH QUẨY","Que bột chiên giòn, chấm cháo hoặc phở.",3,["QUẨY","GIÒ CHÁO QUẨY"]],["CƠM RANG","Cơm nguội đảo chảo với trứng.",2,["CƠM CHIÊN"]],["TRỨNG ỐP LA","Trứng chiên giữ nguyên lòng đỏ tròn.",3],["XÚC XÍCH","Thịt xay nhồi vỏ dài, nướng ăn vặt.",2],["LẠP XƯỞNG","Thịt nhồi phơi khô, màu đỏ, ăn với xôi.",3],["BÁNH GẠO","Món ăn vặt giòn, có loại Hàn Quốc nhúng sốt cay.",3],["NƯỚC CHẤM","Pha chua cay mặn ngọt, chén nhỏ giữa mâm.",2],["CANH CUA","Nấu với rau đay, mồng tơi, ăn với cà pháo.",3],["CÀ PHÁO","Quả nhỏ tròn muối chua giòn tan.",3],["BÁNH TÔM","Đặc sản Hồ Tây, chiên giòn với khoai lang.",3],["BÚN CÁ","Bún nấu với cá rán, thì là, đặc sản Hải Phòng.",3]]},{"f":"05-do-uong-an-vat","cat":"Đồ uống, ăn vặt","k":"Đây là đồ uống hoặc món ăn vặt.","s":"","q":[["TRÀ SỮA","Có trân châu đen, giới trẻ uống hằng ngày.",1],["TRÂN CHÂU","Viên đen dai dai trong ly trà sữa.",2],["CÀ PHÊ","Người Việt uống buổi sáng cho tỉnh táo.",1],["CÀ PHÊ SỮA ĐÁ","Pha phin, thêm sữa đặc rồi đổ đá.",3],["BẠC XỈU","Nhiều sữa ít cà phê, gốc tiếng Hoa.",3],["CÀ PHÊ TRỨNG","Đặc sản Hà Nội, lớp kem trứng đánh bông.",3],["TRÀ ĐÁ","Uống vỉa hè, ly nhựa, vài nghìn đồng.",1],["NƯỚC MÍA","Ép từ cây, thêm quất cho thơm.",2],["NƯỚC DỪA","Uống thẳng từ quả, giải khát.",2],["SINH TỐ","Xay trái cây với sữa và đá.",2],["NƯỚC CAM","Vắt từ quả, nhiều vitamin C.",1],["SỮA TƯƠI","Bò cho, uống mỗi sáng để cao.",2],["SỮA ĐẬU NÀNH","Xay từ hạt đậu, uống nóng buổi sáng.",3],["NƯỚC NGỌT","Có ga, uống xong ợ một cái.",1],["TRÀ CHANH","Uống ngồi vỉa hè, chém gió với bạn.",2],["TRÀ ĐÀO","Có miếng quả đào vàng trong ly.",2],["NƯỚC SÂM","Nấu từ rễ tranh, mía lau, mát gan.",3],["RAU MÁ","Xay uống giải nhiệt, màu xanh lá.",3,["NƯỚC RAU MÁ"]],["KEM","Mút que lạnh buốt mùa hè.",1],["KEM ỐC QUẾ","Kem đặt trên chiếc bánh hình nón giòn.",3],["KẸO MÚT","Kẹo có que cầm, ngậm mãi không hết.",2],["KẸO DẺO","Kẹo mềm hình con gấu nhiều màu.",2],["KẸO BÔNG","Đường kéo thành sợi như đám mây hồng.",2],["KẸO KÉO","Kẹo mạch nha kéo dài, rắc lạc.",3],["KẸO CAO SU","Nhai mãi không nuốt, thổi được bong bóng.",2],["SÔ CÔ LA","Màu nâu, ngọt đắng, tặng nhau Valentine.",2,["CHOCOLATE"]],["BIM BIM","Gói snack giòn rụm, xé ra kêu rột roạt.",1,["SNACK"]],["BỎNG NGÔ","Ăn khi xem phim ở rạp.",2,["BẮP RANG"]],["KHOAI TÂY CHIÊN","Que vàng giòn, chấm tương cà.",3],["TƯƠNG ỚT","Chai đỏ cay, chấm gì cũng được.",2],["TƯƠNG CÀ","Chai đỏ ngọt chua, chấm khoai chiên.",2],["BÁNH TRÁNG NƯỚNG","Pizza Đà Lạt, nướng trên than hồng.",3],["NEM NƯỚNG","Xiên thịt nướng, cuốn bánh tráng, đặc sản Nha Trang.",3],["XOÀI LẮC","Xoài xanh cho vào hộp lắc với muối ớt.",3],["CHÈ KHÚC BẠCH","Viên thạch sữa vuông trắng, rắc hạnh nhân.",3],["CHÈ BƯỞI","Có cùi bưởi giòn sần sật, nước cốt dừa.",3],["CHÈ BẮP","Nấu từ ngô, rưới nước cốt dừa.",3,["CHÈ NGÔ"]],["THẠCH","Mát lạnh, rung rinh, ăn với chè.",2,["RAU CÂU"]],["TÀO PHỚ","Đậu hũ non ăn với nước đường gừng.",3,["TÀU HŨ","ĐẬU HŨ NƯỚC ĐƯỜNG"]],["BÁNH QUY","Bánh giòn tròn, ăn với sữa.",2],["BÁNH SINH NHẬT","Có nến để thổi, ước một điều.",3],["BÁNH CUPCAKE","Bánh nhỏ trong cốc giấy, phủ kem.",3,["CUPCAKE"]],["BÁNH BÔNG LAN","Bánh xốp mềm vàng, thơm trứng.",3],["BÁNH PIA","Đặc sản Sóc Trăng, nhân đậu sầu riêng.",3],["BÁNH ĐẬU XANH","Đặc sản Hải Dương, hộp nhỏ ăn với trà.",3],["KẸO DỪA","Đặc sản Bến Tre.",2],["MẬT ONG","Ong làm ra, vàng sánh, ngọt lịm.",2],["ĐƯỜNG","Bột trắng ngọt, cho vào cà phê.",1],["MUỐI","Hạt trắng mặn, làm từ nước biển.",1],["NƯỚC LỌC","Không màu không mùi, uống nhiều cho đẹp da.",1],["NƯỚC ĐÁ","Viên lạnh thả vào ly.",1],["SỮA ĐẶC","Hộp ông Thọ, quậy cà phê.",2],["BÁNH PIZZA","Bánh tròn nước Ý, cắt hình tam giác.",2,["PIZZA"]],["HAMBURGER","Bánh kẹp thịt bò tròn kiểu Mỹ.",3,["BÁNH HAMBURGER"]],["GÀ RÁN","Món của tiệm có ông già râu trắng.",2],["MÌ CAY","Món Hàn có bảy cấp độ cay.",2],["TOKBOKKI","Bánh gạo cay Hàn Quốc màu đỏ.",3,["BÁNH GẠO CAY"]],["KIMCHI","Cải thảo muối cay của Hàn Quốc.",2],["SUSHI","Cơm cuộn cá sống của Nhật.",2],["TRÀ XANH","Lá chè pha uống, vị chát nhẹ, còn gọi matcha.",2,["MATCHA"]],["NƯỚC ÉP","Trái cây ép lấy nước nguyên chất.",2],["NƯỚC TĂNG LỰC","Uống vào thức khuya ôn bài.",3],["BÁNH RÁN","Viên bột nếp chiên, lăn đường hoặc nhân đậu.",3,["BÁNH CAM"]],["BÁNH TIÊU","Bánh chiên phồng rỗng ruột, rắc mè.",3],["BÁNH DONUT","Bánh tròn có lỗ giữa, phủ đường.",3,["DONUT"]],["HẠT DƯA","Cắn tách tách ngày Tết, vỏ đỏ.",2],["Ô MAI","Đặc sản Hàng Đường, mơ mận ngâm chua ngọt.",2],["CƠM NẮM","Cơm nén chặt mang đi ăn, có muối vừng.",2],["MUỐI VỪNG","Rắc lên cơm nắm, rang thơm.",3,["MUỐI MÈ"]],["BÁNH MÌ QUE","Bánh dài nhỏ như que, đặc sản Hải Phòng.",3]]},{"f":"06-nghe-nghiep","cat":"Nghề nghiệp","k":"Đây là một nghề.","s":"","q":[["BÁC SĨ","Mặc áo blouse trắng, khám bệnh.",1],["Y TÁ","Tiêm thuốc, chăm bệnh nhân cùng bác sĩ.",1,["ĐIỀU DƯỠNG"]],["GIÁO VIÊN","Người đứng lớp dạy học trò.",1],["PHI CÔNG","Người lái máy bay.",2],["TIẾP VIÊN","Phát nước, hướng dẫn thắt dây an toàn trên máy bay.",2,["TIẾP VIÊN HÀNG KHÔNG"]],["NÔNG DÂN","Người trồng lúa, làm ruộng.",1],["NGƯ DÂN","Người ra khơi đánh cá.",2],["THỢ MAY","Người đo người, cắt vải, may áo quần.",2],["THỢ CẮT TÓC","Người cầm kéo tông đơ cho bạn đẹp trai.",3],["ĐẦU BẾP","Người nấu ăn trong nhà hàng.",1],["CÔNG AN","Giữ gìn trật tự, bắt kẻ gian.",1],["LÍNH CỨU HỎA","Chữa cháy, cứu người, gọi số một trăm mười bốn.",3,["CỨU HỎA"]],["BỘ ĐỘI","Mặc quân phục xanh, bảo vệ Tổ quốc.",1],["KỸ SƯ","Người thiết kế, xây cầu, làm máy móc.",2,["KĨ SƯ"]],["KIẾN TRÚC SƯ","Người vẽ bản thiết kế ngôi nhà.",3],["THỢ XÂY","Người trộn hồ, xây tường gạch.",2],["THỢ ĐIỆN","Sửa dây điện, lắp bóng đèn.",2],["THỢ SỬA XE","Vá lốp, thay nhớt ở tiệm ven đường.",3],["TÀI XẾ","Người lái xe chở khách.",2,["LÁI XE"]],["XE ÔM","Chở khách bằng xe máy, giờ đặt qua ứng dụng.",2],["SHIPPER","Người giao hàng tận nhà.",2,["NGƯỜI GIAO HÀNG"]],["BƯU TÁ","Người đưa thư ngày xưa.",3],["NHÀ BÁO","Người viết tin tức, đưa tin.",2,["PHÓNG VIÊN"]],["CA SĨ","Người đi hát chuyên nghiệp.",1],["DIỄN VIÊN","Người đóng phim.",1],["NGƯỜI MẪU","Người trình diễn thời trang trên sàn catwalk.",2],["HỌA SĨ","Người vẽ tranh.",2],["NHẠC SĨ","Người sáng tác bài hát.",2],["NHÀ THƠ","Người làm thơ.",2],["NHIẾP ẢNH GIA","Người chụp ảnh chuyên nghiệp.",3],["LUẬT SƯ","Người bào chữa ở tòa án.",2],["THẨM PHÁN","Người gõ búa tuyên án ở tòa.",3],["KẾ TOÁN","Người tính toán sổ sách tiền bạc của công ty.",2],["GIAO DỊCH VIÊN","Nhân viên ngồi quầy ngân hàng nhận tiền gửi.",3],["THU NGÂN","Người đứng quầy tính tiền ở siêu thị.",2],["BÁN HÀNG","Người đứng quầy mời khách mua đồ.",1],["DƯỢC SĨ","Người bán thuốc ở nhà thuốc.",2],["NHA SĨ","Bác sĩ chữa răng.",2],["BÁC SĨ THÚ Y","Người chữa bệnh cho chó mèo.",3,["THÚ Y"]],["LẬP TRÌNH VIÊN","Người viết code cho máy tính.",3,["DEV"]],["STREAMER","Người phát trực tiếp chơi game.",2],["YOUTUBER","Người làm video đăng lên kênh có nút đỏ.",2],["TIKTOKER","Người làm video ngắn trên ứng dụng có nốt nhạc.",2],["THỢ MỘC","Người làm đồ gỗ: bàn ghế, tủ.",2],["THỢ RÈN","Người đập sắt nung đỏ thành dao.",3],["THỢ GỐM","Người nặn đất sét thành bình, nung trong lò.",3],["THỢ KIM HOÀN","Người làm nhẫn, dây chuyền vàng bạc.",3],["THỢ SĂN","Người vào rừng bắt thú.",2],["LAO CÔNG","Người quét dọn đường phố, trường học.",2,["CÔNG NHÂN VỆ SINH"]],["CÔNG NHÂN","Người làm việc trong nhà máy.",1],["BẢO MẪU","Người trông trẻ thuê.",2],["GIÚP VIỆC","Người làm việc nhà cho gia đình khác.",2,["OSIN"]],["THUYỀN TRƯỞNG","Người chỉ huy con tàu.",3],["PHI HÀNH GIA","Người bay vào vũ trụ.",3],["NHÀ KHOA HỌC","Người làm thí nghiệm, nghiên cứu.",3],["BÁC SĨ PHẪU THUẬT","Bác sĩ cầm dao mổ trong phòng mổ.",3],["THỢ ẢNH","Người chụp ảnh cưới, ảnh kỷ yếu.",2],["MC","Người dẫn chương trình.",1,["NGƯỜI DẪN CHƯƠNG TRÌNH"]],["DJ","Người chơi nhạc ở quán bar.",1],["VẬN ĐỘNG VIÊN","Người thi đấu thể thao chuyên nghiệp.",3],["HUẤN LUYỆN VIÊN","Người chỉ đạo đội bóng ngoài đường biên.",3],["TRỌNG TÀI","Người thổi còi, rút thẻ vàng thẻ đỏ.",2],["ẢO THUẬT GIA","Người biến ra con thỏ từ chiếc mũ.",3],["CHÚ HỀ","Mũi đỏ, làm trò cho trẻ con cười.",2,["HỀ"]],["THẦY BÓI","Người xem chỉ tay đoán tương lai.",3],["THỢ LẶN","Người mặc đồ bơi, đeo bình dưỡng khí xuống biển.",3],["GIÁM ĐỐC","Người đứng đầu công ty.",2,["SẾP"]],["KIỂM LÂM","Người bảo vệ rừng.",3],["THỢ NAIL","Người sơn móng tay.",2,["LÀM NAIL"]],["THỢ TRANG ĐIỂM","Người make up cho cô dâu.",3,["MAKEUP"]],["HƯỚNG DẪN VIÊN","Người dẫn khách du lịch tham quan.",3]]},{"f":"07-dia-danh","cat":"Đất nước Việt Nam","k":"Đây là địa danh của Việt Nam.","s":"","q":[["HÀ NỘI","Thủ đô của Việt Nam.",1],["SÀI GÒN","Tên cũ của Thành phố Hồ Chí Minh.",1],["ĐÀ NẴNG","Thành phố có cầu Rồng phun lửa.",2],["HẢI PHÒNG","Thành phố hoa phượng đỏ, quê bánh đa cua.",2],["HUẾ","Cố đô có Đại Nội, sông Hương.",1],["HỘI AN","Phố cổ đèn lồng ở Quảng Nam.",2],["ĐÀ LẠT","Thành phố ngàn hoa, sương mù, se lạnh.",2],["NHA TRANG","Thành phố biển nổi tiếng ở Khánh Hòa.",2],["VŨNG TÀU","Thành phố biển gần Sài Gòn nhất, có tượng Chúa.",2],["PHÚ QUỐC","Hòn đảo lớn nhất Việt Nam.",2],["CÔN ĐẢO","Quần đảo có nhà tù xưa, nay là nơi du lịch.",3],["HẠ LONG","Vịnh có hàng nghìn đảo đá, di sản thế giới.",2],["SA PA","Thị trấn trong sương ở Lào Cai, có ruộng bậc thang.",2],["MỘC CHÂU","Cao nguyên hoa mận trắng, đồi chè xanh ở Sơn La.",3],["HÀ GIANG","Tỉnh cực Bắc, có cột cờ Lũng Cú.",2],["CÀ MAU","Mũi đất cực Nam Tổ quốc.",2],["CẦN THƠ","Thủ phủ miền Tây, có chợ nổi Cái Răng.",2],["SÔNG HỒNG","Con sông nước đỏ nặng phù sa chảy qua Hà Nội.",2],["SÔNG HƯƠNG","Dòng sông thơ mộng chảy qua Huế.",2],["SÔNG CỬU LONG","Chín nhánh sông đổ ra biển ở miền Tây.",3,["SÔNG MÊ KÔNG"]],["HỒ GƯƠM","Hồ có tháp Rùa giữa lòng Hà Nội.",2,["HỒ HOÀN KIẾM"]],["HỒ TÂY","Hồ lớn nhất Hà Nội, có bánh tôm.",2],["VĂN MIẾU","Trường đại học đầu tiên của Việt Nam.",2,["QUỐC TỬ GIÁM"]],["LĂNG BÁC","Nơi viếng Bác ở quảng trường Ba Đình.",2],["CHỢ BẾN THÀNH","Khu chợ có tháp đồng hồ ở Sài Gòn.",3],["DINH ĐỘC LẬP","Xe tăng húc đổ cổng ngày ba mươi tháng tư.",3],["NHÀ THỜ ĐỨC BÀ","Nhà thờ gạch đỏ ở trung tâm Sài Gòn.",3],["PHỐ CỔ","Khu ba mươi sáu phố phường Hà Nội.",2],["FANSIPAN","Nóc nhà Đông Dương.",2,["PHAN XI PĂNG"]],["CẦU LONG BIÊN","Cây cầu sắt cũ bắc qua sông Hồng.",3],["CẦU VÀNG","Cây cầu có đôi bàn tay khổng lồ ở Bà Nà.",2],["BÀ NÀ","Khu du lịch trên núi ở Đà Nẵng, đi cáp treo.",2],["MŨI NÉ","Đồi cát bay ở Phan Thiết.",3],["PHONG NHA","Động nổi tiếng ở Quảng Bình.",2,["PHONG NHA KẺ BÀNG"]],["SƠN ĐOÒNG","Hang động lớn nhất thế giới.",3],["TÂY NGUYÊN","Vùng đất đỏ ba dan, cà phê, cồng chiêng.",2],["BUÔN MA THUỘT","Thủ phủ cà phê Việt Nam.",3],["MIỀN TÂY","Vùng sông nước, xuồng ba lá, đờn ca tài tử.",2],["HOÀNG SA","Quần đảo của Việt Nam thuộc Đà Nẵng.",2],["TRƯỜNG SA","Quần đảo của Việt Nam thuộc Khánh Hòa.",2],["NGHỆ AN","Quê Bác Hồ, nói giọng \"mô tê răng rứa\".",2],["THANH HÓA","Quê nem chua, xứ Thanh.",2],["QUẢNG NINH","Tỉnh có vịnh Hạ Long, than đá.",2],["LẠNG SƠN","Tỉnh biên giới, có nàng Tô Thị, vịt quay.",3],["CAO BẰNG","Có thác Bản Giốc.",3],["NINH BÌNH","Tràng An, Tam Cốc, cố đô Hoa Lư.",2],["BẮC NINH","Quê quan họ, liền anh liền chị.",2],["HƯNG YÊN","Đất nhãn lồng.",3],["PHÚ THỌ","Có đền Hùng, giỗ tổ mùng mười tháng ba.",3],["QUẢNG BÌNH","Vương quốc hang động.",3],["QUẢNG NAM","Có phố cổ Hội An và mì Quảng.",3],["BÌNH ĐỊNH","Đất võ, quê Quang Trung.",3],["KHÁNH HÒA","Tỉnh có Nha Trang, yến sào.",3],["LÂM ĐỒNG","Tỉnh có Đà Lạt.",3],["BẾN TRE","Xứ dừa.",2],["AN GIANG","Có núi Cấm, rừng tràm Trà Sư.",3],["KIÊN GIANG","Tỉnh có đảo Phú Quốc.",3],["TÂY NINH","Có núi Bà Đen, bánh tráng phơi sương.",3],["CỦ CHI","Địa đạo nổi tiếng gần Sài Gòn.",3],["ĐIỆN BIÊN PHỦ","Chiến thắng lừng lẫy năm châu chấn động địa cầu năm 1954.",3],["BA ĐÌNH","Quảng trường nơi Bác đọc Tuyên ngôn Độc lập.",2],["MÚA RỐI NƯỚC","Loại hình biểu diễn trên mặt ao, có chú Tễu.",3,[],"Đây là thứ gắn với đất nước Việt Nam."],["ÁO DÀI","Trang phục truyền thống, cô giáo hay mặc màu trắng.",2,[],"Đây là thứ gắn với đất nước Việt Nam."],["NÓN LÁ","Đội đầu che nắng, hình chóp, làm bằng lá.",2,[],"Đây là thứ gắn với đất nước Việt Nam."],["QUỐC KỲ","Lá cờ đỏ sao vàng.",2,["CỜ ĐỎ SAO VÀNG"],"Đây là thứ gắn với đất nước Việt Nam."],["QUỐC CA","Bài \"Tiến quân ca\" hát khi chào cờ.",2,[],"Đây là thứ gắn với đất nước Việt Nam."],["TIỀN ĐỒNG","Đơn vị tiền tệ của Việt Nam.",2,["ĐỒNG"],"Đây là thứ gắn với đất nước Việt Nam."],["CHỢ NỔI","Chợ họp trên ghe thuyền ở miền Tây.",2],["RUỘNG BẬC THANG","Ruộng lúa xếp tầng trên sườn núi.",3],["CỘT CỜ LŨNG CÚ","Nơi cắm cờ ở cực Bắc.",3],["CHÙA MỘT CỘT","Ngôi chùa đứng trên một trụ đá giữa hồ.",3],["CHÙA HƯƠNG","Đi lễ đầu xuân, đi đò suối Yến.",3],["NÚI BÀ ĐEN","Nóc nhà Nam Bộ ở Tây Ninh.",3],["ĐẢO LÝ SƠN","Vương quốc tỏi ở Quảng Ngãi.",3,["LÝ SƠN"]]]},{"f":"08-do-vat","cat":"Đồ vật trong nhà","k":"Đây là một đồ vật.","s":"","q":[["TIVI","Mở lên xem thời sự bảy giờ tối.",1],["TỦ LẠNH","Giữ đồ ăn lạnh, mở ra có đèn.",1],["MÁY GIẶT","Bỏ quần áo vào, nó quay ầm ầm.",2],["QUẠT MÁY","Chạy vù vù mùa hè, có nút số một hai ba.",2,["CÁI QUẠT"]],["ĐIỀU HÒA","Bật mười tám độ ngủ cho sướng.",2,["MÁY LẠNH"]],["NỒI CƠM ĐIỆN","Bấm nút là có cơm chín.",3],["BẾP GA","Vặn núm là lửa xanh bật lên.",2],["LÒ VI SÓNG","Hâm nóng đồ ăn, kêu \"ting\" một cái.",3],["ẤM ĐUN NƯỚC","Sôi xong tự tắt, pha mì.",3,["ẤM SIÊU TỐC"]],["CÁI CHỔI","Dùng để quét nhà.",1,["CHỔI"]],["CÂY LAU NHÀ","Vắt khô rồi lau sàn.",3],["CÁI XÔ","Đựng nước, có quai xách.",2,["XÔ"]],["CÁI CHẬU","Giặt đồ, rửa rau.",2,["CHẬU"]],["CÁI GHẾ","Đồ để ngồi.",1,["GHẾ"]],["CÁI BÀN","Đặt mâm cơm hoặc ngồi học.",1,["BÀN"]],["GIƯỜNG","Nằm ngủ mỗi tối.",1],["CÁI GỐI","Kê đầu khi ngủ.",1,["GỐI"]],["CHĂN","Đắp cho ấm mùa đông.",1,["MỀN"]],["MÀN","Mắc lên chống muỗi.",2,["MÙNG"]],["CÁI TỦ","Đựng quần áo, có cánh cửa.",1,["TỦ"]],["GƯƠNG","Soi vào thấy mặt mình.",1,["KIẾNG"]],["LƯỢC","Dùng để chải tóc.",1],["BÀN CHẢI","Đánh răng mỗi sáng.",1,["BÀN CHẢI ĐÁNH RĂNG"]],["KEM ĐÁNH RĂNG","Bóp lên bàn chải, mùi bạc hà.",3],["XÀ PHÒNG","Chà tay ra bọt, rửa sạch vi khuẩn.",2,["XÀ BÔNG"]],["DẦU GỘI","Gội đầu cho tóc thơm.",2],["KHĂN TẮM","Lau người sau khi tắm.",2],["BÀN LÀ","Là phẳng quần áo nhăn.",2,["BÀN ỦI"]],["MÁY SẤY TÓC","Thổi gió nóng cho tóc khô.",3],["ĐỒNG HỒ","Có kim giờ, kim phút, kim giây.",2],["ĐỒNG HỒ BÁO THỨC","Reng reng mỗi sáng gọi dậy đi học.",3],["ĐIỆN THOẠI","Ai cũng cầm trên tay, đang xem live bằng nó.",1],["MÁY TÍNH","Gõ phím, lướt web, chơi game.",2,["LAPTOP"]],["CHUỘT MÁY TÍNH","Cầm di di trên bàn để trỏ trên màn hình.",3],["BÀN PHÍM","Có chữ QWERTY.",2],["TAI NGHE","Đeo vào nghe nhạc không phiền ai.",2],["SẠC ĐIỆN THOẠI","Pin còn một phần trăm thì cắm cái này vào.",3,["CỤC SẠC"]],["Ổ ĐIỆN","Cắm phích vào đây.",2],["BÓNG ĐÈN","Bật công tắc là sáng.",1],["CÔNG TẮC","Bấm tách một cái là đèn tắt.",2],["CHÌA KHÓA","Mở ổ khóa cửa.",2],["Ổ KHÓA","Treo ở cổng, cần chìa mới mở.",2],["CÁI KÉO","Cắt giấy, có hai lưỡi.",1,["KÉO"]],["CON DAO","Thái rau, thái thịt.",1,["DAO"]],["CÁI THỚT","Tấm gỗ kê để thái đồ ăn.",2,["THỚT"]],["ĐÔI ĐŨA","Hai que dùng để gắp thức ăn.",1,["ĐŨA"]],["CÁI THÌA","Múc canh, còn gọi muỗng.",1,["THÌA","MUỖNG","CÁI MUỖNG"]],["CÁI BÁT","Đựng cơm, còn gọi là chén.",1,["BÁT","CHÉN","CÁI CHÉN"]],["CÁI ĐĨA","Đựng thức ăn, mặt phẳng tròn.",1,["ĐĨA","DĨA"]],["CÁI CỐC","Đựng nước uống, còn gọi là ly.",1,["CỐC","LY","CÁI LY"]],["CÁI NỒI","Nấu canh, luộc rau.",1,["NỒI"]],["CÁI CHẢO","Chiên trứng, xào rau.",1,["CHẢO"]],["CÁI MUÔI","Múc canh từ nồi ra.",2,["MUÔI","VÁ"]],["CÁI RỔ","Đựng rau cho ráo nước, có nhiều lỗ.",2,["RỔ"]],["CÁI LÀN","Xách đi chợ ngày xưa, đan bằng cói.",3,["LÀN","GIỎ"]],["CÁI Ô","Trời mưa thì bung ra che.",1,["CÂY DÙ","Ô","DÙ"]],["ÁO MƯA","Mặc vào khi đi xe máy trời mưa.",2],["DÉP LÀO","Dép tông quai kẹp ngón.",2,["DÉP TÔNG","DÉP KẸP"]],["DÉP TỔ ONG","Dép nhựa nhiều lỗ huyền thoại.",3],["GIÀY THỂ THAO","Mang đi chạy bộ, đá bóng.",3],["MŨ BẢO HIỂM","Đội khi đi xe máy để bảo vệ đầu.",3,["NÓN BẢO HIỂM"]],["KÍNH RÂM","Đeo chống nắng, nhìn cho ngầu.",2,["KÍNH MÁT"]],["VÍ TIỀN","Cất tiền, thẻ, bỏ túi quần.",2,["CÁI VÍ","BÓP"]],["BALO","Túi đeo hai quai sau lưng.",2,["BA LÔ"]],["VALI","Kéo đi du lịch, có bánh xe.",2],["CÁI LƯỚI","Đánh cá, giăng chắn bóng.",2],["CÁI THANG","Leo lên chỗ cao.",2,["THANG"]],["CÁI BÚA","Đóng đinh.",1,["BÚA"]],["CÁI KÌM","Kẹp, bẻ dây thép.",2,["KÌM"]],["TUA VÍT","Vặn ốc vít.",2,["TUỐC NƠ VÍT"]],["BÌNH HOA","Cắm hoa trang trí bàn khách.",2,["LỌ HOA"]],["RÈM CỬA","Kéo che nắng ở cửa sổ.",2],["THẢM","Trải dưới sàn cho êm chân.",2],["CỬA SỔ","Mở ra cho gió vào.",1]]},{"f":"09-giao-thong","cat":"Phương tiện, giao thông","k":"Đây là thứ liên quan tới xe cộ, đi lại.","s":"","q":[["XE ĐẠP","Hai bánh, đạp bằng chân, ngày xưa đạp đi học.",1],["XE MÁY","Phương tiện phổ biến nhất ở Việt Nam.",1],["Ô TÔ","Bốn bánh, có vô lăng.",1,["XE HƠI"]],["XE BUÝT","Chở nhiều người, dừng ở trạm.",2,["XE BUS"]],["XE KHÁCH","Chở người đi tỉnh xa.",2],["XE TẢI","Chở hàng hóa nặng.",2],["XE CỨU THƯƠNG","Hú còi chở người bệnh tới viện.",3],["XE CỨU HỎA","Màu đỏ, có thang và vòi nước.",3],["XE ĐẠP ĐIỆN","Xe không cần đạp, sạc pin là chạy.",3],["XE LĂN","Xe dành cho người không đi được.",2],["XÍCH LÔ","Xe ba bánh chở khách du lịch phố cổ.",2],["TÀU HỎA","Chạy trên đường ray, kêu xình xịch.",2,["XE LỬA"]],["TÀU ĐIỆN NGẦM","Chạy dưới lòng đất, gọi là metro.",3,["METRO"]],["MÁY BAY","Bay trên trời chở khách.",1],["TRỰC THĂNG","Có cánh quạt quay trên nóc.",2],["TÀU THỦY","Đi trên biển, to lớn.",2],["THUYỀN","Chèo trên sông.",1],["CANO","Chạy vút trên mặt nước, có động cơ.",2,["CA NÔ"]],["XUỒNG","Thuyền nhỏ miền Tây.",2],["BÈ","Kết tre nứa nổi trên mặt nước.",2],["KHINH KHÍ CẦU","Quả bóng khổng lồ bay lên nhờ khí nóng.",3],["TÀU NGẦM","Lặn sâu dưới biển.",3],["TÊN LỬA","Phóng lên vũ trụ.",2],["ĐÈN ĐỎ","Gặp thì phải dừng lại.",1],["ĐÈN XANH","Gặp thì được đi.",1],["ĐÈN VÀNG","Đi chậm lại, chuẩn bị dừng.",2],["VẠCH KẺ ĐƯỜNG","Sọc trắng cho người đi bộ qua đường.",3,["VẠCH QUA ĐƯỜNG"]],["VỈA HÈ","Phần đường dành cho người đi bộ, giờ toàn quán trà đá.",2],["NGÃ TƯ","Chỗ bốn con đường gặp nhau.",2],["BÙNG BINH","Vòng xuyến giữa ngã đường.",2,["VÒNG XUYẾN"]],["CAO TỐC","Đường chạy nhanh, không có xe máy.",2,["ĐƯỜNG CAO TỐC"]],["CẦU VƯỢT","Bắc qua đường cho xe hoặc người đi bên trên.",2],["ĐƯỜNG HẦM","Xuyên qua núi hoặc dưới sông.",2],["BẾN XE","Nơi xe khách đón trả khách.",2],["SÂN BAY","Nơi máy bay cất cánh, hạ cánh.",2],["NHÀ GA","Nơi tàu hỏa dừng đón khách.",2],["BẾN CẢNG","Nơi tàu biển cập bờ.",2,["CẢNG"]],["TRẠM XĂNG","Đổ xăng cho xe.",2,["CÂY XĂNG"]],["KẸT XE","Đường đông cứng, không nhúc nhích.",1,["TẮC ĐƯỜNG"]],["BẰNG LÁI","Giấy phép được lái xe.",2,["BẰNG LÁI XE"]],["VÔ LĂNG","Tay quay điều khiển ô tô.",2],["PHANH","Bóp vào cho xe dừng lại.",2,["THẮNG"]],["BÁNH XE","Hình tròn, lăn trên đường.",1],["BIỂN SỐ","Tấm biển ghi số xe.",2,["BIỂN SỐ XE"]],["CÒI XE","Bấm bíp bíp.",1],["ĐÈN PHA","Đèn trước xe chiếu sáng ban đêm.",2],["XĂNG","Nhiên liệu đổ vào bình xe máy.",1],["LỐP XE","Vỏ cao su bọc quanh bánh.",2,["VỎ XE"]],["THỦNG LỐP","Cán đinh, xe xẹp, phải đi vá.",2,["THỦNG SĂM"]],["GỬI XE","Đưa xe cho người trông, nhận vé.",2],["VÉ XE","Tờ giấy nhận khi gửi xe hay đi buýt.",2],["DÂY AN TOÀN","Thắt vào khi ngồi ô tô.",3],["GRAB","Ứng dụng gọi xe màu xanh lá.",2],["XE ĐẠP ĐÔI","Hai người cùng đạp trên một xe.",3],["VÁN TRƯỢT","Tấm ván có bánh, đứng lên lướt đi.",3,["SKATEBOARD"]],["XE TRƯỢT","Đứng một chân đẩy, có tay lái.",3,["XE SCOOTER"]],["TÀU LƯỢN","Trò chơi lao vun vút ở công viên.",3,["TÀU LƯỢN SIÊU TỐC"]],["ĐU QUAY","Vòng tròn khổng lồ quay chậm ở công viên.",2],["CÁP TREO","Cabin treo trên dây đưa người lên núi.",2],["TÀU VŨ TRỤ","Đưa phi hành gia lên trời.",3],["ĐƯỜNG RAY","Hai thanh sắt song song cho tàu chạy.",2],["GA TÀU","Nơi chờ lên tàu hỏa.",2],["LÀN ĐƯỜNG","Phần đường chia cho từng loại xe.",3],["ĐI BỘ","Không dùng xe, chỉ dùng chân.",1],["CẢNH SÁT","Đứng ngã tư, vẫy xe vào kiểm tra.",2],["MŨ XE ĐẠP","Đội khi đạp xe đường dài.",3],["XE ĐẠP THỂ THAO","Xe đạp có nhiều số, lốp to.",3],["XE CÔNG NÔNG","Máy cày ở quê kéo thùng hàng.",3],["MÁY CÀY","Thay con trâu cày ruộng.",2],["XE BÒ","Bò kéo thùng gỗ ở quê.",2],["XE NGỰA","Ngựa kéo, chở người thời xưa.",2],["TÀU CAO TỐC","Tàu chạy hơn ba trăm cây số một giờ.",3],["XE ĐIỆN","Xe chạy pin, không xả khói.",2]]},{"f":"10-thien-nhien","cat":"Thiên nhiên, thời tiết","k":"Đây là thứ trong thiên nhiên, trời đất.","s":"","q":[["MẶT TRỜI","Mọc đằng đông, lặn đằng tây.",1],["MẶT TRĂNG","Tròn nhất vào rằm.",1,["ÔNG TRĂNG"]],["NGÔI SAO","Lấp lánh trên trời đêm.",1,["SAO"]],["CẦU VỒNG","Bảy màu hiện ra sau cơn mưa.",1],["MÂY","Trôi lững lờ trên trời, trắng như bông.",1,["ĐÁM MÂY"]],["MƯA","Nước từ trên trời rơi xuống.",1],["MƯA PHÙN","Mưa lất phất mùa xuân miền Bắc.",2],["MƯA ĐÁ","Mưa ra cục nước đá.",2],["SẤM SÉT","Đùng đoàng chớp lóe trong cơn giông.",2,["SẤM","SÉT"]],["GIÓ","Không nhìn thấy nhưng làm lá bay.",1],["BÃO","Gió giật mạnh, mưa lớn, thổi tốc mái nhà.",1],["LỐC XOÁY","Cột gió xoáy cuốn mọi thứ lên trời.",3],["SƯƠNG MÙ","Trắng xóa buổi sáng, nhìn không rõ đường.",2],["TUYẾT","Bông trắng lạnh rơi mùa đông xứ lạnh.",1],["BĂNG","Nước đông cứng lại.",1],["GIÓ MÙA ĐÔNG BẮC","Đợt gió lạnh tràn về miền Bắc.",3],["NẮNG NÓNG","Trời bốn mươi độ, ra đường như lò nướng.",2],["LŨ LỤT","Nước dâng ngập nhà cửa.",2,["LŨ","LỤT"]],["HẠN HÁN","Lâu ngày không mưa, ruộng nứt nẻ.",2],["ĐỘNG ĐẤT","Mặt đất rung lắc dữ dội.",2],["NÚI LỬA","Phun dung nham nóng chảy.",2],["SÓNG THẦN","Sóng biển khổng lồ sau động đất.",3],["NÚI","Cao hơn đồi, có đỉnh.",1],["ĐỒI","Thấp hơn núi, người ta trồng chè trên đó.",1],["SÔNG","Dòng nước chảy ra biển.",1],["SUỐI","Nước trong róc rách trên núi.",1],["THÁC","Nước đổ từ trên cao xuống trắng xóa.",1,["THÁC NƯỚC"]],["HỒ","Nước đứng yên, rộng, giữa phố.",1],["BIỂN","Nước mặn, có sóng vỗ, có cát.",1],["ĐẠI DƯƠNG","Vùng nước rộng nhất, có Thái Bình Dương.",2],["BÃI BIỂN","Chỗ nằm phơi nắng xây lâu đài cát.",2],["ĐẢO","Đất nổi giữa biển.",1,["HÒN ĐẢO"]],["HANG ĐỘNG","Lỗ lớn trong núi, có thạch nhũ.",2,["HANG"]],["SA MẠC","Toàn cát, nóng, ít mưa.",2],["RỪNG","Nhiều cây, nhiều thú.",1,["KHU RỪNG"]],["RỪNG NHIỆT ĐỚI","Rừng rậm nóng ẩm như Amazon.",3],["ĐỒNG LÚA","Cánh đồng xanh rì ở quê.",2,["CÁNH ĐỒNG"]],["ĐẤT","Ta đứng trên nó, cây mọc từ nó.",1],["ĐÁ","Cứng, có loại cuội, có loại granit.",1,["HÒN ĐÁ"]],["CÁT","Hạt nhỏ li ti trên bãi biển.",1],["BÙN","Đất nhão sau mưa.",1],["LỬA","Nóng, đỏ, cháy.",1],["KHÓI","Bay lên từ đám cháy.",1],["NƯỚC","Không có thì không sống được.",1],["KHÔNG KHÍ","Thứ ta hít thở mỗi giây.",2],["OXY","Khí cây cối nhả ra cho ta thở.",2,["Ô XI"]],["BẦU TRỜI","Màu xanh trên đầu ta.",1],["BÌNH MINH","Lúc mặt trời mới mọc.",2],["HOÀNG HÔN","Lúc mặt trời lặn, trời đỏ cam.",2],["NỬA ĐÊM","Mười hai giờ đêm.",2],["MÙA XUÂN","Mùa có Tết, hoa nở.",1],["MÙA HÈ","Mùa nóng, nghỉ học.",1,["MÙA HẠ"]],["MÙA THU","Mùa lá vàng rơi, có Trung thu.",1],["MÙA ĐÔNG","Mùa lạnh, mặc áo khoác.",1],["MÙA MƯA","Miền Nam có hai mùa, đây là một.",2],["MÙA KHÔ","Miền Nam có hai mùa, mùa nắng ráo.",2],["TRÁI ĐẤT","Hành tinh xanh ta đang sống.",2],["SAO HỎA","Hành tinh đỏ.",2],["SAO KIM","Hành tinh sáng nhất, còn gọi sao Mai.",3],["SAO MỘC","Hành tinh lớn nhất hệ Mặt Trời.",3],["SAO THỔ","Hành tinh có vành đai đẹp nhất.",3],["SAO BĂNG","Vệt sáng vụt qua trời đêm, ước một điều.",2],["NGÂN HÀ","Dải sáng trắng vắt ngang trời đêm.",3,["DẢI NGÂN HÀ"]],["NHẬT THỰC","Mặt trăng che mặt trời giữa ban ngày.",3],["NGUYỆT THỰC","Bóng trái đất che mặt trăng.",3],["VŨ TRỤ","Bao la, chứa mọi vì sao.",2],["NHIỆT ĐỘ","Đo bằng độ C.",2],["DỰ BÁO THỜI TIẾT","Xem sau thời sự để biết mai mưa hay nắng.",3],["SƯƠNG MUỐI","Lớp băng trắng phủ cây trên núi khi rét đậm.",3],["RÉT ĐẬM","Dưới mười lăm độ, học sinh được nghỉ.",3,["RÉT HẠI"]],["GIÓ LÀO","Gió khô nóng thổi miền Trung mùa hè.",3],["TRIỀU CƯỜNG","Nước biển dâng cao ngập phố.",3],["THẠCH NHŨ","Đá rủ xuống trong hang động.",3],["MẠCH NƯỚC NGẦM","Nước chảy dưới lòng đất.",3,["NƯỚC NGẦM"]]]},{"f":"11-co-the","cat":"Cơ thể, sức khỏe","k":"Đây là bộ phận cơ thể.","s":"","q":[["MẮT","Dùng để nhìn.",1,["CON MẮT"]],["MŨI","Dùng để ngửi.",1,["CÁI MŨI"]],["MIỆNG","Dùng để ăn và nói.",1,["CÁI MIỆNG"]],["TAI","Dùng để nghe.",1,["CÁI TAI"]],["RĂNG","Đánh mỗi sáng tối cho trắng.",1,["CÁI RĂNG"]],["LƯỠI","Nếm vị chua cay mặn ngọt.",1,["CÁI LƯỠI"]],["TÓC","Mọc trên đầu, đi cắt mỗi tháng.",1,["MÁI TÓC"]],["LÔNG MÀY","Hai vệt trên mắt.",2],["LÔNG MI","Sợi cong ở mí mắt, chị em hay chuốt mascara.",2],["MÁ","Hai bên mặt, cười thì có lúm đồng tiền.",1,["GÒ MÁ"]],["CẰM","Phía dưới miệng, ông già có râu ở đây.",1],["CỔ","Nối đầu với thân.",1],["VAI","Đeo cặp sách lên đây.",1,["BỜ VAI"]],["TAY","Dùng để cầm nắm.",1,["BÀN TAY"]],["NGÓN TAY","Mỗi bàn tay có năm cái.",1],["MÓNG TAY","Cắt ngắn cho sạch, thợ nail sơn.",2],["KHUỶU TAY","Chỗ gập giữa cánh tay.",3,["CÙI CHỎ","KHUỶU"]],["CHÂN","Dùng để đi.",1,["BÀN CHÂN"]],["ĐẦU GỐI","Chỗ gập giữa chân, ngã hay bị trầy.",2],["GÓT CHÂN","Phần sau bàn chân.",2],["BỤNG","Ăn no thì căng tròn.",1,["CÁI BỤNG"]],["RỐN","Cái lỗ nhỏ giữa bụng.",1],["LƯNG","Phía sau thân, hay bị đau khi ngồi lâu.",1],["TIM","Đập thình thịch trong lồng ngực.",1,["TRÁI TIM"]],["PHỔI","Hít thở không khí.",1],["GAN","Lọc độc trong máu, uống rượu nhiều thì hại.",2],["DẠ DÀY","Nơi tiêu hóa thức ăn, còn gọi bao tử.",2,["BAO TỬ"]],["RUỘT","Ống dài trong bụng, có loại non và loại già.",2],["THẬN","Lọc máu tạo nước tiểu, có hai quả.",2],["NÃO","Bộ phận suy nghĩ trong đầu.",1,["BỘ NÃO"]],["XƯƠNG","Khung cứng của cơ thể, uống sữa cho chắc.",1],["MÁU","Màu đỏ, chảy trong mạch.",1],["DA","Lớp ngoài cùng của cơ thể.",1,["LÀN DA"]],["MỒ HÔI","Chảy ra khi nóng hay chạy nhiều.",2],["NƯỚC MẮT","Chảy ra khi khóc.",1],["NỤ CƯỜI","Thứ đẹp nhất trên gương mặt.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["LÚM ĐỒNG TIỀN","Vết lõm xinh trên má khi cười.",3,[],"Đây là chuyện cơ thể, sức khỏe."],["NỐT RUỒI","Chấm nhỏ trên da, người ta bảo có duyên.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["TÀN NHANG","Đốm nâu nhỏ trên mặt.",3,[],"Đây là chuyện cơ thể, sức khỏe."],["MỤN","Nổi trên mặt tuổi dậy thì.",1,["MỤN TRỨNG CÁ"],"Đây là chuyện cơ thể, sức khỏe."],["SỐT","Người nóng, đo nhiệt kế ba mươi chín độ.",1,["BỊ SỐT"],"Đây là chuyện cơ thể, sức khỏe."],["CẢM CÚM","Hắt xì, sổ mũi, đau đầu.",2,["CẢM","CÚM"],"Đây là chuyện cơ thể, sức khỏe."],["HO","Khụ khụ.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["ĐAU BỤNG","Ăn bậy là bị cái này.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["ĐAU RĂNG","Ăn kẹo nhiều quá thì bị.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["SÂU RĂNG","Ăn ngọt không đánh răng thì răng bị.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["CẬN THỊ","Nhìn xa không rõ, phải đeo kính.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["NHIỆT KẾ","Kẹp nách để đo nhiệt độ.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["KHẨU TRANG","Đeo che miệng mũi tránh bụi.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["THUỐC","Uống khi ốm, có viên, có siro.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["BỆNH VIỆN","Nơi khám chữa bệnh, có xe cứu thương.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["TIÊM PHÒNG","Chích vắc xin để không bị bệnh.",2,["TIÊM CHỦNG"],"Đây là chuyện cơ thể, sức khỏe."],["BĂNG CÁ NHÂN","Dán lên vết đứt tay.",3,["URGO"],"Đây là chuyện cơ thể, sức khỏe."],["VITAMIN","Chất cần thiết có nhiều trong rau quả.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["CHIỀU CAO","Đo bằng thước, uống sữa để tăng.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["CÂN NẶNG","Đứng lên cân để đo.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["ĂN SÁNG","Bữa đầu tiên trong ngày.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["NGỦ TRƯA","Chợp mắt sau bữa trưa.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["TẬP THỂ DỤC","Vận động mỗi sáng cho khỏe.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["CHẠY BỘ","Môn thể thao chỉ cần đôi giày.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["ĐÁNH RĂNG","Việc làm mỗi sáng và trước khi ngủ.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["RỬA TAY","Làm trước khi ăn để sạch vi khuẩn.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["TẮM","Làm mỗi tối cho sạch sẽ.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["NGÁP","Há miệng to khi buồn ngủ.",1,[],"Đây là chuyện cơ thể, sức khỏe."],["HẮT HƠI","Hắt xì một cái.",2,["HẮT XÌ"],"Đây là chuyện cơ thể, sức khỏe."],["NẤC CỤT","Ăn vội bị cái này, hức hức.",2,["NẤC"],"Đây là chuyện cơ thể, sức khỏe."],["CHUỘT RÚT","Bơi lâu bị co cứng bắp chân.",3,[],"Đây là chuyện cơ thể, sức khỏe."],["TÊ CHÂN","Ngồi xổm lâu đứng dậy bị kiến bò.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["VÂN TAY","Đường nét riêng trên đầu ngón, mở khóa điện thoại.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["NHÓM MÁU","A, B, AB hoặc O.",3,[],"Đây là chuyện cơ thể, sức khỏe."],["TẾ BÀO","Đơn vị nhỏ nhất của cơ thể sống.",3,[],"Đây là chuyện cơ thể, sức khỏe."],["CƠ BẮP","Tập gym cho to lên.",2,[],"Đây là chuyện cơ thể, sức khỏe."],["SIX PACK","Cơ bụng sáu múi.",3,["CƠ BỤNG"],"Đây là chuyện cơ thể, sức khỏe."],["HUYẾT ÁP","Đo bằng máy bó tay.",3,[],"Đây là chuyện cơ thể, sức khỏe."]]},{"f":"12-the-thao-tro-choi","cat":"Thể thao, trò chơi","k":"Đây là một môn thể thao.","s":"","q":[["BÓNG ĐÁ","Môn vua, hai mươi hai người tranh một quả bóng.",1],["BÓNG CHUYỀN","Đánh bóng qua lưới cao bằng tay.",2],["BÓNG RỔ","Ném bóng vào rổ treo cao.",2],["CẦU LÔNG","Đánh quả cầu có lông vũ bằng vợt.",2],["BÓNG BÀN","Đánh bóng nhỏ trên bàn có lưới.",2],["QUẦN VỢT","Môn có giải Wimbledon.",3,["TENNIS"]],["BƠI LỘI","Môn thể thao dưới nước.",2,["BƠI"]],["CỜ VUA","Có vua, hậu, xe, mã, tượng, tốt.",2],["CỜ TƯỚNG","Có tướng, sĩ, tượng, xe, pháo, mã, tốt.",2],["CỜ CÁ NGỰA","Đổ xúc xắc đi vòng, về chuồng.",3],["CỜ CARO","Ai năm ô liền hàng trước là thắng.",2],["VÕ THUẬT","Vovinam, karate, taekwondo đều là.",2],["ĐUA XE","Chạy nhanh nhất về đích.",2],["ĐẠP XE","Môn thể thao bằng xe hai bánh.",2],["CHẠY MARATHON","Chạy bốn mươi hai cây số.",3,["MARATHON"]],["NHẢY XA","Chạy đà rồi bật vào hố cát.",2],["NHẢY CAO","Bật qua xà cao.",2],["ĐẨY TẠ","Ném quả cầu sắt nặng.",3],["CỬ TẠ","Nâng thanh sắt nặng qua đầu.",3],["BẮN CUNG","Giương cung nhắm hồng tâm.",3],["TRƯỢT BĂNG","Đi giày lưỡi dao lướt trên băng.",3],["LƯỚT SÓNG","Đứng trên ván cưỡi sóng biển.",3],["LEO NÚI","Chinh phục đỉnh cao.",2],["YOGA","Bài tập dẻo dai, thở sâu, ngồi thiền.",2],["GYM","Phòng tập tạ cho cơ bắp to.",1],["SEA GAMES","Đại hội thể thao Đông Nam Á.",3],["WORLD CUP","Giải bóng đá lớn nhất hành tinh.",2],["OLYMPIC","Thế vận hội năm vòng tròn.",2,["THẾ VẬN HỘI"]],["HUY CHƯƠNG VÀNG","Phần thưởng cho người về nhất.",3],["THỦ MÔN","Người duy nhất được bắt bóng bằng tay.",2],["TIỀN ĐẠO","Cầu thủ ghi bàn chính.",2],["PHẠT ĐỀN","Sút từ chấm mười một mét.",2,["PENALTY"]],["VIỆT VỊ","Lỗi đứng sau hậu vệ cuối cùng khi nhận bóng.",3],["THẺ ĐỎ","Bị rút là phải rời sân.",2],["HIỆP PHỤ","Hòa sau chín mươi phút thì đá thêm.",3],["BÀN THẮNG","Bóng vào lưới.",1,["GOAL"]],["NHẢY DÂY","Quay dây và nhảy qua.",1,[],"Đây là một trò chơi."],["ĐÁ CẦU","Tâng quả cầu lông gà bằng chân.",2,[],"Đây là một trò chơi."],["NHẢY LÒ CÒ","Kẻ ô dưới đất, nhảy một chân.",3,["LÒ CÒ"],"Đây là một trò chơi."],["KÉO CO","Hai đội nắm dây kéo về phía mình.",2,[],"Đây là một trò chơi."],["BỊT MẮT BẮT DÊ","Bị bịt mắt đi tìm bạn.",3,[],"Đây là một trò chơi."],["TRỐN TÌM","Một người đếm, cả bọn đi núp.",1,[],"Đây là một trò chơi."],["Ô ĂN QUAN","Bốc sỏi rải vào các ô, có quan.",3,[],"Đây là một trò chơi."],["CHƠI CHUYỀN","Tung quả và nhặt que, bé gái hay chơi.",3,["CHUYỀN"],"Đây là một trò chơi."],["BẮN BI","Búng viên bi thủy tinh vào lỗ.",2,[],"Đây là một trò chơi."],["ĐÁNH KHĂNG","Dùng que dài đánh que ngắn bay xa.",3,[],"Đây là một trò chơi."],["THẢ DIỀU","Chạy trên đồng cho con diều bay lên.",2,[],"Đây là một trò chơi."],["NÉM LON","Ném dép cho đổ chồng lon.",3,[],"Đây là một trò chơi."],["RỒNG RẮN LÊN MÂY","Cả bọn nối đuôi, hát \"có cây núc nác\".",3,[],"Đây là một trò chơi."],["MÈO ĐUỔI CHUỘT","Cả vòng nắm tay, một đứa chạy đuổi một đứa.",3,[],"Đây là một trò chơi."],["OẲN TÙ TÌ","Búa, kéo, bao.",2,[],"Đây là một trò chơi."],["NU NA NU NỐNG","Ngồi duỗi chân, đọc đồng dao, chân ai bị chỉ cuối thì co lại.",3,[],"Đây là một trò chơi."],["ĐÁNH ĐÁO","Ném đồng xu vào lỗ đáo.",3,[],"Đây là một trò chơi."],["BẬP BÊNH","Hai người ngồi hai đầu, lên xuống.",2,[],"Đây là một trò chơi."],["CẦU TRƯỢT","Leo lên rồi trượt xuống ở sân chơi.",2,[],"Đây là một trò chơi."],["XÍCH ĐU","Ngồi đung đưa, có người đẩy.",2,[],"Đây là một trò chơi."],["ĐU DÂY","Treo trên dây đu qua đu lại.",2,[],"Đây là một trò chơi."],["XẾP HÌNH","Ráp các mảnh thành bức tranh.",2,["PUZZLE"],"Đây là một trò chơi."],["RUBIK","Khối vuông xoay sáu mặt sáu màu.",2,[],"Đây là một trò chơi."],["ĐÔ MI NÔ","Xếp thẳng hàng, đẩy một cái đổ cả dãy.",3,["DOMINO"],"Đây là một trò chơi."],["BÀI TÂY","Năm mươi hai lá, có cơ rô chuồn bích.",3,["BỘ BÀI"],"Đây là một trò chơi."],["GAME ONLINE","Ngồi máy tính chơi với người khắp nơi.",2,[],"Đây là một trò chơi."],["LIÊN QUÂN","Game di động năm đánh năm của Việt Nam hay chơi.",2,[],"Đây là một trò chơi."],["FREE FIRE","Game bắn súng sinh tồn rơi dù từ máy bay.",3,[],"Đây là một trò chơi."],["MINECRAFT","Game xây dựng bằng khối vuông.",3,[],"Đây là một trò chơi."],["TETRIS","Game xếp gạch rơi từ trên xuống.",2,["XẾP GẠCH"],"Đây là một trò chơi."],["RẮN SĂN MỒI","Game trên điện thoại cục gạch, ăn càng dài.",3,[],"Đây là một trò chơi."],["MARIO","Ông thợ sửa ống nước nhảy đập nấm.",2,[],"Đây là một trò chơi."],["POKEMON","Thu phục quái thú vào quả bóng đỏ trắng.",2,[],"Đây là một trò chơi."],["TRƯỢT PATIN","Đi giày có bánh xe.",3,["PATIN"],"Đây là một trò chơi."],["ĐUA THUYỀN","Cả đội cùng chèo về đích.",3,[],"Đây là một trò chơi."],["BOXING","Đấm bốc đeo găng.",2,["ĐẤM BỐC","QUYỀN ANH"],"Đây là một trò chơi."],["PICKLEBALL","Môn vợt đang hot, sân nhỏ, bóng nhựa có lỗ.",3,[],"Đây là một trò chơi."]]},{"f":"13-le-tet","cat":"Lễ Tết, phong tục","k":"Đây là thứ gắn với lễ Tết, phong tục.","s":"","q":[["TẾT","Ngày lễ lớn nhất trong năm của người Việt.",1,["TẾT NGUYÊN ĐÁN"]],["GIAO THỪA","Khoảnh khắc chuyển từ năm cũ sang năm mới.",2],["LÌ XÌ","Bao đỏ người lớn cho trẻ con ngày Tết.",1,["MỪNG TUỔI"]],["BAO LÌ XÌ","Phong bao đỏ đựng tiền mừng tuổi.",2],["PHÁO HOA","Bắn lên trời đêm giao thừa.",1],["CÂU ĐỐI","Hai vế chữ treo hai bên cửa ngày Tết.",2],["MÂM NGŨ QUẢ","Năm loại quả bày bàn thờ ngày Tết.",3],["XÔNG ĐẤT","Người đầu tiên bước vào nhà năm mới.",2],["CHÚC TẾT","Đi tới nhà họ hàng nói lời hay ý đẹp.",2],["TÁO QUÂN","Ông Công ông Táo về trời ngày hai mươi ba tháng chạp.",2,["ÔNG TÁO"]],["CÁ CHÉP","Ông Táo cưỡi con này về trời.",2],["CÂY NÊU","Cây tre trồng trước nhà để xua ma quỷ ngày Tết.",3],["TẾT NGUYÊN TIÊU","Rằm tháng giêng, rằm đầu tiên của năm.",3,["RẰM THÁNG GIÊNG"]],["TẾT HÀN THỰC","Mùng ba tháng ba ăn bánh trôi bánh chay.",3],["TẾT ĐOAN NGỌ","Mùng năm tháng năm, giết sâu bọ.",3,["ĐOAN NGỌ"]],["TRUNG THU","Rằm tháng tám, rước đèn ông sao.",2],["ĐÈN ÔNG SAO","Đèn năm cánh trẻ em rước đêm Trung thu.",3],["ĐÈN LỒNG","Treo đỏ rực ở phố cổ.",2],["MÚA LÂN","Đầu sư tử nhảy theo trống tùng tùng.",2],["CHÚ CUỘI","Ngồi gốc cây đa trên cung trăng.",2,["THẰNG CUỘI"]],["CHỊ HẰNG","Người đẹp sống trên cung trăng.",2,["HẰNG NGA"]],["VU LAN","Mùa báo hiếu rằm tháng bảy.",3],["GIỖ TỔ","Ngày mùng mười tháng ba tưởng nhớ vua Hùng.",3,["GIỖ TỔ HÙNG VƯƠNG"]],["QUỐC KHÁNH","Ngày hai tháng chín.",2],["NGÀY PHỤ NỮ","Tám tháng ba hoặc hai mươi tháng mười tặng hoa chị em.",3],["NGÀY THIẾU NHI","Mùng một tháng sáu, các bé được quà.",3],["NOEL","Ông già tuyết phát quà đêm hai tư tháng mười hai.",1,["GIÁNG SINH"]],["ÔNG GIÀ NOEL","Râu trắng áo đỏ, cưỡi tuần lộc.",3,["ÔNG GIÀ TUYẾT"]],["VALENTINE","Ngày lễ tình nhân mười bốn tháng hai.",2,["LỄ TÌNH NHÂN"]],["HALLOWEEN","Hóa trang ma quỷ, đi xin kẹo.",2],["SINH NHẬT","Ngày mình ra đời, thổi nến.",1],["ĐÁM CƯỚI","Cô dâu chú rể, ăn cỗ, mừng phong bì.",1],["ĐÁM HỎI","Nhà trai mang tráp sang nhà gái trước cưới.",2,["ĂN HỎI"]],["MÂM CỖ","Bày đầy món ăn ngày lễ.",2,["CỖ"]],["PHONG BÌ","Bỏ tiền mừng đám cưới.",2],["CÔ DÂU","Mặc váy trắng ngày cưới.",1],["CHÚ RỂ","Mặc vest đứng cạnh cô dâu.",1],["TRÁP","Hộp đỏ đựng lễ vật đám hỏi.",3,["MÂM QUẢ"]],["NHẪN CƯỚI","Đeo ngón áp út sau lễ cưới.",2],["ĐẦY THÁNG","Tiệc mừng em bé tròn một tháng tuổi.",3],["THÔI NÔI","Tiệc tròn một tuổi, bé bốc đồ đoán nghề.",3],["TẢO MỘ","Đi dọn dẹp mộ tổ tiên dịp Thanh minh.",3],["THẮP HƯƠNG","Đốt nén nhang trên bàn thờ.",2],["BÀN THỜ","Nơi đặt ảnh ông bà tổ tiên.",2],["HỘI LÀNG","Ngày vui chung của cả làng, có rước kiệu.",3],["HỘI CHỢ","Có gian hàng, vòng quay, tò he.",2],["TÒ HE","Đồ chơi nặn bằng bột màu cắm que.",3],["CHỢ TẾT","Phiên chợ đông nhất năm, bán hoa đào hoa mai.",2],["HÁI LỘC","Bẻ cành non đầu năm lấy may.",3],["ĐI CHÙA","Đầu năm lên chùa cầu bình an.",2],["GÓI BÁNH CHƯNG","Cả nhà ngồi canh nồi bánh đêm cuối năm.",3],["DỌN NHÀ","Lau dọn sạch sẽ đón năm mới.",2],["MÙNG MỘT","Ngày đầu tiên của Tết.",2],["TẤT NIÊN","Bữa cơm cuối năm sum họp.",3],["KHAI BÚT","Viết những chữ đầu tiên đầu năm.",3],["XIN CHỮ","Đầu năm tới ông đồ, nhờ viết chữ Phúc, chữ Lộc về treo.",3],["ÔNG ĐỒ","Người viết thư pháp ngày Tết, \"mỗi năm hoa đào nở\".",3],["CHÚC MỪNG NĂM MỚI","Câu nói khi gặp nhau ngày mùng một.",3],["VẠN SỰ NHƯ Ý","Câu chúc mọi việc như mong muốn.",3],["TIỀN MỪNG TUỔI","Tiền trẻ con hay bị mẹ giữ hộ.",3],["CON GIÁP","Mười hai con vật tính tuổi.",2],["TUỔI TÝ","Tuổi con chuột.",2,["TÝ","TÍ"]],["NĂM RỒNG","Năm Thìn.",2,["NĂM THÌN"]],["QUẢ DƯA ĐỎ","Bổ ra đỏ thì cả năm may mắn.",3],["CÀNH ĐÀO","Chưng trong nhà ngày Tết miền Bắc.",2],["CHẬU QUẤT","Cây quả vàng tròn chưng Tết.",3,["CÂY QUẤT","CÂY TẮC"]],["BÁNH KẸO","Bày trên khay mời khách ngày Tết.",1],["ÁO MỚI","Mặc đi chúc Tết mùng một.",1,["QUẦN ÁO MỚI"]],["VỀ QUÊ","Cả nhà bắt xe về đoàn tụ dịp Tết.",1],["SUM HỌP","Cả nhà quây quần bên nhau.",2,["ĐOÀN TỤ"]]]},{"f":"14-thanh-ngu","cat":"Ca dao, thành ngữ (điền từ còn thiếu)","k":"Đây là ca dao tục ngữ, điền chữ còn thiếu.","s":"","q":[["NƯỚC","\"Uống ... nhớ nguồn.\"",1],["CÂY","\"Ăn quả nhớ kẻ trồng ...\"",1],["THẦY","\"Không ... đố mày làm nên.\"",1],["MƯA","\"Chuồn chuồn bay thấp thì ..., bay cao thì nắng, bay vừa thì râm.\"",1],["KIM","\"Có công mài sắt, có ngày nên ...\"",1],["CHA","\"Công ... như núi Thái Sơn.\"",1],["MẸ","\"Nghĩa ... như nước trong nguồn chảy ra.\"",1],["BẦU","\"... ơi thương lấy bí cùng.\"",1],["NGỰA","\"Một con ... đau, cả tàu bỏ cỏ.\"",2],["CHÙA","\"Bụt ... nhà không thiêng.\"",2],["TÂM","\"Lực bất tòng ...\": muốn lắm mà sức không theo kịp.",3],["TRE","\"... già măng mọc.\"",1],["NGAY","\"Ăn ... nói thật, mọi tật mọi lành.\"",2],["ĐÈN","\"Gần mực thì đen, gần ... thì rạng.\"",1],["MỰC","\"Gần ... thì đen, gần đèn thì rạng.\"",1],["CHỮ","\"Một ... cũng là thầy, nửa ... cũng là thầy.\"",1],["MIẾNG","\"Một ... khi đói bằng một gói khi no.\"",2],["DÂY","\"Đứt ... động rừng.\"",2],["ĐẮNG","\"Ai ơi bưng bát cơm đầy, dẻo thơm một hạt ... cay muôn phần.\"",2],["GÀ","\"... cùng một mẹ chớ hoài đá nhau.\"",1],["LÁ","\"... lành đùm ... rách.\"",1],["MÁU","\"Một giọt ... đào hơn ao nước lã.\"",2],["MÈO","\"... khen ... dài đuôi.\"",1],["CHUỘT","\"Cháy nhà ra mặt ...\"",1],["VOI","\"Đầu ... đuôi chuột.\"",1],["ẾCH","\"... ngồi đáy giếng.\"",1],["TRÂU","\"... chậm uống nước đục.\"",1],["NỒI","\"... nào úp vung nấy.\"",1],["CHỒNG","\"Thuận vợ thuận ..., tát biển Đông cũng cạn.\"",1],["VỢ","\"Thuận ... thuận chồng, tát biển Đông cũng cạn.\"",1],["GIÓ","\"Gieo ... gặt bão.\"",2],["KIẾN","\"... tha lâu cũng đầy tổ.\"",2],["HỌC","\"... ăn ... nói, ... gói ... mở.\"",1],["ĂN","\"... trông nồi, ngồi trông hướng.\"",1],["CHÂN","\"... cứng đá mềm\": đồng lòng thì việc gì cũng xong.",2],["NƯỚC CHẢY ĐÁ MÒN","Kiên trì mãi thì việc khó cũng xong.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["CÓ CÔNG MÀI SẮT","Vế đầu của câu \"... có ngày nên kim.\"",3,[],"Đây là một câu thành ngữ, tục ngữ."],["TIÊN HỌC LỄ","Vế đầu khẩu hiệu treo trên bảng lớp mình.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["HẬU HỌC VĂN","Vế sau khẩu hiệu treo trên bảng lớp mình.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["ĐI MỘT NGÀY ĐÀNG","\"... học một sàng khôn.\"",3,[],"Đây là một câu thành ngữ, tục ngữ."],["MƯA DẦM THẤM LÂU","Dạy từ từ mà ngấm sâu.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["NƯỚC ĐỔ ĐẦU VỊT","Nói mãi mà không vào đầu.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["ĐÀN GẢY TAI TRÂU","Nói chuyện với người không hiểu gì.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["CƯỚP CƠM CHIM","Lấy của người yếu thế, chim cũng không tha.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["MÈO MÙ VỚ CÁ RÁN","Gặp may bất ngờ, không giỏi mà vẫn trúng.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["CHÓ CẮN ÁO RÁCH","Đã khổ lại còn khổ thêm.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["GIẬU ĐỔ BÌM LEO","Thấy người sa cơ thì xúm vào bắt nạt.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["TRÈO CAO TÉ ĐAU","Tham vọng quá sức thì ngã nặng.",3,["TRÈO CAO NGÃ ĐAU"],"Đây là một câu thành ngữ, tục ngữ."],["CHỊ NGÃ EM NÂNG","Anh em đùm bọc nhau.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["ĂN CHÁO ĐÁ BÁT","Được giúp rồi quay lại phản bội.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["NÓI ÍT HIỂU NHIỀU","Người khôn không cần nói dài.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["CHẬM MÀ CHẮC","Từ từ mà chắc ăn.",2,[],"Đây là một câu thành ngữ, tục ngữ."],["KHÔN NHÀ DẠI CHỢ","Ở nhà thì giỏi, ra ngoài thì lóng ngóng.",3,[],"Đây là một câu thành ngữ, tục ngữ."],["GẦN NHÀ XA NGÕ","Ở gần nhau mà ít gặp.",3,[],"Đây là một câu thành ngữ, tục ngữ."]]},{"f":"15-tuoi-tho","cat":"Tuổi thơ 8x 9x","k":"Đây là kỷ niệm tuổi thơ thế hệ 8x 9x.","s":"","q":[["CỤC GẠCH","Điện thoại Nokia đánh rơi không vỡ.",2,["ĐIỆN THOẠI CỤC GẠCH"]],["NOKIA","Hãng điện thoại có game rắn săn mồi.",2],["BĂNG CASSETTE","Cuộn băng dùng bút chì quấn lại.",3,["BĂNG CÁT SÉT"]],["ĐĨA CD","Đĩa tròn bóng loáng chứa nhạc.",2,["CD"]],["ĐẦU VIDEO","Máy chiếu băng phim ngày xưa.",3],["TIVI ĐEN TRẮNG","Tivi chưa có màu, phải chỉnh râu ăng ten.",3],["ĂNG TEN","Que trên nóc nhà bắt sóng tivi.",2],["CONTRA","Game bắn súng hai người, ba mươi mạng.",3],["GAME THÙNG","Máy chơi game bỏ xu ở tiệm.",3],["TIỆM NET","Chỗ trốn học chơi Đế Chế, Võ Lâm.",2,["QUÁN NET"]],["ĐẾ CHẾ","Game chiến thuật, \"wololo\".",3,["AOE"]],["VÕ LÂM","Game kiếm hiệp online huyền thoại.",3],["GUNNY","Game bắn tọa độ dễ thương.",3],["YAHOO","Ứng dụng chat ngày xưa, có buzz.",2,["YAHOO MESSENGER"]],["BLOG","Trang nhật ký online thời Yahoo 360.",3],["NHẠC CHỜ","Bài hát nghe khi gọi điện chờ bắt máy.",3],["TIN NHẮN","Nhắn chỉ một trăm sáu mươi ký tự, đếm từng chữ.",2,["SMS"]],["TEEN CODE","Kiểu viết \"j` z\" \"h0k\" thời 9x.",3],["LƯU BÚT","Cuốn sổ chuyền tay cuối năm ghi kỷ niệm.",2],["NHẬT KÝ","Sổ có khóa, ghi chuyện thầm kín.",2,["NHẬT KÍ"]],["GIẤY THƠM","Tờ giấy có mùi, sưu tầm kẹp vở.",3],["HÌNH DÁN","Miếng giấy in hoạt hình, bóc ra dính khắp cặp.",2,["STICKER"]],["THẺ BÀI","Thẻ in nhân vật đổi chác với bạn bè.",2],["BI VE","Viên thủy tinh có hoa văn bên trong.",2,["BI"]],["CON QUAY","Quấn dây ném xuống, quay tít.",2,["CON CÙ"]],["TÀU LÁ DỪA","Đồ chơi bện bằng lá.",3],["ĐÈN KÉO QUÂN","Đèn quay hình bóng Trung thu.",3],["SÚNG NƯỚC","Bơm nước bắn nhau mùa hè.",2],["KẸO CU ĐƠ","Kẹo lạc kẹp bánh đa, đặc sản Hà Tĩnh.",3],["KẸO MẠCH NHA","Đựng trong hộp nhỏ, dùng que kéo dài.",3],["KEM QUE","Kem cây giá mấy trăm đồng, bán dạo kêu leng keng.",2],["BÁNH ĐA VỪNG","Đồng nát đổi lấy cái này.",3],["ĐỒNG NÁT","Người đi mua ve chai, đổi kẹo kéo.",3,["VE CHAI"]],["TOM VÀ JERRY","Mèo đuổi chuột, chưa bao giờ bắt được.",3],["DORAEMON","Mèo máy có túi thần kỳ.",2],["NOBITA","Cậu bé lười học, hay khóc nhè gọi mèo máy.",2],["CONAN","Thám tử lừng danh bị teo nhỏ.",2],["SIÊU NHÂN","Năm anh em đủ màu đánh quái vật.",2,["SIÊU NHÂN GAO"]],["TÔN NGỘ KHÔNG","Tề Thiên Đại Thánh trong Tây Du Ký.",3],["TÂY DU KÝ","Phim thầy trò Đường Tăng, hè nào cũng chiếu.",3],["BAO THANH THIÊN","Quan xử án mặt đen, có vầng trăng trên trán.",3],["SONGOKU","Cậu bé có đuôi khỉ đi tìm bảy viên ngọc rồng.",3,["GOKU"]],["SAILOR MOON","Thủy thủ mặt trăng biến hình.",3,["THỦY THỦ MẶT TRĂNG"]],["TRÍ TUỆ VIỆT NAM","Gameshow học sinh ngày xưa trên VTV.",3],["AI LÀ TRIỆU PHÚ","Gameshow có quyền trợ giúp gọi điện cho người thân.",3],["PIKACHU","Chuột điện màu vàng kêu \"pika pika\".",2],["ĐI HỌC BẰNG XE ĐẠP","Ngày xưa chở nhau tới trường bằng cách này.",3],["BÁNH MÌ CHẤM SỮA","Bữa sáng huyền thoại với sữa ông Thọ.",3],["CƠM NẮM MUỐI VỪNG","Mang theo đi học, đi chơi xa.",3],["TEM THƯ","Sưu tầm dán album, gửi thư phải có.",2,["TEM"]],["THƯ TAY","Viết giấy gửi bưu điện, chờ cả tuần.",2],["ĐIỆN THOẠI BÀN","Có dây xoắn, cả nhà dùng chung.",2],["BỐT ĐIỆN THOẠI","Gọi điện công cộng bằng thẻ.",3],["TIVI HỘP","Màn hình lồi, lưng to.",3],["QUẠT NAN","Phe phẩy lúc mất điện.",2,["QUẠT GIẤY"]],["MẤT ĐIỆN","Cả xóm ra ngõ hóng mát, trẻ con đi bắt đom đóm.",2,["CÚP ĐIỆN"]],["GIẾNG NƯỚC","Thả gầu kéo nước lên.",2,["GIẾNG"]],["CHUM NƯỚC","Lu lớn trữ nước mưa.",2,["LU NƯỚC"]],["CHĂN TRÂU","Trẻ con nông thôn cưỡi lưng trâu ra đồng.",2],["TẮM MƯA","Trẻ con cởi trần chạy ra sân mỗi cơn mưa.",2],["BẮT CÀO CÀO","Ra đồng bắt rồi rang.",3],["VỞ Ô LY","Vở kẻ ô để luyện chữ đẹp.",2],["LUYỆN CHỮ ĐẸP","Tô đi tô lại từng nét.",3],["KHĂN MÙI SOA","Khăn tay nhỏ thêu hoa.",3,["KHĂN TAY"]],["BÚT BI THIÊN LONG","Bút học sinh nào cũng có, bấm tạch tạch.",3]]},{"f":"16-gen-z","cat":"Gen Z, mạng xã hội","k":"Đây là từ của giới trẻ, dân mạng.","s":"","q":[["TIKTOK","Ứng dụng video ngắn mình đang xem live.",1],["FACEBOOK","Mạng xã hội màu xanh, có nút like ngón cái.",1],["ZALO","Ứng dụng nhắn tin của Việt Nam, bố mẹ hay dùng.",1],["INSTAGRAM","Mạng đăng ảnh sống ảo, có story.",2],["YOUTUBE","Trang xem video có nút play đỏ.",1],["LIVESTREAM","Phát trực tiếp như kênh mình đang làm.",2,["LIVE"]],["THẢ TIM","Bấm liên tục vào màn hình live.",1],["FOLLOW","Bấm theo dõi kênh.",1,["THEO DÕI"]],["SHARE","Chia sẻ cho bạn bè cùng xem.",1,["CHIA SẺ"]],["HASHTAG","Dấu thăng đứng trước từ khóa.",2],["XU HƯỚNG","Thứ ai cũng làm theo trên mạng, còn gọi trend.",2,["TREND"]],["VIRAL","Video lan truyền chóng mặt.",2],["SỐNG ẢO","Đăng ảnh đẹp lung linh khác ngoài đời.",2],["SELFIE","Tự chụp ảnh mình.",1,["TỰ SƯỚNG"]],["FILTER","Hiệu ứng làm đẹp khi chụp ảnh.",2,["BỘ LỌC"]],["STORY","Đăng hai mươi bốn giờ là mất.",2,["TIN"]],["EMOJI","Biểu tượng mặt cười.",1,["ICON"]],["MEME","Ảnh chế hài hước lan truyền.",2],["IDOL","Thần tượng được fan hâm mộ.",1,["THẦN TƯỢNG"]],["FAN","Người hâm mộ.",1],["ANTI FAN","Người chuyên đi ghét thần tượng.",2],["KPOP","Nhạc Hàn Quốc có BTS, Blackpink.",2],["CRUSH","Người mình thầm thương trộm nhớ.",1],["THẢ THÍNH","Nói ngọt để làm quen.",1],["ĐỘC THÂN","Chưa có người yêu, ế.",1,["Ế"]],["NGƯỜI YÊU CŨ","Người từng yêu, giờ là quá khứ.",2,["NYC"]],["FRIENDZONE","Thích người ta mà người ta chỉ coi là bạn.",3],["TOXIC","Mối quan hệ độc hại.",2],["FLEX","Khoe khoang của cải.",2],["CHILL","Thư giãn, thoải mái.",1],["SLAY","Đỉnh, xuất sắc, cực cháy.",2],["GHOST","Đang nói chuyện thì biến mất, không trả lời.",2,["SEEN KHÔNG REP"]],["SEEN","Đã xem mà không trả lời.",1],["TRÀ XANH","Cô gái chen vào chuyện tình người khác.",2],["SỐNG CHẬM","Lối sống không vội vàng, healing.",2],["HEALING","Đi đâu đó chữa lành tâm hồn.",2,["CHỮA LÀNH"]],["CHECK IN","Chụp ảnh đánh dấu nơi mình tới.",2],["OOTD","Bộ đồ hôm nay mặc.",3],["SKINCARE","Chăm sóc da mỗi tối, mười bước.",2],["MAKEUP","Trang điểm.",1,["TRANG ĐIỂM"]],["NAIL","Sơn vẽ móng tay.",1],["BUBBLE TEA","Tên tiếng Anh của trà sữa trân châu.",3],["MÌ CAY BẢY CẤP ĐỘ","Thử thách ăn cay nổi tiếng.",3],["GAME THỦ","Người chơi game chuyên nghiệp.",2],["GANK","Rình phục kích đánh lén trong game.",2],["FEED","Chết liên tục cho đối thủ ăn mạng.",2],["CARRY","Gánh team một mình.",2,["GÁNH TEAM"]],["NOOB","Gà mờ, chơi dở.",1,["GÀ"]],["PRO","Cao thủ.",1,["CAO THỦ"]],["AFK","Treo máy, bỏ đi giữa trận.",2],["LAG","Mạng chậm, giật hình.",1],["WIFI","Mạng không dây, câu đầu tiên hỏi khi vào quán.",1],["PASS WIFI","Thứ đầu tiên hỏi khi vào quán cà phê.",2,["MẬT KHẨU WIFI"]],["SẠC DỰ PHÒNG","Cục pin mang theo cứu điện thoại.",3,["PIN DỰ PHÒNG"]],["ẢNH ĐẠI DIỆN","Hình hiện cạnh tên tài khoản.",2,["AVATAR"]],["BÌNH LUẬN","Gõ chữ vào khung chat dưới video.",1,["COMMENT"]],["NHẮN TIN","Gửi chữ qua điện thoại.",1,["CHAT"]],["GỌI VIDEO","Gọi điện mà nhìn thấy mặt nhau.",2,["VIDEO CALL"]],["BẠN GÁI","Người yêu là nữ.",1,["NGƯỜI YÊU"]],["FOMO","Sợ bị bỏ lỡ, thấy ai cũng đi thì cũng muốn đi.",3],["OVERTHINKING","Nghĩ quá nhiều đến mất ngủ.",3,["NGHĨ NHIỀU"]],["DEADLINE","Hạn chót nộp bài.",1],["CÀY PHIM","Xem liền mấy tập phim thâu đêm.",2],["CHỐT ĐƠN","Người bán hàng online hay nói.",2],["SĂN SALE","Canh giờ mua hàng giảm giá.",2],["FREESHIP","Miễn phí vận chuyển.",2],["GIỎ HÀNG","Nơi để đồ định mua mà chưa mua.",2],["ĐẶT ĐỒ ĂN","Bấm điện thoại là shipper mang tới.",2],["CHỤP ẢNH THẺ","Chụp kiểu photobooth bốn tấm dọc.",3,["PHOTOBOOTH"]],["MBTI","Bài test tính cách mười sáu nhóm.",3],["CUNG HOÀNG ĐẠO","Bạch Dương, Kim Ngưu, Song Tử...",2],["TAROT","Bói bài vẽ hình phương Tây.",2],["FAN CỨNG","Người theo dõi lâu năm, trung thành.",2],["GEN Z","Thế hệ sinh khoảng năm 1997 tới 2012.",2]]},{"f":"17-am-nhac","cat":"Âm nhạc, nghệ thuật","k":"Đây là thứ thuộc về âm nhạc, nghệ thuật.","s":"","q":[["ĐÀN GHI TA","Nhạc cụ sáu dây ôm ngang đùi.",2,["GUITAR","ĐÀN GUITAR","GHI TA"]],["ĐÀN PIANO","Phím đen phím trắng.",2,["PIANO","DƯƠNG CẦM"]],["ĐÀN BẦU","Nhạc cụ một dây của Việt Nam.",2],["ĐÀN TRANH","Đàn có mười sáu dây, gảy bằng móng.",3],["ĐÀN NHỊ","Hai dây, kéo bằng vĩ.",3,["ĐÀN CÒ"]],["ĐÀN T'RƯNG","Ống tre gõ của Tây Nguyên.",3,["TRƯNG"]],["SÁO TRÚC","Thổi bằng miệng, làm từ ống tre.",2,["SÁO"]],["KÈN","Thổi vào kêu to, có loại bằng đồng trong đám rước.",1],["TRỐNG","Gõ tùng tùng.",1],["CỒNG CHIÊNG","Nhạc cụ đồng của đồng bào Tây Nguyên.",3],["VĨ CẦM","Nhạc cụ kẹp dưới cằm, kéo vĩ.",3,["VIOLIN"]],["MICRO","Cầm hát karaoke.",1,["MIC"]],["LOA","Phát ra âm thanh to.",1],["KARAOKE","Hát theo lời chạy trên màn hình.",1],["BOLERO","Dòng nhạc trữ tình các cô chú mê.",2],["NHẠC RAP","Đọc nhanh có vần, có beat.",2,["RAP"]],["NHẠC VÀNG","Nhạc trữ tình xưa.",2],["QUAN HỌ","Dân ca Bắc Ninh, liền anh liền chị.",2],["CẢI LƯƠNG","Nghệ thuật sân khấu Nam Bộ, có vọng cổ.",3],["CHÈO","Sân khấu dân gian Bắc Bộ, có vai hề.",2],["CA TRÙ","Hát có đàn đáy, phách, trống chầu.",3],["HÁT XẨM","Hát rong ngày xưa của người khiếm thị.",3],["VỌNG CỔ","Bài bản nổi tiếng của cải lương.",3],["ĐỜN CA TÀI TỬ","Nghệ thuật âm nhạc miền Tây được UNESCO công nhận.",3],["RU CON","Mẹ hát à ơi cho bé ngủ.",2,["HÁT RU"]],["NỐT NHẠC","Đồ, rê, mi, pha, son, la, si.",2],["CA SĨ","Người đi hát.",1],["BAN NHẠC","Nhóm chơi nhạc cùng nhau.",2],["DÀN HỢP XƯỚNG","Rất nhiều người cùng hát nhiều bè.",3],["NHẠC TRƯỞNG","Người cầm đũa chỉ huy dàn nhạc.",3],["SÂN KHẤU","Nơi ca sĩ đứng biểu diễn.",1],["BUỔI HÒA NHẠC","Đêm nhạc lớn có nhiều nghệ sĩ.",3,["CONCERT"]],["MV","Video ca nhạc.",1,["MUSIC VIDEO"]],["TRIỆU VIEW","Video có lượt xem khủng.",2],["BẢN HIT","Bài hát ai cũng thuộc.",2,["HIT"]],["LỜI BÀI HÁT","Chữ chạy trên màn hình karaoke.",2],["ĐIỆP KHÚC","Đoạn lặp lại nhiều lần trong bài hát.",2],["NHẢY HIP HOP","Điệu nhảy đường phố.",3,["HIPHOP"]],["BA LÊ","Múa nhón chân, váy xòe.",2,["BALLET"]],["MÚA","Biểu diễn bằng động tác cơ thể.",1],["VẼ TRANH","Dùng cọ và màu.",1],["CỌ VẼ","Cây bút có lông chấm màu.",2],["GIÁ VẼ","Khung ba chân đặt tranh.",3],["TRANH ĐÔNG HỒ","Tranh dân gian in trên giấy dó, có đám cưới chuột.",3],["GIẤY DÓ","Giấy truyền thống làm từ vỏ cây.",3],["SƠN MÀI","Tranh phủ nhiều lớp nhựa cây rồi mài bóng.",3],["ĐIÊU KHẮC","Nghệ thuật tạc tượng.",3],["TƯỢNG","Hình người làm bằng đá hay đồng.",1,["BỨC TƯỢNG"]],["GỐM SỨ","Bát Tràng nổi tiếng nghề này.",2],["THÊU","Dùng kim chỉ tạo hình trên vải.",2],["ĐAN LEN","Đan áo mùa đông bằng hai que.",2],["ORIGAMI","Nghệ thuật gấp giấy Nhật Bản.",3,["GẤP GIẤY"]],["CHỤP ẢNH","Bấm máy ghi lại khoảnh khắc.",1],["QUAY PHIM","Ghi hình động.",1],["RẠP CHIẾU PHIM","Mua vé bắp nước ngồi xem màn hình lớn.",3,["RẠP PHIM"],"Đây là thứ thuộc về phim ảnh, sách truyện."],["PHIM HOẠT HÌNH","Phim vẽ cho trẻ em.",2,["HOẠT HÌNH"],"Đây là thứ thuộc về phim ảnh, sách truyện."],["PHIM KINH DỊ","Xem mà sợ, che mắt.",2,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["PHIM HÀI","Xem cười đau bụng.",1,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["DIỄN VIÊN CHÍNH","Người đóng vai quan trọng nhất phim.",3,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["ĐẠO DIỄN","Người hô \"diễn\" và \"cắt\".",2,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["KỊCH BẢN","Văn bản ghi lời thoại cho diễn viên.",2,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["TRUYỆN TRANH","Sách có hình vẽ, khung thoại.",2,["MANGA"],"Đây là thứ thuộc về phim ảnh, sách truyện."],["TIỂU THUYẾT","Truyện dài nhiều chương.",2,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["THƠ","Có vần có điệu, lục bát.",1,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["LỤC BÁT","Thể thơ câu sáu câu tám.",2,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["TRUYỆN KIỀU","Tác phẩm nổi tiếng của Nguyễn Du.",3,["KIỀU"],"Đây là thứ thuộc về phim ảnh, sách truyện."],["DẾ MÈN","Nhân vật phiêu lưu ký của Tô Hoài.",3,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["TẤM CÁM","Truyện cổ tích có con gà, chiếc hài, quả thị.",2,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["SỌ DỪA","Chàng trai hình quả dừa trong cổ tích.",3,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["THÁNH GIÓNG","Cậu bé vươn vai thành tráng sĩ cưỡi ngựa sắt.",3,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["SƠN TINH","Thần núi đánh nhau với Thủy Tinh.",3,[],"Đây là thứ thuộc về phim ảnh, sách truyện."],["CÂY KHẾ","Truyện ăn một quả trả cục vàng.",2,[],"Đây là thứ thuộc về phim ảnh, sách truyện."]]},{"f":"18-mau-hinh-so","cat":"Màu sắc, hình học, con số","k":"Đây là một màu sắc.","s":"","q":[["MÀU ĐỎ","Màu quả ớt chín, lá cờ.",1,["ĐỎ"]],["MÀU XANH","Màu lá cây, bầu trời.",1,["XANH"]],["MÀU VÀNG","Màu quả chuối chín, ngôi sao trên cờ.",1,["VÀNG"]],["MÀU TÍM","Màu hoa sim, mực tím.",1,["TÍM"]],["MÀU HỒNG","Màu kẹo bông, màu con gái hay thích.",1,["HỒNG"]],["MÀU CAM","Màu quả cam, áo shipper.",1,["CAM"]],["MÀU NÂU","Màu cà phê, đất.",1,["NÂU"]],["MÀU ĐEN","Màu bảng lớp mình.",1,["ĐEN"]],["MÀU TRẮNG","Màu áo dài của cô.",1,["TRẮNG"]],["MÀU XÁM","Màu tro, mây u ám.",2,["XÁM","MÀU GHI"]],["MÀU BẠC","Màu nhẫn bạc, tóc già.",2,["BẠC"]],["CẦU VỒNG BẢY SẮC","Đỏ, cam, vàng, lục, lam, chàm, tím.",3],["HÌNH TRÒN","Hình không có góc nào.",1,[],"Đây là kiến thức hình học."],["HÌNH VUÔNG","Bốn cạnh bằng nhau, bốn góc vuông.",1,[],"Đây là kiến thức hình học."],["HÌNH TAM GIÁC","Có ba cạnh ba góc.",2,[],"Đây là kiến thức hình học."],["HÌNH CHỮ NHẬT","Hai cạnh dài, hai cạnh ngắn, như cái bảng.",3,[],"Đây là kiến thức hình học."],["HÌNH THOI","Bốn cạnh bằng nhau nhưng nghiêng.",2,[],"Đây là kiến thức hình học."],["HÌNH THANG","Có hai cạnh đáy song song.",2,[],"Đây là kiến thức hình học."],["NGÔI SAO NĂM CÁNH","Hình trên lá cờ Việt Nam.",3,[],"Đây là kiến thức hình học."],["HÌNH TRÁI TIM","Hình biểu tượng tình yêu.",2,[],"Đây là kiến thức hình học."],["KHỐI LẬP PHƯƠNG","Hình hộp sáu mặt vuông như con xúc xắc.",3,[],"Đây là kiến thức hình học."],["HÌNH CẦU","Hình tròn như quả bóng.",2,["KHỐI CẦU"],"Đây là kiến thức hình học."],["HÌNH NÓN","Giống cái nón lá, đáy tròn đỉnh nhọn.",3,["KHỐI NÓN"],"Đây là kiến thức hình học."],["ĐƯỜNG THẲNG","Kẻ bằng thước không cong.",2,[],"Đây là kiến thức hình học."],["ĐƯỜNG CONG","Uốn lượn, không thẳng.",2,[],"Đây là kiến thức hình học."],["GÓC VUÔNG","Chín mươi độ, như góc bảng.",2,[],"Đây là kiến thức hình học."],["ĐƯỜNG KÍNH","Đoạn qua tâm hình tròn.",3,[],"Đây là kiến thức hình học."],["BÁN KÍNH","Từ tâm tới đường tròn.",3,[],"Đây là kiến thức hình học."],["CHU VI","Tổng độ dài các cạnh.",2,[],"Đây là kiến thức hình học."],["DIỆN TÍCH","Tính bằng mét vuông.",2,[],"Đây là kiến thức hình học."],["SỐ KHÔNG","Số trước số một.",1,["KHÔNG"],"Đây là con số hoặc phép tính."],["SỐ MỘT","Số đứng đầu, hạng nhất.",1,["MỘT"],"Đây là con số hoặc phép tính."],["MƯỜI","Số ngón tay của hai bàn tay.",1,["SỐ MƯỜI"],"Đây là con số hoặc phép tính."],["MỘT TRĂM","Mười lần mười.",2,["TRĂM"],"Đây là con số hoặc phép tính."],["MỘT NGHÌN","Mười lần một trăm.",2,["NGHÌN","MỘT NGÀN"],"Đây là con số hoặc phép tính."],["MỘT TRIỆU","Một nghìn lần một nghìn.",2,["TRIỆU"],"Đây là con số hoặc phép tính."],["MỘT TỶ","Ước mơ của nhiều người khi mua vé số.",2,["TỶ","TỈ"],"Đây là con số hoặc phép tính."],["PHÉP CỘNG","Một với một thành hai.",2,[],"Đây là con số hoặc phép tính."],["PHÉP TRỪ","Lấy đi bớt.",2,[],"Đây là con số hoặc phép tính."],["PHÉP NHÂN","Bảng cửu chương.",2,[],"Đây là con số hoặc phép tính."],["PHÉP CHIA","Chia đều cho mọi người.",2,[],"Đây là con số hoặc phép tính."],["BẢNG CỬU CHƯƠNG","Học thuộc từ hai nhân một tới chín nhân mười.",3,[],"Đây là con số hoặc phép tính."],["SỐ CHẴN","Số chia hết cho hai.",2,[],"Đây là con số hoặc phép tính."],["SỐ LẺ","Số không chia hết cho hai.",2,[],"Đây là con số hoặc phép tính."],["PHÂN SỐ","Một phần hai, ba phần tư.",2,[],"Đây là con số hoặc phép tính."],["PHẦN TRĂM","Kí hiệu %.",2,[],"Đây là con số hoặc phép tính."],["SỐ PI","Ba phẩy mười bốn.",2,["PI"],"Đây là con số hoặc phép tính."],["TÁ","Mười hai cái.",2,[],"Đây là con số hoặc phép tính."],["CHỤC","Mười cái.",1,[],"Đây là con số hoặc phép tính."],["CẶP","Hai cái đi với nhau.",1,["ĐÔI"],"Đây là con số hoặc phép tính."],["GIÂY","Đơn vị thời gian nhỏ nhất trên đồng hồ.",1,[],"Đây là đơn vị đo."],["PHÚT","Sáu mươi giây.",1,[],"Đây là đơn vị đo."],["GIỜ","Sáu mươi phút.",1,[],"Đây là đơn vị đo."],["NGÀY","Hai mươi bốn giờ.",1,[],"Đây là đơn vị đo."],["TUẦN","Bảy ngày.",1,[],"Đây là đơn vị đo."],["THÁNG","Khoảng ba mươi ngày.",1,[],"Đây là đơn vị đo."],["NĂM","Mười hai tháng.",1,[],"Đây là đơn vị đo."],["THẾ KỶ","Một trăm năm.",2,["THẾ KỈ"],"Đây là đơn vị đo."],["NĂM NHUẬN","Năm tháng hai có hai mươi chín ngày.",3,[],"Đây là đơn vị đo."],["KÍ LÔ GAM","Đơn vị đo cân nặng.",3,["KILOGAM","CÂN","KÝ"],"Đây là đơn vị đo."],["MÉT","Đơn vị đo chiều dài.",1,[],"Đây là đơn vị đo."],["CÂY SỐ","Một nghìn mét.",2,["KI LÔ MÉT","KM"],"Đây là đơn vị đo."],["LÍT","Đơn vị đo chai nước.",1,[],"Đây là đơn vị đo."],["ĐỘ C","Đơn vị đo nhiệt độ.",2,[],"Đây là đơn vị đo."],["LA BÀN","Kim luôn chỉ hướng bắc.",2,[],"Đây là thứ trong giờ toán, giờ địa."],["HƯỚNG ĐÔNG","Nơi mặt trời mọc.",2,["ĐÔNG"],"Đây là thứ trong giờ toán, giờ địa."],["HƯỚNG TÂY","Nơi mặt trời lặn.",2,["TÂY"],"Đây là thứ trong giờ toán, giờ địa."],["BÊN TRÁI","Ngược với bên phải.",1,["TRÁI"],"Đây là thứ trong giờ toán, giờ địa."],["TRÊN DƯỚI","Hai hướng đối nhau theo chiều đứng.",2,[],"Đây là thứ trong giờ toán, giờ địa."],["SỐ LA MÃ","Kiểu chữ số I, V, X trên đồng hồ cổ.",3,[],"Đây là thứ trong giờ toán, giờ địa."],["MÁY TÍNH BỎ TÚI","Cầm tay bấm cộng trừ nhân chia.",3,[],"Đây là thứ trong giờ toán, giờ địa."],["THƯỚC ĐO GÓC","Hình bán nguyệt có độ.",3,[],"Đây là thứ trong giờ toán, giờ địa."]]},{"f":"19-the-gioi","cat":"Thế giới","k":"Đây là một quốc gia.","s":"","q":[["NHẬT BẢN","Xứ sở hoa anh đào.",1,["NHẬT"]],["HÀN QUỐC","Quê hương Kpop, kim chi.",1,["HÀN"]],["TRUNG QUỐC","Có Vạn Lý Trường Thành.",1],["THÁI LAN","Xứ sở chùa vàng.",1],["LÀO","Nước láng giềng có thủ đô Viêng Chăn.",1],["CAMPUCHIA","Có đền Angkor Wat.",2,["CĂM PU CHIA"]],["SINGAPORE","Đảo quốc sư tử.",2,["XING GA PO"]],["MALAYSIA","Có tháp đôi Petronas.",2,["MA LAI XI A"]],["INDONESIA","Đất nước vạn đảo, có Bali.",2],["PHILIPPINES","Đất nước có Manila.",3,["PHI LÍP PIN"]],["ẤN ĐỘ","Có đền Taj Mahal, phim nhảy múa.",1],["NGA","Đất nước rộng nhất thế giới.",1],["MỸ","Có tượng Nữ thần Tự do.",1,["HOA KỲ"]],["ANH","Có tháp đồng hồ Big Ben.",1,["NƯỚC ANH"]],["PHÁP","Có tháp Eiffel.",1],["ĐỨC","Thủ đô Berlin, ô tô nổi tiếng.",1],["NƯỚC Ý","Hình chiếc ủng, có pizza.",1,["Ý"]],["TÂY BAN NHA","Có đấu bò, Real Madrid.",3],["BỒ ĐÀO NHA","Quê Ronaldo.",3],["HÀ LAN","Xứ sở hoa tulip, cối xay gió.",2],["BRAZIL","Xứ sở samba, vũ điệu bóng đá.",2,["BRA XIN"]],["ARGENTINA","Quê Messi.",2,["ÁC HEN TI NA"]],["AI CẬP","Có kim tự tháp, sông Nin.",2],["ÚC","Có chuột túi, Sydney.",1,["NƯỚC ÚC"]],["CANADA","Lá phong đỏ trên quốc kỳ.",2,["CA NA ĐA"]],["THỤY SĨ","Đồng hồ, sô cô la, núi Alps.",3],["HY LẠP","Quê thần thoại, Olympic cổ đại.",2],["TOKYO","Thủ đô Nhật Bản.",2,[],"Đây là một thành phố trên thế giới."],["SEOUL","Thủ đô Hàn Quốc.",2,["XƠ UN"],"Đây là một thành phố trên thế giới."],["BẮC KINH","Thủ đô Trung Quốc.",2,[],"Đây là một thành phố trên thế giới."],["BANGKOK","Thủ đô Thái Lan.",2,["BĂNG CỐC"],"Đây là một thành phố trên thế giới."],["PARIS","Kinh đô ánh sáng.",2,["PA RI"],"Đây là một thành phố trên thế giới."],["LONDON","Thủ đô nước Anh.",2,["LUÂN ĐÔN"],"Đây là một thành phố trên thế giới."],["NEW YORK","Thành phố không ngủ, có Quảng trường Thời đại.",3,["NIU OÓC"],"Đây là một thành phố trên thế giới."],["VIÊNG CHĂN","Thủ đô của Lào.",3,[],"Đây là một thành phố trên thế giới."],["KIM TỰ THÁP","Lăng mộ hình chóp của pharaoh.",2,[],"Đây là kỳ quan, danh thắng thế giới."],["THÁP EIFFEL","Tháp sắt ở Paris.",3,["EIFFEL"],"Đây là kỳ quan, danh thắng thế giới."],["NỮ THẦN TỰ DO","Bức tượng cầm ngọn đuốc ở New York.",3,[],"Đây là kỳ quan, danh thắng thế giới."],["ANGKOR WAT","Quần thể đền cổ Campuchia.",3,[],"Đây là kỳ quan, danh thắng thế giới."],["ĐẤU TRƯỜNG LA MÃ","Nơi giác đấu thời cổ ở Ý.",3,[],"Đây là kỳ quan, danh thắng thế giới."],["NÚI PHÚ SĨ","Ngọn núi biểu tượng của Nhật.",3,["PHÚ SĨ"],"Đây là kỳ quan, danh thắng thế giới."],["EVEREST","Đỉnh núi cao nhất thế giới.",2,[],"Đây là kỳ quan, danh thắng thế giới."],["SÔNG NIN","Con sông dài nhất châu Phi.",2,[],"Đây là kỳ quan, danh thắng thế giới."],["AMAZON","Rừng mưa lớn nhất thế giới.",2,[],"Đây là kỳ quan, danh thắng thế giới."],["BẮC CỰC","Nơi có gấu trắng.",2,[],"Đây là kỳ quan, danh thắng thế giới."],["NAM CỰC","Nơi có chim cánh cụt.",2,[],"Đây là kỳ quan, danh thắng thế giới."],["CHÂU Á","Châu lục rộng nhất, Việt Nam thuộc đây.",1,[],"Đây là châu lục, vùng đất trên trái đất."],["CHÂU ÂU","Có Pháp, Đức, Ý.",1,[],"Đây là châu lục, vùng đất trên trái đất."],["CHÂU PHI","Có sa mạc Sahara, sư tử.",1,[],"Đây là châu lục, vùng đất trên trái đất."],["CHÂU MỸ","Có Mỹ, Brazil.",1,[],"Đây là châu lục, vùng đất trên trái đất."],["CHÂU ĐẠI DƯƠNG","Có Úc, New Zealand.",2,[],"Đây là châu lục, vùng đất trên trái đất."],["SAHARA","Sa mạc lớn nhất châu Phi.",2,[],"Đây là châu lục, vùng đất trên trái đất."],["THÁI BÌNH DƯƠNG","Đại dương lớn nhất.",3,[],"Đây là châu lục, vùng đất trên trái đất."],["ĐƯỜNG XÍCH ĐẠO","Vòng chia trái đất làm hai bán cầu.",3,["XÍCH ĐẠO"],"Đây là châu lục, vùng đất trên trái đất."],["QUẢ ĐỊA CẦU","Mô hình trái đất xoay được.",3,[],"Đây là châu lục, vùng đất trên trái đất."],["BẢN ĐỒ","Tờ giấy vẽ đường đi, quốc gia.",2,[],"Đây là châu lục, vùng đất trên trái đất."],["HỘ CHIẾU","Sổ nhỏ cần có khi ra nước ngoài.",2,["PASSPORT"],"Đây là thứ gắn với nước ngoài."],["VISA","Giấy cho phép nhập cảnh.",2,["THỊ THỰC"],"Đây là thứ gắn với nước ngoài."],["ĐÔ LA","Tiền của Mỹ.",2,["USD"],"Đây là thứ gắn với nước ngoài."],["EURO","Tiền chung châu Âu.",2,[],"Đây là thứ gắn với nước ngoài."],["YÊN","Tiền Nhật.",2,[],"Đây là thứ gắn với nước ngoài."],["WON","Tiền Hàn Quốc.",2,[],"Đây là thứ gắn với nước ngoài."],["TIẾNG ANH","Ngôn ngữ quốc tế phổ biến nhất.",2,[],"Đây là thứ gắn với nước ngoài."],["TIẾNG NHẬT","Có chữ Hiragana, Katakana.",2,[],"Đây là thứ gắn với nước ngoài."],["LIÊN HỢP QUỐC","Tổ chức của gần như mọi quốc gia, viết tắt UN.",3,[],"Đây là thứ gắn với nước ngoài."],["ASEAN","Hiệp hội các nước Đông Nam Á.",2,[],"Đây là thứ gắn với nước ngoài."],["CƠM CÀ RI","Món nổi tiếng của Ấn Độ.",3,["CÀ RI"],"Đây là thứ gắn với nước ngoài."],["MÌ Ý","Spaghetti sốt cà chua.",2,["SPAGHETTI"],"Đây là thứ gắn với nước ngoài."],["TACO","Bánh kẹp của Mexico.",3,[],"Đây là thứ gắn với nước ngoài."],["KANGAROO","Thú có túi của Úc.",2,[],"Đây là thứ gắn với nước ngoài."],["KOALA","Gấu ôm cây ở Úc.",3,["GẤU KOALA"],"Đây là thứ gắn với nước ngoài."]]},{"f":"20-gia-dinh","cat":"Gia đình, cảm xúc","k":"Đây là người trong gia đình, họ hàng.","s":"","q":[["BỐ","Người đàn ông nuôi lớn mình, còn gọi ba.",1,["BA","CHA"]],["MẸ","Người sinh ra mình, còn gọi má.",1,["MÁ"]],["ÔNG NỘI","Bố của bố.",2],["BÀ NỘI","Mẹ của bố.",2],["ÔNG NGOẠI","Bố của mẹ.",2],["BÀ NGOẠI","Mẹ của mẹ.",2],["ANH TRAI","Con trai lớn hơn mình cùng bố mẹ.",2],["CHỊ GÁI","Con gái lớn hơn mình cùng bố mẹ.",2],["EM BÉ","Mới sinh, khóc oe oe.",1],["CÔ RUỘT","Em gái của bố.",3,["CÔ"]],["CHÚ","Em trai của bố.",1],["BÁC","Anh hoặc chị của bố mẹ.",1],["DÌ","Em gái của mẹ.",1],["CẬU","Anh em trai của mẹ.",1],["MỢ","Vợ của cậu.",2],["THÍM","Vợ của chú.",2],["DƯỢNG","Chồng của dì.",2],["CHÁU","Con của anh chị em mình.",1],["CHẮT","Con của cháu.",2],["ANH HỌ","Con trai của bác, lớn hơn mình.",3],["SINH ĐÔI","Hai anh em sinh cùng lúc, giống nhau như đúc.",2],["CON ĐẦU LÒNG","Đứa con sinh ra đầu tiên.",3],["CON ÚT","Đứa nhỏ nhất nhà, hay được cưng.",2,["ÚT"]],["CON MỘT","Không có anh chị em.",2],["GIA ĐÌNH","Bố mẹ và các con.",1],["HỌ HÀNG","Bà con nội ngoại.",2],["HÀNG XÓM","Người sống sát vách nhà mình.",1,[],"Đây là người quen quanh mình."],["MẸ CHỒNG","Mẹ của chồng, hay bị kể trong phim.",2],["CON DÂU","Vợ của con trai.",2],["CON RỂ","Chồng của con gái.",2],["BỐ VỢ","Bố của vợ.",2,["NHẠC PHỤ"]],["VỢ CHỒNG","Hai người đã cưới nhau.",2],["VUI VẺ","Cảm giác khi được điểm mười.",1,["VUI"],"Đây là một cảm xúc."],["BUỒN","Cảm giác khi bị điểm kém.",1,["BUỒN BÃ"],"Đây là một cảm xúc."],["GIẬN DỮ","Mặt đỏ phừng phừng, muốn hét lên.",2,["GIẬN","TỨC GIẬN"],"Đây là một cảm xúc."],["SỢ HÃI","Gặp ma thì cảm thấy vậy.",2,["SỢ"],"Đây là một cảm xúc."],["NGẠI NGÙNG","Đỏ mặt khi gặp crush.",2,["NGẠI"],"Đây là một cảm xúc."],["TỰ HÀO","Cảm giác khi con đạt giải.",2,[],"Đây là một cảm xúc."],["GHEN TỊ","Thấy bạn có đồ mới mình không có.",2,["GHEN"],"Đây là một cảm xúc."],["CÔ ĐƠN","Một mình không ai bên cạnh.",2,[],"Đây là một cảm xúc."],["HẠNH PHÚC","Cảm giác khi ở bên người mình thương.",2,[],"Đây là một cảm xúc."],["BẤT NGỜ","Không đoán trước được.",2,[],"Đây là một cảm xúc."],["CHÁN","Không có gì làm, ngồi ngáp.",1,["CHÁN NẢN"],"Đây là một cảm xúc."],["LO LẮNG","Mai thi mà chưa học bài.",2,["LO"],"Đây là một cảm xúc."],["HỒI HỘP","Tim đập nhanh chờ công bố kết quả.",2,[],"Đây là một cảm xúc."],["NHỚ NHÀ","Đi xa lâu ngày cảm thấy vậy.",2,[],"Đây là một cảm xúc."],["BIẾT ƠN","Cảm giác với thầy cô dạy dỗ.",2,[],"Đây là một cảm xúc."],["XẤU HỔ","Bị bắt quả tang quay cóp.",2,["MẮC CỠ"],"Đây là một cảm xúc."],["TỨC CƯỜI","Thấy buồn cười không nhịn được.",2,[],"Đây là một cảm xúc."],["THẤT VỌNG","Mong nhiều mà không được.",2,[],"Đây là một cảm xúc."],["YÊU THƯƠNG","Cảm giác dành cho gia đình.",2,[],"Đây là một cảm xúc."],["HIỀN","Tính tình dễ chịu, không nóng nảy.",1,["HIỀN LÀNH"],"Đây là một tính cách."],["NGOAN","Biết vâng lời bố mẹ.",1,["NGOAN NGOÃN"],"Đây là một tính cách."],["LƯỜI","Không thích làm gì cả.",1,["LƯỜI BIẾNG"],"Đây là một tính cách."],["CHĂM CHỈ","Học hành siêng năng.",2,["SIÊNG NĂNG"],"Đây là một tính cách."],["DŨNG CẢM","Không sợ nguy hiểm.",2,["GAN DẠ"],"Đây là một tính cách."],["THẬT THÀ","Không nói dối.",2,["TRUNG THỰC"],"Đây là một tính cách."],["NÓI DỐI","Nói không đúng sự thật, mũi Pinocchio dài ra.",2,[],"Đây là một tính cách."],["HÀI HƯỚC","Hay pha trò làm người khác cười.",2,["VUI TÍNH"],"Đây là một tính cách."],["KEO KIỆT","Giữ tiền khư khư, không chịu chi.",2,["KẸT XỈ"],"Đây là một tính cách."],["HÀO PHÓNG","Rộng rãi, hay cho người khác.",3,[],"Đây là một tính cách."],["NHÚT NHÁT","Không dám nói chuyện với người lạ.",2,[],"Đây là một tính cách."],["TỰ TIN","Dám đứng lên phát biểu trước lớp.",2,[],"Đây là một tính cách."],["NÓNG TÍNH","Hay nổi cáu.",2,[],"Đây là một tính cách."],["LẠC QUAN","Luôn nghĩ tích cực.",3,[],"Đây là một tính cách."],["KIÊN NHẪN","Chờ đợi không vội vàng.",3,[],"Đây là một tính cách."],["TÒ MÒ","Thích biết chuyện của người khác.",2,[],"Đây là một tính cách."],["ĐÃNG TRÍ","Hay quên trước quên sau.",2,["HAY QUÊN"],"Đây là một tính cách."],["HAY KHÓC","Khóc nhè suốt ngày.",2,["MÍT ƯỚT"],"Đây là một tính cách."],["LÉM LỈNH","Nhanh nhảu, tinh nghịch.",3,[],"Đây là một tính cách."],["ĐỎNG ĐẢNH","Hay làm nũng, thất thường.",3,[],"Đây là một tính cách."]]},{"f":"21-khoa-hoc","cat":"Khoa học, công nghệ","k":"Đây là thứ thuộc về khoa học, công nghệ.","s":"","q":[["KÍNH LÚP","Phóng to chữ nhỏ, có cán cầm.",2],["KÍNH HIỂN VI","Nhìn thấy vi khuẩn.",3],["KÍNH THIÊN VĂN","Ngắm sao trên trời.",3],["NAM CHÂM","Hút sắt.",2],["ĐIỆN","Chạy trong dây, làm sáng bóng đèn.",1],["PIN","Cục nhỏ lắp vào điều khiển tivi.",1],["TRỌNG LỰC","Lực làm quả táo rơi xuống đất.",3,["LỰC HẤP DẪN"]],["ÁNH SÁNG","Đi nhanh nhất vũ trụ.",2],["ÂM THANH","Tai nghe được, truyền qua không khí.",2],["NHIỆT","Năng lượng làm nóng.",2],["NƯỚC SÔI","Một trăm độ C.",2],["NƯỚC ĐÓNG BĂNG","Không độ C.",3,["ĐÓNG BĂNG"]],["BỐC HƠI","Nước biến thành hơi khi nóng.",2,["BAY HƠI"]],["TAN CHẢY","Kem để ngoài nắng bị vậy.",2],["NGUYÊN TỬ","Hạt nhỏ xíu tạo nên mọi vật.",3],["PHÂN TỬ","Gồm nhiều nguyên tử liên kết.",3],["VI KHUẨN","Sinh vật nhỏ xíu, có loại có lợi, có loại gây bệnh.",2],["VIRUS","Gây cảm cúm, nhỏ hơn vi khuẩn.",2,["VI RÚT"]],["QUANG HỢP","Cây xanh dùng ánh sáng tạo thức ăn.",3],["HẠT GIỐNG","Gieo xuống đất sẽ nảy mầm.",2],["NẢY MẦM","Hạt đậu nứt vỏ mọc chồi.",2],["RỄ CÂY","Phần cây hút nước dưới đất.",2,["RỄ"]],["LÁ CÂY","Màu xanh, quang hợp.",1],["KHỦNG LONG","Bò sát khổng lồ tuyệt chủng.",2],["HÓA THẠCH","Xương động vật cổ hóa đá.",3],["TIẾN HÓA","Thuyết của Darwin.",3],["ROBOT","Máy móc biết làm việc như người.",1,["RÔ BỐT"]],["TRÍ TUỆ NHÂN TẠO","Máy biết suy nghĩ, viết tắt AI.",3,["AI"]],["CHATGPT","Trợ lý AI trò chuyện nổi tiếng.",2],["MÁY ẢNH","Chụp hình, có ống kính.",2],["MÁY IN","In tài liệu ra giấy.",2],["MÁY PHOTO","Sao chép tài liệu.",2],["INTERNET","Mạng toàn cầu.",1,["MẠNG"]],["EMAIL","Thư điện tử.",1,["THƯ ĐIỆN TỬ"]],["MẬT KHẨU","Dãy ký tự bí mật để đăng nhập.",2,["PASSWORD"]],["ỨNG DỤNG","Phần mềm tải về điện thoại.",2,["APP"]],["PHẦN MỀM","Chương trình chạy trên máy tính.",2],["VIRUS MÁY TÍNH","Chương trình độc hại.",3],["ĐIỆN TOÁN ĐÁM MÂY","Lưu dữ liệu trên mạng.",3,["CLOUD"]],["BLUETOOTH","Kết nối không dây tai nghe.",2],["USB","Thanh nhỏ cắm máy tính lưu dữ liệu.",2],["MÀN HÌNH","Phần hiển thị hình ảnh.",1],["CẢM ỨNG","Chạm tay vào màn hình là dùng được.",2],["CAMERA","Ống kính trên điện thoại.",1],["QR CODE","Ô vuông đen trắng quét để chuyển khoản.",2,["MÃ QR"]],["CHUYỂN KHOẢN","Gửi tiền qua ngân hàng bằng điện thoại.",2],["GPS","Định vị chỉ đường.",2,["ĐỊNH VỊ"]],["VỆ TINH","Bay quanh trái đất, truyền sóng.",2],["ĐIỆN GIÓ","Cánh quạt khổng lồ ven biển.",2],["THỦY ĐIỆN","Nhà máy điện từ đập nước.",3],["Ô NHIỄM","Khói bụi, rác thải làm bẩn môi trường.",2],["RÁC THẢI NHỰA","Túi ni lông trăm năm không phân hủy.",3],["TÁI CHẾ","Biến đồ cũ thành đồ mới.",2],["TIẾT KIỆM ĐIỆN","Ra khỏi phòng nhớ tắt đèn.",3],["PHÒNG THÍ NGHIỆM","Nơi làm thí nghiệm, có ống nghiệm.",3],["ỐNG NGHIỆM","Ống thủy tinh nhỏ trong giờ hóa.",2],["BẢNG TUẦN HOÀN","Bảng xếp các nguyên tố hóa học.",3],["NƯỚC MUỐI","Súc miệng sát khuẩn.",2],["AXIT","Chất chua, có thể ăn mòn.",2,["A XÍT"]],["KIM LOẠI","Sắt, đồng, nhôm.",2],["NHỰA","Vật liệu làm chai nước, đồ chơi.",1],["THỦY TINH","Làm cốc, trong suốt dễ vỡ.",2],["CAO SU","Làm lốp xe, dây thun.",2],["XE TỰ LÁI","Ô tô không cần người cầm lái.",3],["THỰC TẾ ẢO","Đeo kính vào như đang ở thế giới khác.",3,["VR"]],["NHÀ PHÁT MINH","Edison là một người như vậy.",3],["BÓNG ĐÈN SỢI ĐỐT","Phát minh nổi tiếng của Edison.",3]]},{"f":"22-mon-hoc","cat":"Môn học","k":"Đây là một môn học.","s":"","q":[["TOÁN","Môn có cộng trừ nhân chia.",1],["TIẾNG VIỆT","Môn tập đọc, tập viết, chính tả ở tiểu học.",2],["NGỮ VĂN","Môn viết văn tả mẹ, phân tích bài thơ.",2,["VĂN"]],["LỊCH SỬ","Môn học về các triều đại, năm tháng xưa.",2,["SỬ"]],["ĐỊA LÝ","Môn học về sông núi, bản đồ.",2,["ĐỊA LÍ","ĐỊA"]],["THỂ DỤC","Môn học ngoài sân, chạy nhảy.",1],["HÓA HỌC","Môn có bảng tuần hoàn và ống nghiệm.",2,["HÓA"]],["SINH HỌC","Môn học về tế bào, cây cối, con vật.",2,["SINH"]],["VẬT LÝ","Môn có định luật Newton.",2,["VẬT LÍ","LÝ","LÍ"]],["MỸ THUẬT","Môn vẽ tranh, tô màu.",2,["MĨ THUẬT"]],["ÂM NHẠC","Môn tập hát, học nốt nhạc.",1,["NHẠC"]],["TIN HỌC","Môn học máy tính.",2,["TIN"]],["NGOẠI NGỮ","Môn học tiếng nước ngoài.",2],["GIÁO DỤC CÔNG DÂN","Môn dạy đạo đức, pháp luật.",3,["GDCD"]],["CÔNG NGHỆ","Môn học trồng cây, nấu ăn, lắp mạch điện.",3],["ĐẠO ĐỨC","Môn dạy lễ phép ở tiểu học.",2],["TẬP VIẾT","Môn tô chữ trong vở ô li.",2],["CHÍNH TẢ","Cô đọc cả lớp viết, sai dấu là trừ điểm.",2],["KỂ CHUYỆN","Tiết học đứng trước lớp kể lại câu chuyện.",2],["KHOA HỌC","Môn tìm hiểu tự nhiên ở lớp bốn, lớp năm.",2],["HÌNH HỌC","Phần toán về tam giác, đường tròn.",2],["ĐẠI SỐ","Phần toán có x, y, phương trình.",3],["TIẾNG ANH","Môn học có \"hello\", \"how are you\".",1],["QUỐC PHÒNG","Môn học tháo lắp súng, đi đều bước ở cấp ba.",3,["GIÁO DỤC QUỐC PHÒNG"]],["LUYỆN TỪ VÀ CÂU","Phân môn tiếng Việt học danh từ, động từ.",3],["TẬP ĐỌC","Đứng lên đọc to bài văn trong sách.",2],["TẬP LÀM VĂN","Phân môn viết bài văn ngắn.",3],["THỦ CÔNG","Môn cắt dán giấy màu.",2],["HÁT NHẠC","Tiết cả lớp vỗ tay hát theo cô.",2],["LÝ THUYẾT","Phần học trên sách, chưa thực hành.",3],["THỰC HÀNH","Phần làm thật trong phòng thí nghiệm.",3]]},{"f":"23-do-meo","cat":"Đố mẹo","k":"Câu đố mẹo nè, cẩn thận bị cô lừa nha.","s":"meo","q":[["QUẦN ĐẢO","Quần gì rộng nhất thế giới?",2],["XÃ HỘI","Xã gì đông dân nhất?",2],["KÉO CO","Môn thể thao gì muốn thắng thì phải đi lùi?",2],["TÊN","Cái gì của mình mà người khác gọi nhiều hơn mình?",2,["CÁI TÊN"]],["ĐƯỜNG ĐỜI","Con đường nào dài nhất?",2],["THÁNG HAI","Tháng nào trong năm ngắn nhất?",2,["THÁNG 2"]],["THAN","Lúc mua thì đen, lúc dùng thì đỏ, bỏ đi thì xám là cái gì?",2,["CỤC THAN"]],["CÁI BÓNG","Cái gì lúc nào cũng đi theo mình mà không bao giờ bắt được?",2,["BÓNG"]],["CÁI LỖ","Cái gì càng lấy bớt đi thì càng to ra?",2,["LỖ"]],["TUỔI","Cái gì chỉ tăng mà không bao giờ giảm?",2,["TUỔI TÁC"]],["BÍ MẬT","Cái gì nói ra một cái là mất ngay?",2],["ĐỒNG HỒ","Cái gì có mặt, có kim mà không biết khâu vá?",2],["CÁI LƯỢC","Cái gì có răng mà không bao giờ cắn ai?",2,["LƯỢC"]],["QUẢ TRỨNG","Cái gì phải đập vỡ ra rồi mới dùng được?",2,["TRỨNG"]],["CÁI KHĂN","Cái gì càng lau càng ướt?",2,["KHĂN","KHĂN TẮM"]],["CON CUA","Con gì lúc nào cũng đi ngang mà không bị ai phạt?",2,["CUA"]],["CÁI GHẾ","Cái gì có bốn chân, có lưng mà không đi được?",2,["GHẾ"]],["CÁI CHAI","Cái gì có cổ mà không có đầu?",2,["CHAI","ÁO","CÁI ÁO"]],["CÂY KIM","Cái gì có một mắt mà không nhìn thấy gì?",2,["KIM","KIM KHÂU"]],["NGÀY MAI","Cái gì luôn ở phía trước mà không bao giờ tới?",2],["RĂNG","Cái gì ngày nào cũng bị đánh mà không kêu đau?",2,["HÀM RĂNG"]],["CÁI GỐI","Cái gì đêm nào cũng nằm dưới đầu mình?",2,["GỐI"]],["TIẾNG VỌNG","Cái gì nhại lại lời mình mà không có miệng?",2,["TIẾNG VANG"]],["CẦU THANG","Cái gì có lên có xuống mà không nhúc nhích?",2],["CÁI GƯƠNG","Cái gì nhìn vào là thấy mình mà không phải ảnh chụp?",2,["GƯƠNG"]],["CƠN MƯA","Cái gì rơi từ trên cao xuống mà không bao giờ bị đau?",2,["MƯA"]],["CHÌA KHÓA","Cái gì có răng mà mở được cửa?",2],["SỐ CHÍN","Số nào lộn ngược lại thì thành số sáu?",2,["CHÍN","9"]],["ĐÔI GIÀY","Cái gì có lưỡi mà không biết nói?",2,["GIÀY","CÁI GIÀY"]],["NƯỚC","Cái gì càng rửa càng bẩn?",2],["HÔM QUA","Ngày nào không bao giờ quay trở lại?",2],["CÂY NẾN","Cái gì càng cháy càng ngắn lại?",2,["NẾN"]],["ĐÔI MẮT","Cái gì nhắm lại thì không thấy gì?",2,["MẮT"]],["LỜI HỨA","Cái gì đã cho người khác rồi mà mình vẫn phải giữ?",2],["TRÁI TIM","Cái gì đập suốt ngày đêm mà không ai la?",2,["TIM"]],["TỜ LỊCH","Cái gì mỗi ngày bị xé đi một tờ?",2,["LỊCH"]],["CON ỐC","Con gì đi đâu cũng cõng nhà theo?",2,["ỐC","ỐC SÊN","CON ỐC SÊN","RÙA","CON RÙA"]],["QUẢ DỨA","Quả gì có cả trăm mắt mà không nhìn thấy gì?",2,["DỨA","THƠM","QUẢ THƠM","TRÁI THƠM","KHÓM"]],["BẮP NGÔ","Cây gì có râu, mặc áo nhiều lớp, bên trong toàn hạt vàng?",2,["NGÔ","BẮP","TRÁI BẮP"]],["QUẢ CHUỐI","Quả gì mặc áo vàng, ăn xong thì vứt áo đi?",2,["CHUỐI","TRÁI CHUỐI"]],["CON GÀ","Con gì báo thức mỗi sáng mà không cần pin?",2,["GÀ","GÀ TRỐNG","CON GÀ TRỐNG"]],["CÁI Ô","Cái gì trời mưa thì mở, trời tạnh thì gấp?",2,["Ô","DÙ","CÁI DÙ","CÂY DÙ"]],["CỦ HÀNH","Cái gì làm người ta rơi nước mắt mà không đánh ai?",2,["HÀNH","HÀNH TÂY"]],["VIÊN PHẤN","Cái gì càng viết càng ngắn lại?",2,["PHẤN","BÚT CHÌ","CÂY BÚT CHÌ"]],["BẢN ĐỒ","Cái gì có sông mà không có nước, có núi mà không có đá?",2],["ĐÁM MÂY","Cái gì bay lơ lửng trên trời mà không có cánh?",2,["MÂY","BÓNG BAY"]],["CON ĐƯỜNG","Cái gì đi khắp nơi mà vẫn nằm yên một chỗ?",2,["ĐƯỜNG"]],["CÁI KÉO","Cái gì có hai lưỡi mà không biết nói, chỉ biết cắt?",2,["KÉO"]],["BONG BÓNG","Cái gì càng thổi càng to?",2,["BÓNG BAY","QUẢ BÓNG BAY"]],["CƠN GIÓ","Cái gì thổi bay mũ mà không ai nhìn thấy?",2,["GIÓ"]],["CÁI CÂN","Cái gì biết mình nặng bao nhiêu ký?",2,["CÂN"]],["NHIỆT KẾ","Cái gì biết mình bị sốt mà không phải bác sĩ?",2,["CẶP NHIỆT ĐỘ","CẶP NHIỆT"]],["MẶT TRỜI","Ông gì sáng nào cũng dậy sớm hơn cả lớp?",2,["ÔNG MẶT TRỜI"]],["MẶT TRĂNG","Cái gì chỉ sáng vào ban đêm, có lúc tròn có lúc khuyết?",2,["TRĂNG","ÔNG TRĂNG"]],["HEO ĐẤT","Con gì không ăn cơm mà chỉ ăn tiền?",2,["LỢN ĐẤT","CON HEO ĐẤT"]],["CÂY CẦU","Cái gì bắc ngang sông cho người đi qua mà không phải con đò?",2,["CẦU"]],["ĐIỆN THOẠI","Cái gì nhỏ xíu mà nói chuyện được với người ở rất xa?",2,["DI ĐỘNG"]],["TI VI","Cái hộp gì có người nói chuyện ở bên trong?",2,["TV"]],["TỦ LẠNH","Cái tủ gì mùa hè ai cũng thích mở ra?",2],["CÁI QUẠT","Cái gì quay vù vù cả ngày mà không chóng mặt?",2,["QUẠT","QUẠT MÁY"]],["XE ĐẠP","Xe gì không cần xăng, chỉ cần đôi chân?",2],["MÁY BAY","Cái gì bay trên trời mà chở được cả trăm người?",2,["PHI CƠ"]],["CON CHÓ","Con gì giữ nhà mà không cần chìa khóa?",2,["CHÓ"]],["CON MÈO","Con gì rửa mặt mà không cần nước?",2,["MÈO"]],["CON VOI","Con gì có vòi mà không phải cái ấm?",2,["VOI"]],["CÁI ẤM","Cái gì có vòi mà không phải con voi?",2,["ẤM","ẤM NƯỚC","ẤM TRÀ"]],["CON NHỆN","Con gì không có máy mà dệt được lưới?",2,["NHỆN"]],["CON ONG","Con gì làm ra mật mà không cần nhà máy?",2,["ONG"]],["CON CÚ","Con gì thức suốt đêm mà không phải học bài?",2,["CÚ","CÚ MÈO"]],["CON CHUỘT","Con gì sợ mèo mà ngày nào cũng nằm cạnh máy tính?",2,["CHUỘT"]],["CON TÔM","Con gì càng nấu càng đỏ?",2,["TÔM","CUA","CON CUA"]],["BÚP BÊ","Em bé gì không bao giờ khóc đòi ăn?",2],["ÔNG GIÀ NOEL","Ông gì mỗi năm chỉ đi làm đúng một đêm?",2,["ÔNG GIÀ NÔ EN","ÔNG GIÀ NOEN"]],["CỘT ĐIỆN","Cái gì đứng suốt ngày ngoài đường mà không mỏi chân?",2],["BÙ NHÌN","Ông gì đứng ngoài đồng đuổi chim mà không biết đi?",2,["THẰNG BÙ NHÌN"]],["CÁI MŨI","Cái gì có hai lỗ mà không phải ổ cắm điện?",2,["MŨI","LỖ MŨI"]],["CÁI TAI","Cái gì nghe hết mọi chuyện mà không bao giờ nói?",2,["TAI","LỖ TAI"]],["CÁI LƯỠI","Cái gì ở trong miệng, nếm được mọi món mà không phải răng?",2,["LƯỠI"]],["MÁI TÓC","Cái gì càng cắt càng mọc dài ra?",2,["TÓC","MÓNG TAY"]],["CHIẾC LÁ","Cái gì mùa thu rơi đầy sân mà không ai ném?",2,["LÁ","LÁ CÂY"]],["CỤC TẨY","Cái gì càng dùng càng nhỏ, chuyên đi xoá lỗi sai?",2,["TẨY","GÔM","CỤC GÔM"]],["RA CHƠI","Giờ gì cả lớp mong nhất?",2,["GIỜ RA CHƠI"]],["QUẢ ỚT","Quả gì nhỏ xíu mà ăn vào nóng ran cả miệng?",2,["ỚT","TRÁI ỚT"]],["SỐ KHÔNG","Số gì nhân với số nào cũng ra chính nó?",2,["KHÔNG","0","SỐ 0"]],["SỐ MỘT","Số gì nhân với số nào cũng ra đúng số kia?",2,["MỘT","1","SỐ 1"]],["CẦU VỒNG","Cây cầu gì có bảy màu mà không ai đi qua được?",2,["CẦU VÒNG"]],["CON DIỀU","Con gì bay được nhờ một sợi dây?",2,["DIỀU","CÁNH DIỀU"]],["CÁI BÁT","Cái gì ngày nào cũng đựng cơm mà không ăn miếng nào?",2,["BÁT","CHÉN","CÁI CHÉN"]],["ĐÔI ĐŨA","Hai anh em gì ngày nào cũng gắp đồ ăn cho mình?",2,["ĐŨA"]],["BÓNG ĐÈN","Quả gì bật lên thì sáng mà không ăn được?",2,["ĐÈN","QUẢ BÓNG ĐÈN"]],["BÀN CHẢI","Cái gì có lông mà sáng nào cũng chà lên răng?",2,["BÀN CHẢI ĐÁNH RĂNG"]],["CÁI CẶP","Cái gì ngày nào cũng đi học mà không biết chữ?",2,["CẶP","CẶP SÁCH","BA LÔ"]],["BẢNG ĐEN","Cái gì cô viết lên suốt mà không bao giờ đầy?",2,["BẢNG"]],["CÁI THƯỚC","Cái gì không biết đếm mà đo được mọi thứ?",2,["THƯỚC","THƯỚC KẺ"]],["QUYỂN SÁCH","Cái gì có lá mà không phải cây, có gáy mà không phải người?",2,["SÁCH","CUỐN SÁCH","VỞ","QUYỂN VỞ"]],["CON MUỖI","Con gì hát vo ve bên tai mà không ai muốn nghe?",2,["MUỖI"]],["GIẤC NGỦ","Cái gì đêm nào cũng tới mà không gõ cửa?",2,["GIẤC MƠ"]],["BÓNG ĐÁ","Môn gì hai mươi hai người tranh nhau một quả bóng?",2,["ĐÁ BÓNG"]],["NHÀ VỆ SINH","Phòng gì ai cũng phải vào mà chẳng ai muốn ở lâu?",2,["PHÒNG VỆ SINH","TOILET","WC"]],["CHỮ O","Chữ cái gì tròn như quả trứng?",2,["O"]],["TRÁI ĐẤT","Quả gì to nhất mà không ai ăn được?",2,["QUẢ ĐẤT"]]]},{"f":"24-lich-su-su","cat":"Lịch sử Việt Nam","k":"Câu lịch sử nè.","s":"su","q":[["HAI BÀ TRƯNG","Hai chị em khởi nghĩa đánh đuổi quân Đông Hán năm 40.",1,["TRƯNG TRẮC","TRƯNG NHỊ"]],["BÀ TRIỆU","Người phụ nữ khởi nghĩa chống quân Ngô năm 248, nói muốn cưỡi cơn gió mạnh, đạp luồng sóng dữ.",2,["TRIỆU THỊ TRINH"]],["NGÔ QUYỀN","Người đánh tan quân Nam Hán trên sông Bạch Đằng năm 938.",1],["BẠCH ĐẰNG","Con sông có trận cắm cọc gỗ dưới lòng sông, nơi Ngô Quyền đánh thắng năm 938.",2,["SÔNG BẠCH ĐẰNG"]],["ĐINH BỘ LĨNH","Người dẹp loạn mười hai sứ quân, lên ngôi hoàng đế năm 968.",2,["ĐINH TIÊN HOÀNG"]],["ĐẠI CỒ VIỆT","Tên nước ta thời nhà Đinh.",3],["LÊ HOÀN","Vị vua đánh thắng quân Tống năm 981, lập ra nhà Tiền Lê.",3,["LÊ ĐẠI HÀNH"]],["LÝ CÔNG UẨN","Vị vua dời đô từ Hoa Lư ra thành Đại La năm 1010.",2,["LÝ THÁI TỔ"]],["THĂNG LONG","Tên kinh đô đặt năm 1010, nghĩa là rồng bay lên.",1],["CHIẾU DỜI ĐÔ","Bài chiếu Lý Công Uẩn ban ra năm 1010 khi chuyển kinh đô.",3,["THIÊN ĐÔ CHIẾU"]],["HOA LƯ","Kinh đô của nhà Đinh và nhà Tiền Lê, nay thuộc Ninh Bình.",2],["LÝ THƯỜNG KIỆT","Vị tướng nhà Lý chặn đánh quân Tống trên sông Như Nguyệt năm 1077.",2],["NAM QUỐC SƠN HÀ","Bài thơ thời Lý được xem là bản tuyên ngôn độc lập đầu tiên của nước ta.",3],["VĂN MIẾU","Nơi thờ Khổng Tử ở Thăng Long, xây năm 1070 thời vua Lý Thánh Tông.",2],["QUỐC TỬ GIÁM","Được xem là trường đại học đầu tiên của nước ta, lập năm 1076.",2],["LÝ THÁNH TÔNG","Vị vua nhà Lý đặt quốc hiệu Đại Việt năm 1054.",3],["ĐẠI VIỆT","Quốc hiệu nước ta đặt từ năm 1054 thời nhà Lý.",2],["TRẦN HƯNG ĐẠO","Vị tướng nhà Trần chỉ huy đánh thắng quân Nguyên Mông năm 1285 và 1288.",1,["TRẦN QUỐC TUẤN","HƯNG ĐẠO VƯƠNG"]],["HỊCH TƯỚNG SĨ","Bài hịch Trần Hưng Đạo viết để khích lệ tướng sĩ đánh giặc Nguyên Mông.",3],["DIÊN HỒNG","Hội nghị các bô lão thời Trần, cả hội nghị đồng thanh hô \"Đánh\".",2,["HỘI NGHỊ DIÊN HỒNG"]],["SÁT THÁT","Hai chữ quân sĩ nhà Trần thích lên cánh tay, thề đánh giặc Nguyên Mông.",3],["TRẦN QUỐC TOẢN","Thiếu niên nhà Trần bóp nát quả cam vì không được bàn việc nước.",2],["TRẦN BÌNH TRỌNG","Tướng nhà Trần nói: ta thà làm quỷ nước Nam chứ không thèm làm vương đất Bắc.",2],["TRẦN THỦ ĐỘ","Thái sư nhà Trần nói: đầu thần chưa rơi xuống đất, xin bệ hạ đừng lo.",3],["TRẦN NHÂN TÔNG","Vị vua nhà Trần chống Nguyên Mông, sau đi tu và lập ra Thiền phái Trúc Lâm.",3],["YÊN TỬ","Ngọn núi nơi vua Trần Nhân Tông tu hành.",2,["NÚI YÊN TỬ"]],["YẾT KIÊU","Tướng nhà Trần bơi lặn rất giỏi, lặn xuống đục thuyền giặc.",3],["PHẠM NGŨ LÃO","Theo sử kể, vị tướng này ngồi đan sọt bên đường mải nghĩ việc nước, bị giáo đâm vào đùi vẫn không hay.",3],["VÂN ĐỒN","Nơi Trần Khánh Dư đánh tan đoàn thuyền lương của quân Nguyên năm 1288.",3],["LÝ CHIÊU HOÀNG","Nữ hoàng duy nhất trong lịch sử nước ta, nhường ngôi cho chồng là Trần Cảnh.",2],["CHU VĂN AN","Người thầy nổi tiếng thời Trần, dâng sớ xin chém bảy tên nịnh thần.",2],["TUỆ TĨNH","Danh y thời Trần, có câu: thuốc Nam chữa bệnh cho người Nam.",3],["MẠC ĐĨNH CHI","Trạng nguyên thời Trần, người nhỏ bé mà tài giỏi, viết bài phú Ngọc tỉnh liên.",3],["HỒ QUÝ LY","Người lập ra nhà Hồ năm 1400, đổi tên nước là Đại Ngu.",3],["THÀNH NHÀ HỒ","Tòa thành xây bằng đá lớn ở Thanh Hóa, là di sản thế giới.",2],["LÊ LỢI","Người lãnh đạo khởi nghĩa Lam Sơn, đánh đuổi quân Minh, lập ra nhà Hậu Lê.",1,["LÊ THÁI TỔ"]],["LAM SƠN","Tên cuộc khởi nghĩa do Lê Lợi lãnh đạo, bắt đầu năm 1418.",2,["KHỞI NGHĨA LAM SƠN"]],["NGUYỄN TRÃI","Người viết Bình Ngô đại cáo, mưu sĩ giúp Lê Lợi đánh quân Minh.",1],["BÌNH NGÔ ĐẠI CÁO","Áng văn được xem là bản tuyên ngôn độc lập thứ hai, viết sau khi thắng quân Minh.",2],["LÊ LAI","Vị tướng mặc áo giả làm Lê Lợi, hi sinh để cứu chủ tướng.",2],["CHI LĂNG","Ải nơi nghĩa quân Lam Sơn chém tướng giặc Liễu Thăng năm 1427.",3,["ẢI CHI LĂNG"]],["HỒ GƯƠM","Hồ ở Hà Nội gắn với truyền thuyết vua Lê Lợi trả gươm thần cho Rùa Vàng.",1,["HỒ HOÀN KIẾM","HOÀN KIẾM"]],["LÊ THÁNH TÔNG","Vị vua nhà Lê cho soạn bộ luật Hồng Đức.",3],["LUẬT HỒNG ĐỨC","Bộ luật nổi tiếng thời vua Lê Thánh Tông.",3,["QUỐC TRIỀU HÌNH LUẬT"]],["LƯƠNG THẾ VINH","Trạng nguyên giỏi toán thời Lê, được dân gian gọi là Trạng Lường.",3],["BIA TIẾN SĨ","Những tấm bia đá đặt trên lưng rùa ở Văn Miếu, khắc tên người đỗ tiến sĩ.",2],["TRẠNG NGUYÊN","Danh hiệu dành cho người đỗ đầu kỳ thi Đình thời phong kiến.",2],["LÊ QUÝ ĐÔN","Nhà bác học lớn thời Lê, tác giả sách Vân đài loại ngữ.",3],["LÊ HỮU TRÁC","Danh y nổi tiếng thời Lê, hiệu là Hải Thượng Lãn Ông.",3],["NGUYỄN HUỆ","Người đại phá quân Thanh vào mùa xuân năm 1789.",1,["QUANG TRUNG","VUA QUANG TRUNG"]],["ĐỐNG ĐA","Gò đất ở Hà Nội ghi dấu chiến thắng quân Thanh năm 1789.",2,["GÒ ĐỐNG ĐA"]],["RẠCH GẦM","Trận đánh năm 1785 trên sông Tiền, Nguyễn Huệ đánh tan quân Xiêm, cùng với Xoài Mút.",3,["RẠCH GẦM XOÀI MÚT"]],["TÂY SƠN","Phong trào do ba anh em Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ lãnh đạo.",2,["NHÀ TÂY SƠN"]],["BÙI THỊ XUÂN","Nữ tướng nhà Tây Sơn nổi tiếng chỉ huy đội voi chiến.",3],["GIA LONG","Niên hiệu của vị vua đầu tiên nhà Nguyễn, lên ngôi năm 1802.",2],["VIỆT NAM","Quốc hiệu vua Gia Long đặt năm 1804.",2],["HUẾ","Kinh đô của nhà Nguyễn.",1,["PHÚ XUÂN"]],["MINH MẠNG","Vị vua thứ hai nhà Nguyễn, đổi quốc hiệu thành Đại Nam.",3,["MINH MỆNH"]],["CỬU ĐỈNH","Chín cái vạc đồng lớn đặt trước Thế Miếu trong Hoàng thành Huế.",3],["NGỌ MÔN","Cổng chính phía nam của Hoàng thành Huế.",3,["CỬA NGỌ MÔN"]],["HÀM NGHI","Vị vua nhỏ tuổi nhà Nguyễn ra chiếu Cần Vương năm 1885, kêu gọi chống Pháp.",3,["VUA HÀM NGHI"]],["CẦN VƯƠNG","Phong trào giúp vua chống Pháp, hưởng ứng chiếu của vua Hàm Nghi năm 1885.",3],["TÔN THẤT THUYẾT","Quan phụ chính đưa vua Hàm Nghi rời kinh thành Huế năm 1885 để chống Pháp.",3],["PHAN ĐÌNH PHÙNG","Lãnh tụ khởi nghĩa Hương Khê, hưởng ứng phong trào Cần Vương.",3],["TRƯƠNG ĐỊNH","Lãnh tụ nghĩa quân chống Pháp ở Gò Công, được dân tôn là Bình Tây đại nguyên soái.",3],["HOÀNG DIỆU","Tổng đốc Hà Nội tuẫn tiết khi thành Hà Nội rơi vào tay Pháp năm 1882.",3],["HOÀNG HOA THÁM","Thủ lĩnh khởi nghĩa Yên Thế, được gọi là Hùm xám Yên Thế.",2,["ĐỀ THÁM"]],["PHAN BỘI CHÂU","Người khởi xướng phong trào Đông Du, đưa thanh niên sang Nhật Bản học.",3],["ĐÔNG DU","Phong trào đưa thanh niên Việt Nam sang Nhật Bản học đầu thế kỷ hai mươi.",3,["PHONG TRÀO ĐÔNG DU"]],["PHAN CHÂU TRINH","Nhà yêu nước chủ trương khai dân trí, chấn dân khí, hậu dân sinh.",3],["NGUYỄN TẤT THÀNH","Tên của Bác Hồ khi ra đi tìm đường cứu nước từ bến Nhà Rồng năm 1911.",2],["BẾN NHÀ RỒNG","Nơi Bác Hồ ra đi tìm đường cứu nước năm 1911.",2,["NHÀ RỒNG"]],["PÁC BÓ","Nơi ở Cao Bằng Bác Hồ sống và làm việc khi về nước năm 1941.",2,["HANG PÁC BÓ"]],["SUỐI LÊ NIN","Con suối ở Pác Bó được Bác Hồ đặt theo tên một lãnh tụ nước ngoài.",3],["KIM ĐỒNG","Đội trưởng đầu tiên của đội nhi đồng cứu quốc ở làng Nà Mạ, Cao Bằng, hi sinh năm 1943.",1,["NÔNG VĂN DỀN"]],["LÝ TỰ TRỌNG","Người thanh niên hi sinh năm 1931, nói: con đường của thanh niên chỉ có thể là con đường cách mạng.",3],["BA ĐÌNH","Quảng trường nơi Bác Hồ đọc Tuyên ngôn Độc lập ngày 2 tháng 9 năm 1945.",1,["QUẢNG TRƯỜNG BA ĐÌNH"]],["VĂN LANG","Nhà nước đầu tiên của người Việt, do các vua Hùng đứng đầu.",1],["VUA HÙNG","Các vị vua dựng nước Văn Lang, có ngày giỗ tổ mùng mười tháng ba âm lịch.",1,["HÙNG VƯƠNG"]],["ÂU LẠC","Nhà nước do An Dương Vương lập ra sau nước Văn Lang.",2],["AN DƯƠNG VƯƠNG","Vị vua xây thành Cổ Loa.",2,["THỤC PHÁN"]],["CỔ LOA","Tòa thành có các vòng thành xoắn ốc nổi tiếng ở Đông Anh, Hà Nội.",2,["THÀNH CỔ LOA"]],["TRỐNG ĐỒNG","Hiện vật nổi tiếng của văn hóa Đông Sơn, mặt có hình ngôi sao và chim lạc.",1],["ĐÔNG SƠN","Nền văn hóa thời đồ đồng nổi tiếng với trống đồng, đặt theo tên một làng ở Thanh Hóa.",3,["VĂN HÓA ĐÔNG SƠN"]],["LÝ BÍ","Người lập ra nước Vạn Xuân năm 544.",3,["LÝ NAM ĐẾ"]],["VẠN XUÂN","Tên nước do Lý Bí đặt năm 544, mong đất nước muôn mùa xuân.",3],["TRIỆU QUANG PHỤC","Người lãnh đạo đánh giặc từ đầm lầy, được gọi là Dạ Trạch Vương.",3],["MAI THÚC LOAN","Vị thủ lĩnh khởi nghĩa ở Hoan Châu chống nhà Đường, được gọi là Hắc Đế.",3],["PHÙNG HƯNG","Người khởi nghĩa chống nhà Đường, được dân tôn là Bố Cái Đại Vương.",3],["KHÚC THỪA DỤ","Người giành quyền tự chủ cho nước ta năm 905.",3],["HOÀNG THÀNH","Khu di tích Thăng Long ở Hà Nội được công nhận là di sản văn hóa thế giới.",2,["HOÀNG THÀNH THĂNG LONG"]],["CHÙA MỘT CỘT","Ngôi chùa ở Hà Nội dựng năm 1049 thời nhà Lý, hình bông sen nở trên một cột đá.",2,["CHÙA DIÊN HỰU"]],["HỘI AN","Phố cổ có Chùa Cầu, từng là thương cảng sầm uất có nhiều thương nhân Nhật Bản và người Hoa.",2,["PHỐ CỔ HỘI AN"]],["SÔNG NHƯ NGUYỆT","Dòng sông nơi Lý Thường Kiệt chặn quân Tống năm 1077, nay gọi là sông Cầu.",3,["NHƯ NGUYỆT"]],["NHÀ LÝ","Triều đại do Lý Công Uẩn lập ra năm 1009.",2,["TRIỀU LÝ"]],["NHÀ TRẦN","Triều đại ba lần đánh thắng quân Nguyên Mông.",1,["TRIỀU TRẦN"]],["NHÀ NGUYỄN","Triều đại phong kiến cuối cùng của nước ta.",1,["TRIỀU NGUYỄN"]],["NGUYỄN DU","Đại thi hào, tác giả Truyện Kiều.",1],["HỒ XUÂN HƯƠNG","Nữ sĩ được mệnh danh là Bà chúa thơ Nôm.",2],["CHỮ NÔM","Chữ người Việt xưa tạo ra dựa trên chữ Hán để ghi tiếng Việt.",2],["CHỮ QUỐC NGỮ","Chữ viết bằng chữ cái La-tinh mà các bạn nhỏ đang học hằng ngày.",2,["QUỐC NGỮ"]]]},{"f":"25-tieng-anh","cat":"Tiếng Anh","k":"Câu tiếng Anh nè.","s":"anh","q":[["CAT","Con mèo tiếng Anh là gì?",1,["KITTY","KITTEN"]],["DOG","Con chó tiếng Anh là gì?",1,["PUPPY"]],["FISH","Con cá tiếng Anh là gì?",1],["BIRD","Con chim tiếng Anh là gì?",1],["PIG","Con heo tiếng Anh là gì?",1],["COW","Con bò tiếng Anh là gì?",1],["DUCK","Con vịt tiếng Anh là gì?",1],["CHICKEN","Con gà tiếng Anh là gì?",1,["HEN","ROOSTER"]],["HORSE","Con ngựa tiếng Anh là gì?",1],["RABBIT","Con thỏ tiếng Anh là gì?",1,["BUNNY"]],["MOUSE","Con chuột tiếng Anh là gì?",1,["RAT"]],["TIGER","Con hổ tiếng Anh là gì?",1],["LION","Con sư tử tiếng Anh là gì?",1],["MONKEY","Con khỉ tiếng Anh là gì?",1],["ELEPHANT","Con voi tiếng Anh là gì?",2],["BEAR","Con gấu tiếng Anh là gì?",1],["FROG","Con ếch tiếng Anh là gì?",1],["SNAKE","Con rắn tiếng Anh là gì?",2],["BEE","Con ong tiếng Anh là gì?",1],["ANT","Con kiến tiếng Anh là gì?",1],["BUTTERFLY","Con bươm bướm tiếng Anh là gì?",2],["TURTLE","Con rùa tiếng Anh là gì?",2,["TORTOISE"]],["GIRAFFE","Con hươu cao cổ tiếng Anh là gì?",3],["PENGUIN","Con chim cánh cụt tiếng Anh là gì?",2],["DOLPHIN","Con cá heo tiếng Anh là gì?",3],["SHARK","Con cá mập tiếng Anh là gì?",2],["CRAB","Con cua tiếng Anh là gì?",2],["SHEEP","Con cừu tiếng Anh là gì?",2,["LAMB"]],["GOAT","Con dê tiếng Anh là gì?",2],["ZEBRA","Con ngựa vằn tiếng Anh là gì?",2],["KANGAROO","Con chuột túi tiếng Anh là gì?",3],["OWL","Con cú mèo tiếng Anh là gì?",2],["SPIDER","Con nhện tiếng Anh là gì?",2],["RED","Màu đỏ tiếng Anh là gì?",1],["BLUE","Màu xanh dương tiếng Anh là gì?",1],["GREEN","Màu xanh lá cây tiếng Anh là gì?",1],["YELLOW","Màu vàng tiếng Anh là gì?",1],["BLACK","Màu đen tiếng Anh là gì?",1],["WHITE","Màu trắng tiếng Anh là gì?",1],["PINK","Màu hồng tiếng Anh là gì?",1],["ORANGE","Màu cam tiếng Anh là gì?",2],["PURPLE","Màu tím tiếng Anh là gì?",2,["VIOLET"]],["BROWN","Màu nâu tiếng Anh là gì?",2],["GRAY","Màu xám tiếng Anh là gì?",2,["GREY"]],["ONE","Số một tiếng Anh là gì?",1],["TWO","Số hai tiếng Anh là gì?",1],["THREE","Số ba tiếng Anh là gì?",1],["FOUR","Số bốn tiếng Anh là gì?",1],["FIVE","Số năm tiếng Anh là gì?",1],["SIX","Số sáu tiếng Anh là gì?",1],["SEVEN","Số bảy tiếng Anh là gì?",1],["EIGHT","Số tám tiếng Anh là gì?",1],["NINE","Số chín tiếng Anh là gì?",1],["TEN","Số mười tiếng Anh là gì?",1],["TWENTY","Số hai mươi tiếng Anh là gì?",2],["ONE HUNDRED","Số một trăm tiếng Anh là gì?",3,["HUNDRED","A HUNDRED"]],["APPLE","Quả táo tiếng Anh là gì?",1],["BANANA","Quả chuối tiếng Anh là gì?",1],["MANGO","Quả xoài tiếng Anh là gì?",2],["GRAPE","Quả nho tiếng Anh là gì?",2,["GRAPES"]],["WATERMELON","Quả dưa hấu tiếng Anh là gì?",3],["LEMON","Quả chanh tiếng Anh là gì?",2,["LIME"]],["MILK","Sữa tiếng Anh là gì?",1],["WATER","Nước uống tiếng Anh là gì?",1],["RICE","Cơm, gạo tiếng Anh là gì?",1],["BREAD","Bánh mì tiếng Anh là gì?",1],["EGG","Quả trứng tiếng Anh là gì?",1],["CAKE","Bánh ngọt, bánh kem tiếng Anh là gì?",2],["CANDY","Viên kẹo tiếng Anh là gì?",1,["SWEET","SWEETS"]],["ICE CREAM","Que kem tiếng Anh là gì?",2],["NOODLES","Món mì sợi tiếng Anh là gì?",2,["NOODLE"]],["JUICE","Nước ép trái cây tiếng Anh là gì?",2],["TEA","Trà tiếng Anh là gì?",2],["MOTHER","Mẹ tiếng Anh là gì?",1,["MOM","MUM","MOMMY","MUMMY"]],["FATHER","Bố tiếng Anh là gì?",1,["DAD","DADDY"]],["SISTER","Chị gái, em gái tiếng Anh là gì?",1],["BROTHER","Anh trai, em trai tiếng Anh là gì?",1],["BABY","Em bé tiếng Anh là gì?",1],["GRANDMOTHER","Bà tiếng Anh là gì?",2,["GRANDMA","GRANNY"]],["GRANDFATHER","Ông tiếng Anh là gì?",2,["GRANDPA"]],["FAMILY","Gia đình tiếng Anh là gì?",2],["FRIEND","Người bạn tiếng Anh là gì?",2],["TEACHER","Cô giáo, thầy giáo tiếng Anh là gì?",1],["STUDENT","Học sinh tiếng Anh là gì?",2,["PUPIL"]],["HEAD","Cái đầu tiếng Anh là gì?",1],["EYE","Con mắt tiếng Anh là gì?",1,["EYES"]],["EAR","Cái tai tiếng Anh là gì?",1,["EARS"]],["NOSE","Cái mũi tiếng Anh là gì?",1],["MOUTH","Cái miệng tiếng Anh là gì?",1],["HAND","Bàn tay tiếng Anh là gì?",1,["HANDS"]],["FOOT","Bàn chân tiếng Anh là gì?",2,["FEET"]],["HAIR","Mái tóc tiếng Anh là gì?",1],["TOOTH","Cái răng tiếng Anh là gì?",2,["TEETH"]],["ARM","Cánh tay tiếng Anh là gì?",2],["FINGER","Ngón tay tiếng Anh là gì?",2],["FACE","Khuôn mặt tiếng Anh là gì?",2],["BOOK","Quyển sách tiếng Anh là gì?",1],["PEN","Cây bút bi tiếng Anh là gì?",1],["PENCIL","Bút chì tiếng Anh là gì?",1],["RULER","Cây thước kẻ tiếng Anh là gì?",2],["ERASER","Cục tẩy tiếng Anh là gì?",2,["RUBBER"]],["SCHOOLBAG","Cặp sách tiếng Anh là gì?",2,["BAG","BACKPACK"]],["DESK","Bàn học tiếng Anh là gì?",2],["CHAIR","Cái ghế tiếng Anh là gì?",1],["SCHOOL","Trường học tiếng Anh là gì?",1],["CLASSROOM","Lớp học tiếng Anh là gì?",2,["CLASS"]],["BOARD","Cái bảng trên lớp tiếng Anh là gì?",2,["BLACKBOARD"]],["NOTEBOOK","Quyển vở tiếng Anh là gì?",2],["HOUSE","Ngôi nhà tiếng Anh là gì?",1,["HOME"]],["DOOR","Cửa ra vào tiếng Anh là gì?",1],["WINDOW","Cửa sổ tiếng Anh là gì?",1],["BED","Cái giường tiếng Anh là gì?",1],["TABLE","Cái bàn ăn tiếng Anh là gì?",1],["LAMP","Cái đèn bàn tiếng Anh là gì?",2,["LIGHT"]],["CLOCK","Đồng hồ treo tường tiếng Anh là gì?",2],["PHONE","Điện thoại tiếng Anh là gì?",1,["TELEPHONE","MOBILE"]],["TELEVISION","Cái ti vi tiếng Anh là gì?",2,["TV"]],["BALL","Quả bóng tiếng Anh là gì?",1],["DOLL","Búp bê tiếng Anh là gì?",2],["KITE","Con diều tiếng Anh là gì?",2],["CAR","Xe ô tô tiếng Anh là gì?",1],["BUS","Xe buýt tiếng Anh là gì?",1],["BIKE","Xe đạp tiếng Anh là gì?",1,["BICYCLE"]],["TRAIN","Tàu hỏa tiếng Anh là gì?",2],["PLANE","Máy bay tiếng Anh là gì?",1,["AIRPLANE","AEROPLANE"]],["BOAT","Con thuyền tiếng Anh là gì?",1,["SHIP"]],["SUN","Mặt trời tiếng Anh là gì?",1],["MOON","Mặt trăng tiếng Anh là gì?",1],["STAR","Ngôi sao tiếng Anh là gì?",1],["SKY","Bầu trời tiếng Anh là gì?",1],["RAIN","Cơn mưa tiếng Anh là gì?",1],["TREE","Cái cây tiếng Anh là gì?",1],["FLOWER","Bông hoa tiếng Anh là gì?",1],["SEA","Biển tiếng Anh là gì?",1,["OCEAN"]],["RIVER","Dòng sông tiếng Anh là gì?",2],["MOUNTAIN","Ngọn núi tiếng Anh là gì?",2],["CLOUD","Đám mây tiếng Anh là gì?",2],["SNOW","Tuyết tiếng Anh là gì?",2],["WIND","Cơn gió tiếng Anh là gì?",2],["RAINBOW","Cầu vồng tiếng Anh là gì?",3],["HELLO","Xin chào tiếng Anh là gì?",1,["HI"]],["THANK YOU","Cảm ơn tiếng Anh là gì?",1,["THANKS"]],["SORRY","Xin lỗi tiếng Anh là gì?",1],["GOODBYE","Tạm biệt tiếng Anh là gì?",1,["BYE","BYE BYE"]],["YES","Vâng, có tiếng Anh là gì?",1],["NO","Không tiếng Anh là gì?",1],["LOVE","Yêu thương tiếng Anh là gì?",1],["HAPPY","Vui vẻ tiếng Anh là gì?",2],["SAD","Buồn tiếng Anh là gì?",2],["BIG","To, lớn tiếng Anh là gì?",1,["LARGE"]],["SMALL","Nhỏ, bé tiếng Anh là gì?",1,["LITTLE"]],["HOT","Nóng tiếng Anh là gì?",1],["COLD","Lạnh tiếng Anh là gì?",1],["BEAUTIFUL","Xinh đẹp tiếng Anh là gì?",3,["PRETTY"]],["RUN","Chạy tiếng Anh là gì?",1],["JUMP","Nhảy lên cao tiếng Anh là gì?",1],["SWIM","Bơi tiếng Anh là gì?",1],["EAT","Ăn tiếng Anh là gì?",1],["DRINK","Uống tiếng Anh là gì?",1],["SLEEP","Ngủ tiếng Anh là gì?",1],["READ","Đọc tiếng Anh là gì?",1],["WRITE","Viết tiếng Anh là gì?",1],["SING","Hát tiếng Anh là gì?",1],["DANCE","Nhảy múa tiếng Anh là gì?",2],["PLAY","Chơi tiếng Anh là gì?",1],["CRY","Khóc tiếng Anh là gì?",2],["SMILE","Mỉm cười tiếng Anh là gì?",2],["WALK","Đi bộ tiếng Anh là gì?",2],["FLY","Bay tiếng Anh là gì?",2],["COOK","Nấu ăn tiếng Anh là gì?",2],["MONDAY","Thứ hai tiếng Anh là gì?",3],["SUNDAY","Chủ nhật tiếng Anh là gì?",3],["MORNING","Buổi sáng tiếng Anh là gì?",2],["NIGHT","Ban đêm tiếng Anh là gì?",2],["TODAY","Hôm nay tiếng Anh là gì?",3],["BIRTHDAY","Sinh nhật tiếng Anh là gì?",2]]},{"f":"26-tieng-keu","cat":"Tiếng kêu","k":"Đây là con vật có tiếng kêu như vậy.","s":"","q":[["CON GÀ TRỐNG","Ò ó o, sáng nào cũng gáy.",1,["GÀ TRỐNG","CON GÀ","GÀ"]],["CON MÈO","Meo meo meo, thích bắt chuột.",1,["MÈO"]],["CON CHÓ","Gâu gâu gâu, giữ nhà cho chủ.",1,["CHÓ","CON CÚN","CÚN"]],["CON VỊT","Cạp cạp cạp, bơi dưới ao.",1,["VỊT"]],["CON HEO","Ụt ịt ụt ịt, ăn no lại ngủ.",1,["HEO","CON LỢN","LỢN"]],["CON BÒ","Kêu ọ ọ, cho sữa tươi.",1,["BÒ"]],["CON DÊ","Be be be, có chòm râu dưới cằm.",1,["DÊ"]],["CON ẾCH","Ộp ộp ộp, ngồi bên bờ ao.",1,["ẾCH","CON NHÁI","NHÁI"]],["CON CHUỘT","Chít chít chít, sợ mèo lắm.",1,["CHUỘT"]],["CON GÀ CON","Chíp chíp chíp, lon ton theo mẹ.",1,["GÀ CON"]],["CON CHIM","Líu lo líu lo trên cành cây.",1,["CHIM"]],["CON ONG","Vo ve quanh bông hoa, làm ra mật.",1,["ONG"]],["CON MUỖI","Vo ve bên tai lúc đi ngủ, hay chích người.",1,["MUỖI"]],["CON NGỰA","Hí hí, phi nước đại.",2,["NGỰA"]],["CON HỔ","Gầm gừ, là chúa sơn lâm.",2,["HỔ","CON CỌP","CỌP"]],["CON SƯ TỬ","Gầm vang cả khu rừng, con đực có bờm.",2,["SƯ TỬ"]],["CON VOI","Rống vang, có cái vòi dài.",2,["VOI"]],["CON KHỈ","Khọt khẹt, chuyền cành thoăn thoắt.",2,["KHỈ"]],["CON CHIM SẺ","Chích chích, nhỏ xíu hay đậu mái nhà.",2,["CHIM SẺ","SẺ"]],["CON VE SẦU","Kêu ra rả suốt mùa hè.",2,["VE SẦU","CON VE","VE"]],["CON SÓI","Hú thật dài dưới ánh trăng.",2,["SÓI","CHÓ SÓI"]],["ĐỒNG HỒ","Tích tắc tích tắc, chạy cả ngày.",1,["CÁI ĐỒNG HỒ"],"Đây là đồ vật có tiếng kêu như vậy."],["CÁI TRỐNG","Tùng tùng tùng, báo giờ vào lớp.",1,["TRỐNG","TRỐNG TRƯỜNG"],"Đây là đồ vật có tiếng kêu như vậy."],["CÁI CHUÔNG","Reng reng reng, có khách tới nhà.",1,["CHUÔNG","CHUÔNG CỬA"],"Đây là đồ vật có tiếng kêu như vậy."],["TÀU HỎA","Xình xịch xình xịch trên đường ray.",1,["TÀU LỬA","XE LỬA"],"Đây là đồ vật có tiếng kêu như vậy."],["CÁI CÒI","Tuýt tuýt, chú cảnh sát giao thông thổi.",2,["CÒI"],"Đây là đồ vật có tiếng kêu như vậy."],["XE CỨU THƯƠNG","Tò te tò te chạy thật nhanh tới bệnh viện.",2,["XE CẤP CỨU"],"Đây là đồ vật có tiếng kêu như vậy."],["SẤM","Ầm ầm vang trên trời lúc sắp mưa to.",2,["TIẾNG SẤM","SẤM SÉT"],"Đây là âm thanh của thiên nhiên."],["MƯA","Lộp độp trên mái tôn.",1,["CƠN MƯA","TIẾNG MƯA"],"Đây là âm thanh của thiên nhiên."],["GIÓ","Vi vu thổi qua rặng tre.",2,["CƠN GIÓ","TIẾNG GIÓ"],"Đây là âm thanh của thiên nhiên."],["SÓNG BIỂN","Rì rào vỗ vào bờ cát.",2,["SÓNG","TIẾNG SÓNG"],"Đây là âm thanh của thiên nhiên."]]},{"f":"27-trai-nghia","cat":"Từ trái nghĩa","k":"Đây là từ trái nghĩa.","s":"","q":[["LẠNH","Ngược nghĩa với từ: nóng.",1],["NÓNG","Ngược nghĩa với từ: lạnh.",1],["NHỎ","Ngược nghĩa với từ: to.",1,["BÉ"]],["TO","Ngược nghĩa với từ: nhỏ.",1,["LỚN"]],["THẤP","Ngược nghĩa với từ: cao.",1],["CAO","Ngược nghĩa với từ: thấp.",1],["NGẮN","Ngược nghĩa với từ: dài.",1],["DÀI","Ngược nghĩa với từ: ngắn.",1],["GẦY","Ngược nghĩa với từ: béo.",1,["ỐM"]],["BÉO","Ngược nghĩa với từ: gầy.",1,["MẬP"]],["CHẬM","Ngược nghĩa với từ: nhanh.",1],["NHANH","Ngược nghĩa với từ: chậm.",1],["BUỒN","Ngược nghĩa với từ: vui.",1],["VUI","Ngược nghĩa với từ: buồn.",1],["ĐÊM","Ngược nghĩa với từ: ngày.",1],["NGÀY","Ngược nghĩa với từ: đêm.",1],["TỐI","Ngược nghĩa với từ: sáng.",1],["SÁNG","Ngược nghĩa với từ: tối.",1],["DƯỚI","Ngược nghĩa với từ: trên.",1],["TRÊN","Ngược nghĩa với từ: dưới.",1],["SAU","Ngược nghĩa với từ: trước.",1],["TRƯỚC","Ngược nghĩa với từ: sau.",1],["NGOÀI","Ngược nghĩa với từ: trong.",1],["TRONG","Ngược nghĩa với từ: ngoài.",1],["ĐÓNG","Ngược nghĩa với từ: mở.",1],["MỞ","Ngược nghĩa với từ: đóng.",1],["XUỐNG","Ngược nghĩa với từ: lên.",1],["LÊN","Ngược nghĩa với từ: xuống.",1],["RA","Ngược nghĩa với từ: vào.",1],["VÀO","Ngược nghĩa với từ: ra.",1],["CƯỜI","Ngược nghĩa với từ: khóc.",1],["KHÓC","Ngược nghĩa với từ: cười.",1],["THỨC","Ngược nghĩa với từ: ngủ.",1],["CŨ","Ngược nghĩa với từ: mới.",1],["MỚI","Ngược nghĩa với từ: cũ.",1],["BẨN","Ngược nghĩa với từ: sạch.",1,["DƠ"]],["SẠCH","Ngược nghĩa với từ: bẩn.",1],["NHẸ","Ngược nghĩa với từ: nặng.",1],["NẶNG","Ngược nghĩa với từ: nhẹ.",1],["MỀM","Ngược nghĩa với từ: cứng.",1],["CỨNG","Ngược nghĩa với từ: mềm.",1],["YẾU","Ngược nghĩa với từ: khỏe.",1],["NGHÈO","Ngược nghĩa với từ: giàu.",2],["SAI","Ngược nghĩa với từ: đúng.",1],["ĐÚNG","Ngược nghĩa với từ: sai.",1],["THUA","Ngược nghĩa với từ: thắng.",1],["THẮNG","Ngược nghĩa với từ: thua.",1],["GIÀ","Ngược nghĩa với từ: trẻ.",1],["TRẺ","Ngược nghĩa với từ: già.",1],["GẦN","Ngược nghĩa với từ: xa.",1],["XA","Ngược nghĩa với từ: gần.",1],["HẸP","Ngược nghĩa với từ: rộng.",2],["RỘNG","Ngược nghĩa với từ: hẹp.",2],["MỎNG","Ngược nghĩa với từ: dày.",2],["DÀY","Ngược nghĩa với từ: mỏng.",2],["MUỘN","Ngược nghĩa với từ: sớm.",2,["TRỄ"]],["SỚM","Ngược nghĩa với từ: muộn.",2],["NHIỀU","Ngược nghĩa với từ: ít.",1],["ÍT","Ngược nghĩa với từ: nhiều.",1],["XẤU","Ngược nghĩa với từ: đẹp.",1],["ĐẸP","Ngược nghĩa với từ: xấu.",1],["ƯỚT","Ngược nghĩa với từ: khô.",1],["KHÔ","Ngược nghĩa với từ: ướt.",1],["NÔNG","Ngược nghĩa với từ: sâu.",2,["CẠN"]],["SÂU","Ngược nghĩa với từ: nông.",2],["YÊN TĨNH","Ngược nghĩa với từ: ồn ào.",3,["IM LẶNG","YÊN LẶNG"]],["LƯỜI BIẾNG","Ngược nghĩa với từ: chăm chỉ.",3,["LƯỜI","LƯỜI NHÁC"]],["CHĂM CHỈ","Ngược nghĩa với từ: lười biếng.",3,["SIÊNG NĂNG","CHĂM"]],["DỮ","Ngược nghĩa với từ: hiền.",2,["HUNG DỮ","DỮ TỢN"]],["HIỀN","Ngược nghĩa với từ: dữ.",2,["HIỀN LÀNH"]],["ĐEN","Ngược nghĩa với từ: trắng.",1],["TRẮNG","Ngược nghĩa với từ: đen.",1],["BÁN","Ngược nghĩa với từ: mua.",1],["MUA","Ngược nghĩa với từ: bán.",1],["NHẬN","Ngược nghĩa với từ: cho.",2],["GHÉT","Ngược nghĩa với từ: yêu.",2],["NGỒI","Ngược nghĩa với từ: đứng.",1],["ĐỨNG","Ngược nghĩa với từ: ngồi.",1],["ĐẨY","Ngược nghĩa với từ: kéo.",1],["KÉO","Ngược nghĩa với từ: đẩy.",1],["GIẢ","Ngược nghĩa với từ: thật.",2],["KẾT THÚC","Ngược nghĩa với từ: bắt đầu.",2],["BẮT ĐẦU","Ngược nghĩa với từ: kết thúc.",2],["TRÁI","Ngược nghĩa với từ: phải (bên phải).",1],["PHẢI","Ngược nghĩa với bên tay trái.",1],["CON GÁI","Ngược nghĩa với từ: con trai.",1,["GÁI"]],["TRẢ LỜI","Ngược nghĩa với từ: hỏi.",2,["ĐÁP"]]]},{"f":"28-bai-hat","cat":"Bài hát thiếu nhi","k":"Đây là tên một bài hát thiếu nhi.","s":"","q":[["CHÚ ẾCH CON","Bài hát về một chú ếch nhỏ có đôi mắt tròn xoe.",2,["ẾCH CON"]],["MỘT CON VỊT","Bài hát vui về con vật có hai cái cánh, hay kêu cạp cạp.",1],["RỬA MẶT NHƯ MÈO","Bài hát nhắc các bạn nhỏ rửa mặt cho sạch, đừng làm qua loa như con mèo.",2],["EM YÊU TRƯỜNG EM","Bài hát về tình yêu mái trường, thầy cô và bạn bè.",2],["CHIẾC ĐÈN ÔNG SAO","Bài hát về chiếc đèn năm cánh các bạn nhỏ rước đêm Trung thu.",2,["ĐÈN ÔNG SAO"]],["CHÁU YÊU BÀ","Bài hát về tình thương của bạn nhỏ dành cho bà.",2],["TÌM BẠN THÂN","Bài hát về các bạn nhỏ đi tìm người bạn thân để cùng vui chơi.",2],["ĐI HỌC","Bài hát về con đường nhỏ dẫn bạn nhỏ tới trường mỗi sáng.",2],["BÉ LÊN BA","Bài hát về em bé ba tuổi bắt đầu đi học mẫu giáo.",2],["CÔ VÀ MẸ","Bài hát nói ở trường có cô giáo, ở nhà có mẹ hiền.",2],["MẸ YÊU KHÔNG NÀO","Bài hát bạn nhỏ hỏi mẹ có yêu con không.",2],["ĐỘI KÈN TÍ HON","Bài hát về đội kèn của các bạn nhỏ thổi vang vui nhộn.",3],["THẬT LÀ HAY","Bài hát về chim vành khuyên và chim họa mi cùng hót.",3],["ONG VÀ BƯỚM","Bài hát về chú ong chăm làm và bạn bướm mải chơi.",3],["BẮC KIM THANG","Bài đồng dao miền Nam có cây bí, con cá rô và con cò.",2,[],"Đây là tên một bài dân ca, đồng dao."],["LÝ CÂY XANH","Bài dân ca Nam Bộ hát về một cái cây xanh.",2,[],"Đây là tên một bài dân ca, đồng dao."],["TRỐNG CƠM","Bài dân ca quan họ Bắc Ninh vui nhộn, nhắc tới cái trống.",3,[],"Đây là tên một bài dân ca, đồng dao."],["INH LẢ ƠI","Bài dân ca của đồng bào Thái ở Tây Bắc.",3,[],"Đây là tên một bài dân ca, đồng dao."]]},{"f":"29-quoc-gia","cat":"Đoán quốc gia","k":"Đây là tên một quốc gia.","s":"","q":[["NHẬT BẢN","Đất nước có món sushi và núi Phú Sĩ.",1,["NHẬT"]],["HÀN QUỐC","Đất nước có món kim chi nổi tiếng.",1,["HÀN"]],["TRUNG QUỐC","Đất nước có Vạn Lý Trường Thành và gấu trúc.",1],["PHÁP","Đất nước có tháp Eiffel ở thủ đô Paris.",1,["NƯỚC PHÁP"]],["NƯỚC Ý","Đất nước có tháp nghiêng Pisa, quê hương món pizza.",2,["Ý","ITALIA"]],["AI CẬP","Đất nước có kim tự tháp và con sông Nin.",1],["ẤN ĐỘ","Đất nước có lăng Taj Mahal trắng muốt.",2],["MỸ","Đất nước có tượng Nữ thần Tự do.",1,["HOA KỲ","NƯỚC MỸ"]],["ANH","Đất nước có tháp đồng hồ Big Ben ở London.",2,["NƯỚC ANH","VƯƠNG QUỐC ANH"]],["ÚC","Đất nước có chuột túi và gấu koala.",1,["NƯỚC ÚC"]],["NGA","Đất nước có búp bê gỗ lồng vào nhau, thủ đô Mát-xcơ-va.",2,["NƯỚC NGA"]],["BRAZIL","Đất nước có lễ hội hóa trang Rio và tượng Chúa trên núi cao.",2,["BRAXIN"]],["HÀ LAN","Đất nước nổi tiếng với cối xay gió và hoa tulip.",2],["THỤY SĨ","Đất nước nổi tiếng với sô cô la, đồng hồ và núi tuyết.",3],["TÂY BAN NHA","Đất nước có điệu nhảy flamenco và món cơm paella.",3],["MEXICO","Đất nước có mũ rộng vành sombrero và món taco.",3,["MÊ HI CÔ"]],["HY LẠP","Đất nước nơi bắt đầu Thế vận hội thời cổ đại.",3],["CAMPUCHIA","Nước láng giềng có đền Angkor Wat.",2,["CĂM PU CHIA"]],["LÀO","Nước láng giềng phía tây nước ta, thủ đô là Viêng Chăn.",2,["NƯỚC LÀO"]],["THÁI LAN","Đất nước có món canh chua cay Tom Yum, thủ đô Bangkok.",2],["SINGAPORE","Đất nước có tượng sư tử đầu cá phun nước.",3,["XINH GA PO","SINGAPO"]],["CANADA","Đất nước có lá phong đỏ trên quốc kỳ.",2,["CA NA ĐA"]],["ĐỨC","Đất nước nổi tiếng với xúc xích, thủ đô Berlin.",2,["NƯỚC ĐỨC"]],["PERU","Đất nước có thành cổ Machu Picchu trên núi cao.",3,["PÊ RU"]],["VIỆT NAM","Đất nước có phở, áo dài và chữ S trên bản đồ.",1]]},{"f":"30-tinh-thanh","cat":"Tỉnh thành Việt Nam","k":"Đây là một tỉnh, thành phố của Việt Nam.","s":"","q":[["HÀ NỘI","Thủ đô của nước ta, có Hồ Gươm và Văn Miếu.",1,["THỦ ĐÔ HÀ NỘI"]],["HUẾ","Cố đô có Đại Nội và sông Hương.",1,["THÀNH PHỐ HUẾ"]],["QUẢNG NINH","Tỉnh có Vịnh Hạ Long nổi tiếng thế giới.",2],["THANH HÓA","Tỉnh có Thành nhà Hồ xây bằng đá.",2],["NGHỆ AN","Tỉnh quê hương của Bác Hồ, có làng Sen.",2],["HÀ TĨNH","Tỉnh quê hương của đại thi hào Nguyễn Du.",3],["CAO BẰNG","Tỉnh có thác Bản Giốc và hang Pác Bó.",2],["LẠNG SƠN","Tỉnh có ải Chi Lăng, nơi chém tướng giặc Liễu Thăng.",3],["ĐIỆN BIÊN","Tỉnh gắn với chiến thắng lừng lẫy năm 1954.",2],["SƠN LA","Tỉnh có cao nguyên Mộc Châu trồng nhiều chè.",3],["HỒ CHÍ MINH","Thành phố lớn nhất nước, có chợ Bến Thành.",1,["SÀI GÒN","TP HỒ CHÍ MINH"]],["ĐÀ NẴNG","Thành phố có cầu Rồng biết phun lửa.",1],["HẢI PHÒNG","Thành phố cảng, có đảo Cát Bà.",2],["CẦN THƠ","Thành phố miền Tây có chợ nổi Cái Răng.",2]]}];
  const LEVEL_MAP = { 1: 'easy', 2: 'medium', 3: 'hard' };

  const QUESTIONS = [];
  const CATEGORIES = [];
  const seenQuestionKeys = new Set();
  for (const g of RAW_GROUPS) {
    if (!g.s && !CATEGORIES.includes(g.cat)) CATEGORIES.push(g.cat);
    for (const r of g.q) {
      const [answer, clue, lvl, alts, customKind] = r;
      const normKey = (g.s || 'w') + ':' + String(answer).normalize('NFC').toUpperCase().trim();
      seenQuestionKeys.add(normKey);
      QUESTIONS.push({
        id: g.f + ':' + answer,
        answer,
        clue,
        category: g.cat,
        kind: customKind || g.k || '',
        difficulty: LEVEL_MAP[lvl] || 'easy',
        slot: g.s || undefined,
        acceptedAnswers: Array.isArray(alts) && alts.length ? alts : undefined
      });
    }
  }

  // Bổ sung kho câu hỏi siêu dễ, ngắn gọn (1-2 tiếng) quen thuộc hằng ngày cho Lớp Học Chữ
  const EXTRA_EASY_GROUPS = [
    {
      f: '24-lich-su-su', cat: 'Lịch sử Việt Nam', s: 'su', k: 'Câu lịch sử nè.',
      q: [
        ['BÁC HỒ', 'Vị lãnh tụ kính yêu đọc bản Tuyên ngôn Độc lập ngày 2 tháng 9 năm 1945.', 1, ['HỒ CHÍ MINH']],
        ['LĂNG BÁC', 'Công trình thiêng liêng ở quảng trường Ba Đình nơi đồng bào vào viếng Bác.', 1],
        ['ÂU CƠ', 'Mẹ tiên trong truyền thuyết sinh ra bọc trăm trứng của dân tộc Việt Nam.', 1],
        ['SƠN TINH', 'Vị thần núi dâng núi cao thắng thần nước trong truyền thuyết thời Vua Hùng.', 1],
        ['THỦY TINH', 'Vị thần nước dâng mưa lũ giao chiến với Sơn Tinh trong truyền thuyết.', 1],
        ['LANG LIÊU', 'Chàng hoàng tử hiếu thảo làm ra bánh chưng, bánh giầy dâng Vua Hùng.', 1],
        ['BÁNH CHƯNG', 'Thứ bánh hình vuông gói lá dong xanh tượng trưng cho Đất thời Vua Hùng.', 1],
        ['BÁNH GIẦY', 'Thứ bánh trắng tròn dẻo giã từ gạo nếp tượng trưng cho Trời thời Vua Hùng.', 1],
        ['TRE NGÀ', 'Khi roi sắt gãy, Thánh Gióng đã nhổ bụi cây gì bên đường để đánh giặc Ân?', 1, ['CÂY TRE']],
        ['NGỰA SẮT', 'Con vật phun ra lửa cùng Thánh Gióng xông pha đánh tan giặc Ân.', 1],
        ['NỎ THẦN', 'Vũ khí kỳ diệu bắn một phát ra hàng trăm mũi tên thời An Dương Vương.', 1],
        ['RÙA VÀNG', 'Thần Kim Quy nổi lên mặt hồ đón nhận lại thanh gươm báu từ vua Lê Lợi.', 1, ['KIM QUY']],
        ['GƯƠM THẦN', 'Thanh kiếm báu giúp Lê Lợi đánh giặc Minh rồi trả lại ở hồ Hoàn Kiếm.', 1],
        ['QUANG TRUNG', 'Niên hiệu lẫy lừng của vua Nguyễn Huệ khi đại phá quân Thanh mùa xuân Kỷ Dậu.', 1],
        ['ĐIỆN BIÊN', 'Chiến thắng lừng lẫy năm châu ngày 7 tháng 5 năm 1954 diễn ra ở nơi nào?', 1, ['ĐIỆN BIÊN PHỦ']],
        ['ĐỘC LẬP', 'Ngày 2 tháng 9 năm 1945 tại Ba Đình, Bác Hồ đọc bản Tuyên ngôn gì?', 1],
        ['SAO VÀNG', 'Ngôi sao năm cánh màu gì tỏa sáng giữa nền lá cờ đỏ Tổ quốc ta?', 1],
        ['QUỐC KỲ', 'Lá cờ đỏ sao vàng thiêng liêng của nước Việt Nam gọi là gì?', 1],
        ['QUỐC CA', 'Bài hát Tiến Quân Ca vang lên mỗi sáng thứ Hai chào cờ gọi là gì?', 1],
        ['GIỖ TỔ', 'Mùng 10 tháng 3 âm lịch hằng năm là ngày lễ lớn gì nhớ ơn các Vua Hùng?', 1],
        ['PHÚ THỌ', 'Tỉnh Đất Tổ nơi có khu di tích Đền Hùng linh thiêng của dân tộc ta.', 1],
        ['CHIM LẠC', 'Loài chim sải cánh bay khắc trên mặt trống đồng Đông Sơn cổ xưa.', 1],
        ['CỜ LAU', 'Thuở nhỏ Đinh Bộ Lĩnh chăn trâu thường lấy bông cỏ gì làm cờ tập trận?', 1],
        ['HÀ NỘI', 'Thủ đô nghìn năm văn hiến của nước Việt Nam ta ngày nay.', 1],
        ['SÀI GÒN', 'Tên gọi thân thuộc xưa của Thành phố Hồ Chí Minh.', 1]
      ]
    },
    {
      f: '04-mon-an', cat: 'Món ăn Việt', k: 'Đây là món ăn trong bữa cơm người Việt.',
      q: [
        ['BÚN BÒ', 'Món bún nước đậm đà nổi tiếng xứ Huế có thịt bò và giò heo.', 1],
        ['MÌ TÔM', 'Món mì gói chế nước sôi ba phút là thơm lừng ai cũng từng ăn.', 1, ['MÌ GÓI']],
        ['CƠM RANG', 'Cơm nguội đem đảo trên chảo nóng với trứng và hành lá thơm phức.', 1, ['CƠM CHIÊN']],
        ['GÀ LUỘC', 'Món thịt gà chín vàng ươm rắc lá chanh thái nhỏ chấm muối tiêu chanh.', 1],
        ['CÁ KHO', 'Món cá rim mặn ngọt đậm đà trong nồi đất ăn cực tốn cơm.', 1],
        ['THỊT KHO', 'Món thịt heo kho trứng nước dừa vàng nâu thơm ngon ngày Tết.', 1],
        ['RAU LUỘC', 'Đĩa rau xanh mát chấm nước mắm hoặc kho quẹt trong bữa cơm gia đình.', 1],
        ['BÁNH BAO', 'Chiếc bánh vỏ trắng mềm hấp nóng hổi, bên trong có nhân thịt và trứng cút.', 1],
        ['CHẢ GIÒ', 'Món cuốn nhân thịt mộc nhĩ chiên giòn rụm, miền Bắc hay gọi là nem rán.', 1]
      ]
    },
    {
      f: '07-dia-danh', cat: 'Đất nước Việt Nam', k: 'Đây là địa danh của Việt Nam.',
      q: [
        ['ĐÀ LẠT', 'Thành phố ngàn hoa mát lạnh quanh năm trên cao nguyên Lâm Đồng.', 1],
        ['ĐÀ NẴNG', 'Thành phố biển miền Trung nổi tiếng với Cầu Rồng phun lửa.', 1],
        ['HẠ LONG', 'Vịnh biển kỳ quan thiên nhiên thế giới có hàng nghìn đảo đá ở Quảng Ninh.', 1],
        ['PHÚ QUỐC', 'Hòn đảo ngọc lớn nhất Việt Nam nằm ở vùng biển Tây Nam.', 1],
        ['VŨNG TÀU', 'Thành phố biển gần Sài Gòn có tượng Chúa dang tay trên đỉnh núi.', 1],
        ['CẦN THƠ', 'Thành phố miền Tây gạo trắng nước trong nổi tiếng với bến Ninh Kiều.', 1],
        ['BẾN TRE', 'Tỉnh miền Tây sông nước được mệnh danh là xứ Dừa.', 1],
        ['TÂY NINH', 'Tỉnh Nam Bộ nổi tiếng với núi Bà Đen và món bánh tráng phơi sương.', 1]
      ]
    },
    {
      f: '12-the-thao-tro-choi', cat: 'Thể thao, trò chơi', k: 'Đây là một môn thể thao hoặc trò chơi.',
      q: [
        ['CẦU LÔNG', 'Môn thể thao hai người cầm vợt đánh quả cầu trắng qua tấm lưới.', 1],
        ['BƠI LỘI', 'Môn thể thao vận động dưới làn nước mát trong hồ bơi.', 1],
        ['ĐÁ CẦU', 'Trò chơi sân trường dùng chân tâng quả cầu nhiều vòng không rơi.', 1],
        ['BÓNG RỔ', 'Môn thể thao dẫn bóng bằng tay rồi ném lọt vào chiếc rổ trên cao.', 1],
        ['BÓNG BÀN', 'Môn đánh quả bóng nhựa nhỏ xíu nảy tanh tách trên mặt bàn xanh.', 1],
        ['CỜ VUA', 'Môn cờ trí tuệ trên bàn cờ trắng đen có quân Vua, quân Hậu, quân Mã.', 1],
        ['THẢ DIỀU', 'Trò chơi chiều hè chạy trên cánh đồng cho cánh giấy bay cao đón gió.', 1],
        ['BẮN BI', 'Trò chơi tuổi thơ ngồi xổm búng những viên bi thủy tinh tròn xoe.', 1]
      ]
    },
    {
      f: '13-le-tet', cat: 'Lễ Tết, phong tục', k: 'Đây là thứ gắn với lễ Tết, phong tục.',
      q: [
        ['HOA ĐÀO', 'Loài hoa cánh hồng thắm nở rộ báo hiệu Tết miền Bắc về.', 1],
        ['HOA MAI', 'Loài hoa năm cánh vàng rực rỡ đặc trưng ngày Tết miền Nam.', 1],
        ['MÚA LÂN', 'Điệu múa rộn ràng tiếng trống tùng cheng dịp Trung thu và khai trương.', 1],
        ['ĐÈN LỒNG', 'Đồ chơi phát sáng lung linh các em nhỏ cầm đi rước đèn đêm rằm tháng Tám.', 1],
        ['CHÚC TẾT', 'Sáng mùng Một con cháu dành những lời tốt đẹp mừng tuổi ông bà cha mẹ.', 1],
        ['GIAO THỪA', 'Khoảnh khắc thiêng liêng chuyển giao từ năm cũ sang năm mới lúc nửa đêm.', 1]
      ]
    },
    {
      f: '22-mon-hoc', cat: 'Môn học', k: 'Đây là một môn học.',
      q: [
        ['TẬP VIẾT', 'Giờ học tiểu học rèn từng nét chữ ngay ngắn, sạch đẹp trên trang vở ô ly.', 1],
        ['MỸ THUẬT', 'Môn học cầm bút sáp màu vẽ tranh phong cảnh, gia đình và tô màu.', 1, ['VẼ']],
        ['ĐẠO ĐỨC', 'Môn học dạy các em nhỏ lễ phép, hiếu thảo và biết giúp đỡ mọi người.', 1],
        ['ĐỊA LÝ', 'Môn học tìm hiểu bản đồ, sông núi, khí hậu các vùng miền và châu lục.', 1],
        ['LỊCH SỬ', 'Môn học kể về cội nguồn dân tộc và chiến công dựng nước, giữ nước.', 1]
      ]
    }
  ];

  for (const g of EXTRA_EASY_GROUPS) {
    if (!g.s && !CATEGORIES.includes(g.cat)) CATEGORIES.push(g.cat);
    for (const r of g.q) {
      const [answer, clue, lvl, alts, customKind] = r;
      const normKey = (g.s || 'w') + ':' + String(answer).normalize('NFC').toUpperCase().trim();
      if (seenQuestionKeys.has(normKey)) continue;
      seenQuestionKeys.add(normKey);
      QUESTIONS.push({
        id: g.f + ':extra:' + answer,
        answer,
        clue,
        category: g.cat,
        kind: customKind || g.k || '',
        difficulty: LEVEL_MAP[lvl] || 'easy',
        slot: g.s || undefined,
        acceptedAnswers: Array.isArray(alts) && alts.length ? alts : undefined
      });
    }
  }

// =====================================================
//  LỜI THOẠI CÔ GIÁO. Mỗi tình huống có nhiều câu, game bốc lần lượt kiểu xáo bài
//  (đọc hết cả xấp mới lặp lại) nên live lâu vẫn ít nghe trùng.
//  Muốn thêm câu: chép 1 dòng trong đúng nhóm. Tên người xem luôn là tên đã làm sạch,
//  KHÔNG BAO GIỜ chèn nguyên văn comment vào đây.
//  Kiểm tra: npx tsx src/game/quiz.check.ts (đếm số câu mỗi nhóm, tìm câu trùng)
// =====================================================


// Quà cô thưởng: cô nói tên quà, món quà bay xuống đặt lên bàn bạn nhỏ (hình icon)
const REWARDS = [
  { name: 'một cây kẹo mút', icon: '🍭' },
  { name: 'một viên kẹo ngọt', icon: '🍬' },
  { name: 'một cái nơ xinh', icon: '🎀' },
  { name: 'một cái bánh quy', icon: '🍪' },
  { name: 'một cái bánh kem nhỏ', icon: '🧁' },
  { name: 'một hộp sữa', icon: '🥛' },
  { name: 'một quả táo đỏ', icon: '🍎' },
  { name: 'một phiếu bé ngoan', icon: '🎫' },
  { name: 'một ngôi sao sáng', icon: '🌟' },
  { name: 'một bông hoa điểm tốt', icon: '🌸' },
  { name: 'một điểm mười đỏ chót', icon: '💯' },
  { name: 'một hộp bút chì màu', icon: '🖍️' },
  { name: 'một chú gấu bông', icon: '🧸' },
  { name: 'một quả bóng bay', icon: '🎈' },
];
// Số lần chép phạt: từ 10 tới 1 triệu, số nhỏ hay gặp hơn số to, làm tròn cho dễ đọc (vd 40, 3.500, 120.000)
const penalty = () => {
  const n = 10 ** (1 + Math.random() * 5);
  const step = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1);
  return Math.min(1_000_000, Math.round(n / step) * step).toLocaleString('vi-VN');
};

const LINES = {
  // ---------- Vào tiết ----------
  intro: [
    'Cả lớp ổn định nào! Tiết mới bắt đầu rồi. Cô xáo chữ, ai gõ đáp án nhanh nhất thì nhiều điểm nhất.',
    'Trống vào lớp rồi nha. Hai mươi câu, câu cuối là câu hỏi vàng nhân đôi điểm. Chuẩn bị bàn phím đi.',
    'Ngồi ngay ngắn lại, cất điện thoại đi... à quên, lớp mình học bằng điện thoại. Vào bài thôi!',
    'Tiết này cô đố hai mươi câu, có bốn câu toán nhẩm siêu dễ. Gõ đáp án vào bình luận nha các bạn nhỏ.',
    'Hai mươi câu quen thuộc, xen bốn câu toán nhẩm dễ ợt. Ai nhanh tay nhất thì được ngồi bàn đầu.',
    'Tiết này có cả câu đố mẹo vui nhộn nha các bạn nhỏ. Cẩn thận kẻo bị cô lừa đó.',
    'Hôm nay có cả tiếng Anh, toán, lịch sử với câu đố mẹo dễ thương. Chuẩn bị nha các bạn nhỏ!',
    'Ai ngủ gật thì dậy, ai ăn vặt thì cất. Tiết mới, điểm làm lại từ đầu, ai cũng có cơ hội ngồi bàn đầu.',
    'Chào cả lớp! Hôm nay cô ra toàn câu quen thuộc, dễ đoán. Bạn nhỏ nào nhanh tay là có điểm liền.',
    'Vào học! Ai trả lời đúng nhanh nhất được mười điểm, chậm hơn thì ít điểm hơn. Chép bài bạn thì được đúng một điểm thôi nha.',
    'Lớp trưởng đâu, hô cả lớp đứng dậy coi. Thôi khỏi, ngồi luôn đi, vào câu một.',
    'Tiết mới tới rồi. Bàn đầu đang trống, ai giỏi thì lên ngồi.',
    'Cả lớp chú ý lên bảng. Chữ cô xáo lung tung, việc của các bạn nhỏ là xếp lại cho đúng.',
  ],

  goldenIntro: [
    'Câu cuối rồi! Câu hỏi vàng, điểm nhân đôi. Bạn nhỏ nào đang thua thì lật kèo ở câu này.',
    'Câu hỏi vàng tới đây! Đúng câu này điểm gấp đôi, bảng xếp hạng đổi hết đó.',
    'Tập trung nha, câu cuối nhân đôi điểm. Ai ngồi bàn đầu mà sai câu này là mất ghế như chơi.',
    'Câu hỏi vàng! Cô chờ xem ai là người cướp ngôi lớp trưởng.',
    'Câu cuối, nhân đôi điểm. Gõ nhanh mà nhớ gõ đúng dấu nha.',
  ],

  // đọc đề xong cô hô bắt đầu tính giờ
  go: [
    'Bắt đầu!',
    'Tính giờ! Bắt đầu!',
    'Đồng hồ chạy rồi, bắt đầu!',
    'Ba, hai, một, bắt đầu!',
    'Gõ đáp án đi các bạn nhỏ, bắt đầu!',
    'Bấm giờ nè, bắt đầu!',
    'Cô đếm giờ đây, bắt đầu!',
  ],

  // còn 5 giây
  timeWarn: [
    'Chuẩn bị hết giờ nhé các bạn nhỏ ơi!',
    'Sắp hết giờ rồi các bạn nhỏ ơi, nhanh tay lên!',
    'Còn năm giây thôi các bạn nhỏ ơi!',
    'Chuẩn bị hết giờ nha, ai chưa gõ thì gõ lẹ lên!',
  ],

  // trêu bạn sai + phạt lên bục đứng thật (nhân vật lên đứng cạnh bảng, đeo bảng "học sinh cá biệt")
  roastStand: [
    (n) => `Bạn ${n} gõ sai rồi, lên bục đứng cạnh cô một chút nha. Học sinh cá biệt đây rồi!`,
    (n) => `Ối ${n} sai nữa rồi! Lên bục đứng cho cả lớp nhìn nè, hihi.`,
    (n) => `Cô phạt ${n} lên bục đứng một lát nha. Đứng xong nhớ trả lời đúng đó.`,
    (n) => `${n} ơi, lên đứng góc lớp cạnh bảng nha. Cô đùa thôi, đứng một xíu rồi về chỗ.`,
  ],
  // gọi bạn ngủ gật (ngồi im lâu) dậy
  wakeUp: [
    (n) => `Ơ kìa bạn nhỏ ${n} ngủ gật rồi! Dậy trả lời câu này với cô coi.`,
    (n) => `${n} ơi, dậy đi nào, cô thấy bạn nhỏ gật gù nãy giờ đó.`,
    (n) => `Cả lớp gọi ${n} dậy giùm cô với. Bạn nhỏ ngủ ngon quá trời.`,
  ],

  // ---------- Thỉnh thoảng rủ tương tác (lúc đang chờ trả lời) ----------
  loveCall: [
    'Ai yêu cô thì gõ số một nào, các bé iu ơi!',
    'Bạn nhỏ nào thương cô thì gõ số một cho cô xem nha!',
    'Các bé iu ơi, ai đang học với cô thì gõ số một nào!',
    'Ai thấy cô hôm nay xinh thì gõ số một nha, hihi.',
    'Cô đếm xem lớp mình có bao nhiêu bạn nhỏ ngoan nè, gõ số một đi nào!',
  ],
  // c = số bạn gõ, n = vài tên
  loveThanks: [
    (c, n) => `Ôi ${c} bạn nhỏ yêu cô luôn, cô cảm động quá! Cô thương ${n} nhiều lắm.`,
    (c, n) => `${c} bạn gõ số một rồi nè! Cảm ơn ${n}, cô cũng yêu các bé lắm.`,
    (c, n) => `Cô thấy rồi nha, ${n} và các bạn, tổng cộng ${c} bạn nhỏ. Cô vui quá trời.`,
  ],

  // kết quả bình chọn vui: l = lựa chọn đông nhất, c = số bạn
  pollResult: [
    (l, c) => `Kết quả nè: ${l} đông nhất, ${c} bạn nhỏ luôn!`,
    (l, c) => `Cô đếm rồi nha, ${l} thắng với ${c} bạn nhỏ.`,
    (l, c) => `Ồ, ${l} nhiều nhất lớp mình, ${c} bạn. Vui quá trời.`,
  ],
  pollTie: [
    (c) => `${c} bạn nhỏ trả lời, mà hoà nhau luôn! Lớp mình chia đều ghê.`,
    (c) => `Hoà rồi nha, ${c} bạn chia đều hai bên. Cô thích cả hai.`,
  ],

  // chuyện vui, chuyện lịch sử, mẹo tiếng Anh (1-2 câu) lúc đang chờ trả lời. Chỉ ghi điều chắc chắn đúng.
  // "| E: ... | F:" = đọc phần tiếng Anh bằng giọng tiếng Anh
  funFact: [
    'Các bạn nhỏ có biết không, con bạch tuộc có tới ba trái tim đó.',
    'Con ngựa có thể ngủ trong lúc đứng đó các bạn nhỏ.',
    'Chim cánh cụt không bay được, nhưng bơi dưới nước giỏi lắm nha.',
    'Hươu cao cổ có cái lưỡi rất dài, màu tím sẫm luôn đó.',
    'Mặt trời thật ra là một ngôi sao, ở gần mình nhất nên mới to vậy đó.',
    'Biển và đại dương chiếm khoảng bảy phần mười bề mặt Trái Đất. Nhiều nước ghê chưa.',
    'Trái tim của mỗi bạn nhỏ đập khoảng một trăm nghìn lần mỗi ngày đó.',
    'Cá heo ngủ mà vẫn mở một mắt để canh chừng. Giỏi ghê chưa.',
    'Mật ong cất kỹ để rất lâu cũng không bị hỏng đó các bạn nhỏ.',
    'Con ong phải bay qua rất nhiều bông hoa mới làm ra được một chút mật đó.',
    'Cầu vồng có bảy màu: đỏ, cam, vàng, lục, lam, chàm, tím. Bạn nhỏ nào nhớ hết không?',
    'Văn Miếu ở Hà Nội xây từ năm một nghìn không trăm bảy mươi, gần một nghìn năm rồi đó.',
    'Thành Cổ Loa có những vòng thành xoắn như con ốc, do An Dương Vương cho xây.',
    'Chữ mình đang học gọi là chữ quốc ngữ, viết bằng chữ cái La-tinh đó các bạn nhỏ.',
    'Hồ Gươm còn có tên là hồ Hoàn Kiếm, gắn với truyền thuyết vua Lê Lợi trả gươm thần.',
    'Mẹo tiếng Anh nè: chào buổi sáng là good morning. Các bạn nhỏ nói theo cô nha.',
    'Mẹo tiếng Anh nè: cảm ơn là thank you, còn không có gì là you are welcome nha.',
    'Mẹo tiếng Anh nè: con yêu mẹ là I love you mom. Tối nay nói với mẹ thử nha.',
    'Mẹo tiếng Anh nè: chúc ngủ ngon là good night. Nhớ đi ngủ sớm nha các bạn nhỏ.',
    'Mẹo tiếng Anh nè: bạn tên gì là what is your name, trả lời là my name is nha.',
    'Mẹo tiếng Anh nè: số không là zero, còn một trăm là one hundred đó.',
    'Mẹo tiếng Anh nè: ngày mai gặp lại là see you tomorrow nha các bạn nhỏ.',
  ],

  // ---------- Lớp vắng: ôn bài bằng câu cũ ----------
  reviewIntro: [
    'Lớp mình đang vắng, cô cho ôn bài cũ nha. Bạn nhỏ nào vào lớp thì gõ chào cô một tiếng, cô ra bài mới liền.',
    'Giờ ôn bài nè. Cô hỏi lại mấy câu cũ, ai đang xem thì trả lời thử coi còn nhớ không nha.',
    'Tiết này mình ôn bài. Bạn nhỏ nào vào thì gõ vào lớp, cô chuyển sang bài mới cho nè.',
  ],
  reviewEnd: [
    'A, có bạn nhỏ vào lớp rồi! Hết ôn bài, cô ra câu mới nha.',
    'Lớp đông lên rồi nè. Thôi ôn bài vậy đủ, giờ học bài mới.',
    'Có bạn rồi! Cô chuyển sang câu mới cho các bạn nhỏ nè.',
  ],

  // ---------- Chào theo giờ trong ngày (đọc đầu tiết) ----------
  timeMorning: [
    'Chào buổi sáng các bạn nhỏ! Ăn sáng chưa đó? Vừa ăn vừa học với cô nha.',
    'Buổi sáng tốt lành cả lớp! Sáng sớm đầu óc tỉnh táo, trả lời nhanh lắm đó.',
    'Sáng rồi các bạn nhỏ ơi! Ai dậy sớm học bài với cô thì giỏi nhất lớp.',
  ],
  timeNoon: [
    'Trưa rồi các bạn nhỏ ơi, ăn cơm trưa chưa? Ăn xong nhớ ngủ trưa một chút nha.',
    'Giờ ăn trưa nè. Bạn nhỏ nào vừa ăn cơm vừa học với cô thì nhớ ăn hết cơm nha.',
    'Trưa nắng quá, các bạn nhỏ ở trong nhà học với cô cho mát nè.',
  ],
  timeAfternoon: [
    'Chào buổi chiều cả lớp! Đi học về chưa đó các bạn nhỏ?',
    'Buổi chiều rồi, bạn nhỏ nào vừa tan học thì vào lớp cô ôn bài tiếp nha.',
    'Chiều mát rồi nè. Học với cô một tiết rồi đi chơi nha các bạn nhỏ.',
  ],
  timeEvening: [
    'Chào buổi tối các bạn nhỏ! Ăn cơm tối xong vào học với cô nha.',
    'Tối rồi, cả nhà quây quần, các bạn nhỏ rủ ba mẹ chơi đoán chữ cùng luôn đi.',
    'Buổi tối lớp mình đông vui quá. Tiết này ai làm lớp trưởng đây?',
  ],
  timeNight: [
    'Khuya rồi các bạn nhỏ ơi. Bạn nhỏ nào còn thức thì học thêm một chút rồi đi ngủ nha.',
    'Đã khuya rồi đó. Các bạn nhỏ nhớ đi ngủ sớm để mai dậy học bài nha, cô vẫn ở đây.',
    'Giờ này các bạn nhỏ phải đi ngủ rồi nè. Ai còn thức thì chơi nhỏ nhỏ với cô thôi nha.',
  ],

  // ---------- Chúc mừng sinh nhật (bạn nhỏ gõ "hôm nay sinh nhật con") ----------
  birthday: [
    (n) => `Ôi hôm nay sinh nhật bạn nhỏ ${n}! Cả lớp cùng chúc mừng sinh nhật bạn nhỏ nào! Cô tặng bạn nhỏ một cái bánh kem nè.`,
    (n) => `Chúc mừng sinh nhật ${n}! Chúc bạn nhỏ hay ăn chóng lớn, học giỏi, ngoan ngoãn nha. Cả lớp vỗ tay nào!`,
    (n) => `Hôm nay là ngày đặc biệt của ${n} nè! Cô chúc bạn nhỏ tuổi mới thật vui, thật nhiều quà. Bánh kem của bạn nhỏ đây!`,
    (n) => `Cả lớp ơi, ${n} sinh nhật kìa! Mình cùng hát mừng sinh nhật bạn nhỏ nha. Cô đặt bánh kem lên bàn rồi đó.`,
    (n) => `Sinh nhật vui vẻ nha ${n}! Tuổi mới bạn nhỏ trả lời câu nào cũng đúng hết nha.`,
  ],

  // ---------- Chuyên cần: bạn nhỏ đi học nhiều ngày liền (d = số ngày) ----------
  attendBack: [
    (n, d) => `A, bạn nhỏ ${n} lại vào lớp nè! Đi học ${d} ngày liền rồi đó.`,
    (n, d) => `Cô nhớ ${n} nha, hôm qua cũng có mặt. ${d} ngày liền rồi, chăm ghê.`,
    (n, d) => `${n} quay lại rồi! Bạn nhỏ đi học đều ${d} ngày liền, cô thương quá.`,
    (n, d) => `Chào ${n}, ngày thứ ${d} liền vào lớp rồi đó. Ngoan lắm.`,
  ],
  // n tên, d số ngày, g quà
  attendMilestone: [
    (n, d, g) => `Cả lớp ơi, ${n} đi học ${d} ngày liền không nghỉ buổi nào! Cô tặng bạn nhỏ ${g} vì chuyên cần.`,
    (n, d, g) => `Bạn nhỏ chuyên cần nhất lớp đây rồi: ${n}, ${d} ngày liền! Phần thưởng là ${g}.`,
    (n, d, g) => `${d} ngày liền có mặt, ${n} giỏi quá! Cô thưởng ${g}, các bạn nhỏ khác học tập bạn nha.`,
  ],

  // ---------- Chủ kênh bấm "Bỏ câu này" ----------
  banned: [
    'Ối, câu này cô ra chưa hay, mình bỏ qua câu này nha các bạn nhỏ.',
    'Câu này cô đổi nha, sang câu khác liền.',
    'Thôi câu này bỏ, cô ra câu khác dễ thương hơn nè.',
  ],

  // ---------- Cả lớp chọn chủ đề tiết sau (a, b = 2 chủ đề) ----------
  voteIntro: [
    (a, b) => `Tiết sau học gì đây các bạn nhỏ? Gõ số một nếu chọn ${a}, gõ số hai nếu chọn ${b}.`,
    (a, b) => `Cả lớp quyết định nha! Một là ${a}, hai là ${b}. Gõ số vào bình luận đi nào.`,
    (a, b) => `Cô cho các bạn nhỏ chọn chủ đề tiết sau: một, ${a}. Hai, ${b}. Bên nào nhiều phiếu hơn thì học bên đó.`,
  ],
  voteResult: [
    (t) => `Cả lớp đã chọn rồi! Tiết này mình học chủ đề ${t} nha.`,
    (t) => `Chủ đề ${t} thắng rồi! Cô ra nhiều câu về ${t} cho các bạn nhỏ nè.`,
    (t) => `Theo ý cả lớp, tiết này có nhiều câu về ${t}. Chuẩn bị nha!`,
  ],
  voteNobody: [
    'Chưa ai chọn hết, vậy cô tự chọn câu hỏi nha.',
    'Không ai bình chọn hả? Thôi cô trộn đủ chủ đề luôn.',
  ],

  // ---------- Câu đố mẹo (câu 7, 14) ----------
  riddleReveal: [
    (answer, rest) => `Hết giờ rồi! Câu đố mẹo này đáp án là gì nhỉ? Chính là ${answer} nha! ${rest}`,
    (answer, rest) => `Thời gian kết thúc! Câu đố mẹo này là gì đây? Là ${answer} nha các bạn nhỏ! ${rest}`,
    (answer, rest) => `Hết giờ nha! Đáp án câu đố mẹo là ${answer} đó! ${rest}`,
    (answer, rest) => `Cô công bố nè, câu đố mẹo vừa rồi chính là ${answer}! ${rest}`,
  ],
  riddleNobody: [
    (a) => `Hết giờ rồi! Câu đố mẹo này là gì nhỉ? Hihi, đáp án là ${a} nha cả lớp!`,
    (a) => `Thời gian kết thúc mà chưa ai ra hả? Câu đố mẹo này là ${a} nha các bạn nhỏ!`,
    (a) => `Hết giờ nha! Đáp án câu đố mẹo là ${a} đó, câu sau quyết tâm gỡ lại nha!`,
  ],
  riddleWrong: [
    (n) => `Bạn nhỏ ${n} bị cô lừa rồi, hihi. Không sao, câu đố mẹo khó lắm.`,
    (n) => `${n} trả lời nghe có lý ghê mà vẫn trúng bẫy của cô.`,
    (n) => `Ối ${n} sập bẫy rồi! Câu đố mẹo phải nghĩ khác đi một chút nha.`,
  ],

  // ---------- Câu tiếng Anh (câu 3, 12) — dùng chung 1 giọng Cô Giáo liền mạch ----------
  englishReveal: [
    (answer, rest) => `Hết giờ rồi! Từ tiếng Anh này là gì nhỉ? Đáp án là ${answer} nha các bạn nhỏ! ${rest}`,
    (answer, rest) => `Thời gian kết thúc! Tiếng Anh câu này chính là ${answer}! Giỏi quá. ${rest}`,
    (answer, rest) => `Hết giờ nha! Cô công bố từ tiếng Anh là ${answer}. Nhớ chưa các bạn nhỏ? ${rest}`,
    (answer, rest) => `Đáp án tiếng Anh câu này là gì đây? Là ${answer} nha cả lớp! ${rest}`,
  ],
  englishNobody: [
    (a) => `Hết giờ rồi! Từ tiếng Anh này là gì nhỉ? Đáp án là ${a} nha, các bạn nhỏ đọc theo cô nè: ${a}.`,
    (a) => `Thời gian kết thúc mà chưa ai ra hả? Tiếng Anh câu này là ${a} nha, lần sau nhớ nhé!`,
    (a) => `Hết giờ nha! Đáp án tiếng Anh là ${a} đó các bạn nhỏ, câu sau gỡ điểm liền nha.`,
  ],

  // ---------- Câu lịch sử (câu 9, 17) ----------
  historyReveal: [
    (answer, rest) => `Hết giờ rồi! Câu lịch sử này đáp án là gì nhỉ? Chính là ${answer} nha cả lớp! ${rest}`,
    (answer, rest) => `Thời gian kết thúc! Đáp án lịch sử là ${answer} nha các bạn nhỏ. ${rest}`,
    (answer, rest) => `Hết giờ nha! Cô công bố đáp án lịch sử chính là ${answer}! ${rest}`,
    (answer, rest) => `Câu lịch sử vừa rồi là gì đây ta? Là ${answer} nha các bạn nhỏ! ${rest}`,
  ],

  // ---------- Câu toán nhẩm ----------
  mathIntro: [
    'Tới câu toán nhẩm rồi nè:',
    'Đổi gió làm câu tính nhẩm nha:',
    'Câu toán siêu nhanh tới đây:',
    'Nghỉ ghép chữ một chút, nhẩm nhanh cùng cô nha:',
    'Ai tính nhẩm nhanh nhất câu này đây:',
  ],
  mathBonus: [
    (speech) => `Hết giờ mà chưa ai ra hả? Cô cho thêm mười giây nha, ${speech || 'bằng bao nhiêu nào?'}`,
    (speech) => `Thêm mười giây nữa nè các bạn nhỏ, nhẩm lại cùng cô nha: ${speech || 'phép tính này bằng bao nhiêu?'}`,
    (speech) => `Cô cộng thêm mười giây nha! ${speech || 'Kết quả bằng bao nhiêu nhỉ?'}`,
  ],
  // promptPlain = "8 trừ 6", ans = "2" -> đọc nhịp nhàng có câu dẫn "bằng bao nhiêu"
  mathReveal: [
    (promptPlain, ans, rest) => `Hết giờ rồi! Phép tính ${promptPlain} bằng bao nhiêu nhỉ? Đáp án là bằng ${ans} nha cả lớp! ${rest}`,
    (promptPlain, ans, rest) => `Thời gian kết thúc! ${promptPlain} bằng bao nhiêu ta? Chính xác là bằng ${ans} nha! ${rest}`,
    (promptPlain, ans, rest) => `Hết giờ nha! Cô công bố nè: ${promptPlain} bằng bao nhiêu? Bằng ${ans} nha các bạn nhỏ! ${rest}`,
    (promptPlain, ans, rest) => `Xong giờ rồi! Phép tính ${promptPlain} bằng bao nhiêu đây? Bằng ${ans}, tính nhẩm siêu quá! ${rest}`,
  ],
  mathNobody: [
    (promptPlain, ans) => `Hết giờ rồi! Phép tính ${promptPlain} bằng bao nhiêu nhỉ? Bằng ${ans} đó cả lớp ơi, câu sau cố lên nha!`,
    (promptPlain, ans) => `Thời gian kết thúc mà chưa ai ra hả? ${promptPlain} bằng bao nhiêu ta? Đáp án là bằng ${ans} nha!`,
    (promptPlain, ans) => `Hết giờ nha! ${promptPlain} bằng bao nhiêu nhỉ? Bằng ${ans} đó các bạn nhỏ, câu tiếp theo gỡ lại liền nhé!`,
  ],
  mathWrong: [
    (n) => `${n} tính sai rồi kìa. Về nhà làm lại ${penalty()} bài toán nha.`,
    (n) => `${n} ơi, bạn nhỏ nhẩm hay đoán vậy?`,
    (n) => `Bạn ${n} cộng trừ kiểu gì mà ra số đó? Cô nể luôn.`,
    (n) => `${n} sai rồi, mai mang bảng cửu chương lên cho cô kiểm tra.`,
  ],

  // ---------- Trong lúc hỏi ----------
  firstCorrect: [
    (n) => `Ôi nhanh ghê! Bạn ${n} đúng đầu tiên rồi.`,
    (n) => `${n} trả lời đúng! Mười điểm về tay.`,
    (n) => `Giỏi quá ${n} ơi! Cả lớp còn đang dò chữ mà bạn nhỏ đã xong.`,
    (n) => `Bạn ${n} nhanh như chớp. Mấy bạn còn lại tranh hạng nhì đi.`,
    (n) => `Có người đúng rồi nha! Là ${n}. Còn ai nữa không?`,
    (n) => `${n} đúng rồi! Bạn nhỏ học lớp mấy mà giỏi vậy?`,
    (n) => `Chuẩn luôn ${n}! Cô cho bạn nhỏ ngồi bàn đầu.`,
    (n) => `${n} lụm mười điểm. Cả lớp nhanh tay lên kẻo hết điểm.`,
    (n) => `Ai cho phép ${n} giỏi vậy? Đúng rồi đó!`,
    (n) => `Trời ơi ${n}! Chưa kịp uống ngụm nước đã có người đúng.`,
    (n) => `Bạn ${n} ghi điểm đầu tiên. Ai về nhì nào?`,
    (n) => `Đúng rồi ${n}! Cô thấy bạn nhỏ có tố chất làm lớp trưởng.`,
    // khen như khen bé nhỏ tuổi
    (n) => `Bạn nhỏ ${n} giỏi quá, cô thưởng một ngôi sao nha.`,
    (n) => `Ôi bạn nhỏ ${n} ngoan ghê, đúng rồi! Cô thơm một cái nè.`,
    (n) => `${n} thông minh quá đi mất. Về khoe ba mẹ liền nha bạn nhỏ.`,
    (n) => `Ai dạy bạn nhỏ mà giỏi vậy ${n}? Cả lớp vỗ tay cho bạn nào.`,
    (n) => `Đúng rồi ${n} ơi! Cô dán cho bạn nhỏ một bông hoa điểm tốt.`,
    (n) => `${n} nhỏ xíu mà nhanh nhẹn ghê. Cô thương bạn nhỏ quá.`,
    (n) => `Giỏi lắm bạn nhỏ ơi! ${n} đúng là học trò ngoan của cô.`,
    (n) => `Hoan hô ${n}! Bạn nhỏ làm cô bất ngờ đó nha.`,
    (n) => `${n} đúng rồi nè. Bạn nhỏ vừa dễ thương vừa học giỏi.`,
    (n) => `Cô khen ${n} nè, bạn nhỏ chăm học ghê. Cả lớp học tập bạn nha.`,
  ],

  // đúng trong 4 giây đầu: khen thần đồng kiểu khen bé
  superFast: [
    (n) => `Thần đồng đây rồi! Bạn nhỏ ${n} vừa nghe đề đã ra luôn.`,
    (n) => `Trời ơi ${n} giỏi quá trời! Lớp mình có thần đồng rồi cả lớp ơi.`,
    (n) => `${n} nhanh như tia chớp luôn. Cô thơm bạn nhỏ một cái nè.`,
    (n) => `Ôi bạn nhỏ ${n} thông minh quá đi mất, cô chưa kịp chớp mắt đã đúng rồi.`,
    (n) => `Cả lớp vỗ tay cho thần đồng nhí ${n} nào! Giỏi ghê luôn.`,
    (n) => `${n} ơi, bạn nhỏ ăn gì mà thông minh vậy? Về khoe ba mẹ liền nha.`,
    (n) => `Siêu nhân nhí ${n} xuất hiện! Mới mấy giây đã có đáp án.`,
    (n) => `Cô phục ${n} luôn đó. Nhỏ xíu mà giỏi như thần đồng vậy nè.`,
  ],

  quietHalfway: [
    'Sao im re vậy cả lớp? Khó lắm hả?',
    'Lớp mình đang suy nghĩ hay đang ngủ vậy?',
    'Chưa ai đúng hết. Cô hơi buồn nha.',
    'Nhìn kỹ mấy chữ trên bảng đi, đáp án nằm ngay đó.',
    'Gõ đại một chữ đi, sai cô cũng không trừ điểm đâu.',
    'Lớp mình học giỏi lắm mà, sao câu này ai cũng im?',
    'Mấy bạn nhỏ bàn cuối đâu rồi, nói chuyện riêng giỏi lắm mà, trả lời đi!',
    'Còn nửa thời gian. Cô ngồi chờ mà nóng ruột quá.',
  ],

  bonus: [
    'Khó quá hả cả lớp? Cô mở thêm một chữ, cho thêm mười giây nữa nè.',
    'Thôi được rồi, cô thương, cô mở một chữ. Mười giây nữa thôi đó.',
    'Cả lớp bí rồi. Cô cho gợi ý thêm một chữ, nhanh lên!',
    'Hết giờ mà chưa ai đúng. Cô nhá hàng thêm một chữ, mười giây nữa.',
    'Cô mở thêm một chữ nè. Vậy mà còn không ra thì cô đi về.',
    'Bí thật hả? Cô cho thêm một chữ với mười giây. Ráng lên.',
    'Lớp mình làm cô lo quá. Thêm một chữ, thêm mười giây.',
    'Gợi ý thêm một chữ. Câu này mà sai nữa là về chép phạt hết.',
  ],

  // ---------- Hiện đáp án ----------
  reveal: [
    (answer, rest) => `Hết giờ rồi! Ô chữ này ghép lại là gì nhỉ? Đáp án chính là ${answer} nha cả lớp! ${rest}`,
    (answer, rest) => `Thời gian kết thúc! Từ đúng trên bảng là gì đây? Là ${answer} nha các bạn nhỏ! ${rest}`,
    (answer, rest) => `Hết giờ nha! Cô công bố đáp án câu này chính là ${answer}! ${rest}`,
    (answer, rest) => `Xếp lại các chữ trên bảng thì thành chữ gì nhỉ? Thành ${answer} nha! ${rest}`,
  ],
  // phần "rest" của câu trên: tên người nhất câu
  revealTop: [
    (n) => `Nhất câu này là ${n}.`,
    (n) => `Người nhanh nhất là ${n}.`,
    (n) => `Mười điểm thuộc về ${n}.`,
    (n) => `${n} về nhất câu này.`,
  ],
  revealCount: [
    (c) => `Cả lớp có ${c} bạn đúng.`,
    (c) => `Tổng cộng ${c} bạn trả lời đúng.`,
    (c) => `Có ${c} bạn đúng, giỏi quá trời.`,
  ],

  revealNobody: [
    (a) => `Hết giờ rồi! Ô chữ này ghép lại là gì nhỉ? Đáp án là ${a} nha cả lớp, câu sau cố lên nào!`,
    (a) => `Thời gian kết thúc mà chưa ai đoán ra hả? Từ đúng là ${a} nha các bạn nhỏ!`,
    (a) => `Hết giờ nha! Xếp lại chữ trên bảng là ${a} đó, câu tiếp theo gỡ điểm liền nhé!`,
    (a) => `Chưa bạn nào ra kịp rồi, đáp án câu này là ${a} nha cả lớp!`,
  ],

  roastWrong: [
    (n) => `Bạn ${n} gõ sai rồi kìa. Về nhà chép phạt ${penalty()} lần nha.`,
    (n) => `${n} sai rồi. Phạt chép lại đáp án ${penalty()} lần, mai nộp cho cô.`,
    (n) => `Cô phạt ${n} chép ${penalty()} lần. Chép xong mới được ra chơi.`,
    (n) => `${n} ơi, bạn nhỏ đoán bừa phải không? Cô biết hết đó.`,
    (n) => `${n} trả lời tự tin ghê mà sai. Cô thích sự tự tin đó.`,
    (n) => `Cô thấy ${n} gõ sai nha. Lần sau cẩn thận hơn nha.`,
    (n) => `${n} ơi, chữ đó không có trong từ điển đâu bạn nhỏ ơi.`,
    (n) => `Bạn ${n} sai rồi, nhưng cô thưởng điểm dũng cảm.`,
    (n) => `${n} gõ gì vậy bạn nhỏ? Cô đọc mà muốn lên huyết áp.`,
    (n) => `Câu này ${n} làm cô cười quá. Sai rồi nha.`,
    (n) => `${n} sai mà không sao, ít ra bạn nhỏ còn dám gõ.`,
    (n) => `Ê ${n}, nhìn lại mấy chữ trên bảng coi, đâu có chữ đó.`,
    (n) => `${n} trả lời nhanh mà sai. Nhanh nhảu đoảng đó bạn nhỏ.`,
    (n) => `Cô ghi tên ${n} vào sổ đầu bài nha. Đùa đó, lần sau cố lên.`,
    (n) => `Bạn ${n} ơi, ba mẹ có biết bạn nhỏ trả lời vậy không?`,
    (n) => `${n} chắc đang vừa xem live vừa ăn mì nên gõ nhầm.`,
    (n) => `${n} sai rồi. Ngồi xuống, câu sau làm lại.`,
  ],

  streak: [
    (n) => `${n} đúng ba câu liền! Cô thưởng thêm năm điểm.`,
    (n) => `${n} đang lên phong độ, ba câu không trượt câu nào. Cộng năm điểm.`,
    (n) => `Chuỗi ba câu đúng của ${n}! Năm điểm thưởng nha.`,
    (n) => `${n} học bài kỹ ghê, ba câu liền. Cô cộng thêm năm điểm.`,
    (n) => `Ai cản ${n} được không? Ba câu liền, cộng năm điểm.`,
  ],

  goldenWinner: [
    (n) => `${n} ăn trọn câu hỏi vàng, hai mươi điểm!`,
    (n) => `Câu hỏi vàng về tay ${n}! Nhân đôi điểm nha.`,
    (n) => `${n} lật kèo ở câu cuối. Hai mươi điểm luôn.`,
    (n) => `Người giữ câu hỏi vàng là ${n}. Xuất sắc!`,
  ],

  // ---------- Cô thưởng quà (quà đặt lên bàn bạn nhỏ). g = tên quà, vd "một cây kẹo mút" ----------
  firstCorrectGift: [
    (n, g) => `${n} đúng rồi! Cô thưởng bạn nhỏ ${g} nha.`,
    (n, g) => `Giỏi quá ${n}! Cô đặt ${g} lên bàn bạn nhỏ nè.`,
    (n, g) => `${n} nhanh nhất! Phần thưởng là ${g}.`,
    (n, g) => `Cô thưởng ${n} ${g}, ai muốn có thì trả lời nhanh lên.`,
    (n, g) => `${n} đúng đầu tiên, cô tặng ${g}. Bạn nhỏ giỏi quá.`,
    (n, g) => `Ôi ${n} ngoan ghê, cô thưởng ${g} nè.`,
  ],
  streakGift: [
    (n, g) => `Ba câu liền rồi ${n}! Thêm năm điểm, cô thưởng thêm ${g}.`,
    (n, g) => `${n} ba câu liền! Năm điểm với ${g}, cô thưởng nóng.`,
    (n, g) => `Chuỗi ba câu của ${n}! Năm điểm, kèm ${g} đặt lên bàn luôn.`,
  ],
  goldenGift: [
    (n, g) => `Câu hỏi vàng là của ${n}! Cô thưởng gấp đôi điểm, thêm ${g} nữa.`,
    (n, g) => `${n} giành câu hỏi vàng! Hai mươi điểm và ${g}.`,
  ],

  // ---------- Dừng giữa tiết: cô điểm danh bạn nhỏ giỏi, tặng quà, rồi mới ra câu tiếp ----------
  praiseIntro: [
    'Dừng lại một chút nha. Cô điểm danh các bạn nhỏ giỏi nhất từ đầu tiết nè.',
    'Nghỉ tay một xíu, cô xem bảng điểm các bạn nhỏ nha.',
    'Khoan ra câu tiếp, cô phát quà cho các bạn nhỏ giỏi đã.',
    'Tạm dừng nè các bạn nhỏ. Ai đang dẫn đầu lớp mình?',
  ],
  // n tên, s điểm, g quà
  praiseFirst: [
    (n, s, g) => `Đứng nhất là bạn nhỏ ${n}, ${s} điểm. Cô tặng ${g}.`,
    (n, s, g) => `Dẫn đầu đang là ${n} với ${s} điểm. Quà của bạn nhỏ là ${g}.`,
    (n, s, g) => `Nhất lớp lúc này là ${n}, ${s} điểm. Cô đặt ${g} lên bàn nè.`,
  ],
  praiseSecond: [
    (n, s, g) => `Hạng nhì là ${n}, ${s} điểm, được ${g}.`,
    (n, s, g) => `Theo sát là ${n} với ${s} điểm, cô tặng ${g}.`,
  ],
  praiseThird: [
    (n, s, g) => `Hạng ba là ${n}, ${s} điểm, nhận ${g}.`,
    (n, s, g) => `Thứ ba là ${n}, ${s} điểm, cô tặng ${g} nha.`,
  ],
  // mời tương tác, sau câu này cô chờ vài giây rồi mới ra câu tiếp
  praiseOutro: [
    'Các bạn nhỏ còn lại cố lên nha. Ai muốn được quà thì chào cô một tiếng đi nào.',
    'Bạn nhỏ nào chưa có quà thì thả tim cho cô xem nào, câu sau cố lên.',
    'Cả lớp vỗ tay cho các bạn giỏi nào. Ai muốn kẹo thì gõ "con muốn kẹo" đi.',
    'Còn nhiều quà lắm, các bạn nhỏ trả lời nhanh là có phần. Chuẩn bị câu tiếp nha.',
  ],

  // ---------- Hết tiết ----------
  results: [
    (n, s) => `Hết tiết! Nhất lớp tiết này là ${n}, được ${s} điểm. Cả lớp vỗ tay nào!`,
    (n, s) => `Tổng kết tiết học: ${n} đứng đầu với ${s} điểm. Giỏi quá!`,
    (n, s) => `Trống tan tiết rồi. Hạng nhất thuộc về ${n}, ${s} điểm.`,
    (n, s) => `${n} nhất tiết này, ${s} điểm. Cô treo ảnh bạn nhỏ lên bảng vàng.`,
    (n, s) => `Chúc mừng ${n}, ${s} điểm, giấy khen tiết này là của bạn nhỏ.`,
    (n, s) => `Ai cũng cố gắng, nhưng ${n} cố gắng nhất. ${s} điểm, nhất lớp!`,
    (n, s) => `Hết giờ! ${n} được ${s} điểm, về nhà khoe ba mẹ đi.`,
    (n, s) => `Nhất tiết này là ${n} với ${s} điểm. Mấy bạn khác tiết sau lấy lại nha.`,
  ],
  resultsNobody: [
    'Tiết này chưa ai ghi điểm. Tiết sau cả lớp cố lên nha.',
    'Không ai có điểm luôn. Cô đi xin thêm phấn rồi dạy lại từ đầu.',
    'Hết tiết mà bảng điểm trống trơn. Lớp mình ngủ đông rồi hả?',
    'Tiết này buồn quá, chưa ai đúng câu nào. Ra chơi xong làm lại nha.',
    'Không sao, tiết sau lớp mình phục thù.',
  ],

  newMonitor: [
    (n) => `Lớp mình có lớp trưởng mới rồi, là ${n}!`,
    (n) => `${n} vượt lên dẫn đầu tiết này, lên làm lớp trưởng luôn.`,
    (n) => `Đổi lớp trưởng! ${n} giờ đứng nhất tiết này.`,
    (n) => `Chức lớp trưởng về tay ${n}. Lớp trưởng cũ ráng giành lại đi.`,
    (n) => `${n} lên lớp trưởng. Từ giờ bạn nhỏ hô cả lớp đứng dậy nha.`,
    (n) => `Bảng xếp hạng đổi rồi, ${n} làm lớp trưởng.`,
  ],

  // cuối giờ ra chơi: lớp trưởng tiết vừa rồi (mỗi tiết tranh lại từ đầu)
  championBoard: [
    (n) => `Lớp trưởng tiết vừa rồi là ${n}. Tiết sau ai giành ghế lớp trưởng đây?`,
    (n) => `${n} vừa làm lớp trưởng. Tiết mới điểm làm lại từ đầu, ai cũng có cơ hội nha.`,
    (n) => `Chúc mừng lớp trưởng ${n}! Các bạn nhỏ khác tiết sau giành lại đi nào.`,
  ],
  // n tên, k số lần làm lớp trưởng
  championAgain: [
    (n, k) => `${n} làm lớp trưởng ${k} lần rồi đó! Có bạn nhỏ nào hạ được ${n} không?`,
    (n, k) => `Lại là ${n}, lớp trưởng ${k} lần! Tiết sau cả lớp cùng thử thách bạn nhỏ nha.`,
    (n, k) => `${k} lần lớp trưởng, ${n} giỏi quá trời. Ai muốn soán ngôi thì vào tiết sau.`,
  ],
  weekBoard: [
    (n) => `Bảng vàng tuần này, hạng nhất là ${n}.`,
    (n) => `Đứng đầu cả tuần là ${n}. Mai vào lớp tiếp để giữ hạng nha.`,
    (n) => `Tuần này ${n} đang nhất. Ai muốn vượt thì chăm vào lớp.`,
  ],

  // ---------- Quà, follow, chào ----------
  thankGift: [
    (n, g) => `Cô cảm ơn ${n} tặng ${g} nha.`,
    (n, g) => `Ôi ${g} của ${n}, cô thương bạn nhỏ nhất lớp.`,
    (n, g) => `${n} tặng cô ${g}. Học trò ngoan như vầy cô cưng lắm.`,
    (n, g) => `Cảm ơn ${n}! ${g} đẹp quá, cô cắm lên bàn liền.`,
    (n, g) => `${n} ơi, ${g} này cô giữ làm kỷ niệm.`,
    (n, g) => `Cô nhận ${g} của ${n} rồi nha. Cảm ơn bạn nhỏ.`,
    (n, g) => `${n} tặng ${g} cho cô. Cả lớp học theo bạn đi.`,
    (n, g) => `Hoa của ${n} đây. Cô cảm ơn, hôm nay cô vui lắm.`,
    (n, g) => `Ai như ${n}, vừa học giỏi vừa biết thương cô. Cảm ơn bạn nhỏ.`,
    (n, g) => `${n} tặng ${g}. Cô không cộng điểm đâu nha, nhưng cô nhớ mặt bạn nhỏ rồi.`,
    (n, g) => `Cảm ơn ${n}, ${g} làm lớp mình sáng hẳn lên.`,
    (n, g) => `${n} ơi cảm ơn bạn nhỏ. Mai cô cho lau bảng.`,
  ],
  bigGift: [
    (n) => `Trời ơi ${n} tặng quà to quá! Cả lớp vỗ tay cho bạn đi.`,
    (n) => `${n} chơi lớn quá. Cô cảm động muốn khóc luôn.`,
    (n) => `Quà to của ${n}! Cô cho bạn nhỏ làm lớp phó văn nghệ danh dự.`,
    (n) => `${n} ơi, quà này cô không dám nhận đâu... thôi nhận luôn. Cảm ơn bạn nhỏ!`,
    (n) => `Cả lớp nhìn ${n} mà học tập nha. Cảm ơn bạn nhỏ nhiều lắm.`,
    (n) => `${n} tặng quà xịn. Cô đặt bạn nhỏ lên bàn đầu trong tim cô.`,
  ],
  giftHint: [
    (n) => `${n} xin cô mở thêm một chữ, cả lớp nhờ bạn đó nha.`,
    (n) => `Nhờ quà của ${n}, cô mở thêm một chữ cho cả lớp.`,
    (n) => `${n} giải cứu cả lớp, mở thêm một chữ nè.`,
    (n) => `${n} tặng quà, cô thưởng cả lớp một chữ gợi ý.`,
    (n) => `Cảm ơn ${n}! Thêm một chữ trên bảng rồi, ai đoán ra nào?`,
    (n) => `${n} bao cả lớp một chữ. Cảm ơn bạn đi các bạn nhỏ.`,
  ],
  thankFollow: [
    (n) => `Cô cảm ơn ${n} đã theo dõi kênh nha.`,
    (n) => `${n} vừa theo dõi lớp mình. Chào học sinh mới!`,
    (n) => `Cảm ơn ${n} đã bấm theo dõi, mai nhớ vào lớp đúng giờ.`,
    (n) => `${n} vào sổ điểm danh của lớp rồi. Cảm ơn bạn nhỏ.`,
    (n) => `Học sinh mới ${n} đã theo dõi. Cả lớp chào bạn đi.`,
    (n) => `${n} theo dõi kênh rồi, cô nhớ mặt bạn nhỏ rồi đó.`,
  ],
  greeting: [
    (names) => `Chào ${names} vào lớp. Gõ đáp án vào bình luận là chơi được liền.`,
    (names) => `${names} vào lớp trễ nha, cô bỏ qua lần này. Ngồi xuống chơi luôn đi.`,
    (names) => `Lớp mình có thêm ${names}. Chào mừng các bạn nhỏ.`,
    (names) => `${names} vừa vào. Kiếm chỗ ngồi đi, câu tiếp theo cô hỏi liền.`,
    (names) => `Ồ ${names} tới rồi. Cả lớp đông vui quá.`,
    (names) => `Chào ${names}. Muốn ngồi bàn đầu thì trả lời đúng nhiều vào.`,
    (names) => `${names} điểm danh có mặt. Vào học thôi.`,
    (names) => `Hoan nghênh ${names}! Ai chưa biết luật thì cứ nhìn bảng mà đoán chữ.`,
  ],
  share: [
    'Thấy vui thì bấm chia sẻ live rủ bạn bè vào thi với lớp mình nha.',
    'Lớp đông mới vui, các bạn nhỏ chia sẻ live cho bạn bè vào học chung đi.',
    'Ai rủ được bạn vào lớp, cô ghi nhận công lao. Bấm chia sẻ nha.',
    'Chia sẻ live cho người bạn hay khoe học giỏi vào đây thử sức coi.',
    'Bấm theo dõi kênh để mai còn vào lớp đúng giờ nha các bạn nhỏ.',
    'Thả tim cho đầy bảng đi cả lớp, đủ tim là cả lớp vỗ tay.',
    'Rủ thêm bạn vào đi, lớp còn nhiều ghế trống lắm.',
    'Ai đứng ngoài cửa lớp thì trả lời đúng nhiều để được vào ghế ngồi nha.',
  ],
  idle: [
    'Lớp im re vậy, ngủ hết rồi hả?',
    'Có ai còn ở đây không? Cô thấy lớp vắng tanh.',
    'Cả lớp đi ăn vặt hết rồi hay sao vậy?',
    'Im lặng quá, cô nghe được tiếng muỗi bay luôn.',
    'Gõ gì đó đi các bạn nhỏ, cô đứng một mình buồn lắm.',
    'Ai còn thức thì gõ "có mặt" cho cô biết với.',
    'Lớp mình đang nghĩ đáp án hay đang lướt TikTok khác vậy?',
    'Cô đếm tới ba, không ai gõ là cô cho bài tập về nhà. Một... hai...',
    'Ủa, mạng rớt hay cả lớp rớt vậy?',
    'Các bạn nhỏ im quá, cô tưởng mình đang dạy lớp ma.',
  ],
  clap: [
    'Đủ tim rồi, cả lớp vỗ tay nào!',
    'Tim đầy bảng rồi! Vỗ tay cho lớp mình!',
    'Cảm ơn cả lớp thả tim, cô vui quá. Vỗ tay!',
    'Tim nhiều quá, cô cho cả lớp vỗ tay ăn mừng.',
  ],

  // ---------- Giờ ra chơi ----------
  recessIntro: [
    'Ra chơi! Mười phút... à không, một phút thôi. Chơi với cô một trò nha.',
    'Tùng tùng tùng, giờ ra chơi! Cô có trò này hay lắm.',
    'Giải lao chút nha cả lớp. Cô chơi với các bạn nhỏ một trò.',
    'Ra chơi rồi! Cất sách vở, chơi với cô.',
    'Học mệt rồi, ra chơi một chút. Trò này dễ lắm, ai cũng chơi được.',
  ],

  rpsIntro: [
    'Oẳn tù tì với cô! Gõ búa, kéo hoặc bao. Thắng cô được cộng hai điểm.',
    'Chơi oẳn tù tì nha. Gõ búa, kéo hay bao vào bình luận. Cô ra sau cùng.',
    'Trò oẳn tù tì! Mỗi người gõ một lần thôi: búa, kéo hoặc bao.',
    'Ai dám đấu oẳn tù tì với cô? Gõ búa, kéo hoặc bao. Thắng được hai điểm.',
  ],
  rpsReveal: [
    (pick, rest) => `Cô ra ${pick}! ${rest}`,
    (pick, rest) => `Một, hai, ba, cô ra ${pick}. ${rest}`,
    (pick, rest) => `Oẳn tù tì ra cái gì ra cái này: ${pick}! ${rest}`,
    (pick, rest) => `Cô chọn ${pick} nha. ${rest}`,
  ],
  rpsWin: [
    (c) => `Có ${c} bạn thắng cô, mỗi bạn hai điểm.`,
    (c) => `${c} bạn thắng rồi, cô thua tâm phục khẩu phục.`,
    (c) => `Cô thua ${c} bạn. Hai điểm cho mỗi người.`,
  ],
  rpsLose: [
    (c) => `${c} bạn thua cô. Về tập oẳn tù tì thêm đi.`,
    (c) => `Cô hạ được ${c} bạn. Cô vẫn còn phong độ lắm.`,
    (c) => `${c} bạn thua cô kìa. Lêu lêu.`,
  ],
  rpsNobody: [
    'Không ai chơi với cô hết. Cô tự oẳn tù tì với cái bảng vậy.',
    'Lớp mình sợ thua cô nên không ai chơi hả?',
    'Không ai ra cái gì. Cô thắng mặc định nha.',
  ],

  callUp: [
    (n) => `Kiểm tra miệng! Cô mời ${n} lên bảng. Bạn nhỏ có mười lăm giây.`,
    (n) => `${n} đâu rồi? Lên bảng trả bài cho cô. Mười lăm giây nha.`,
    (n) => `Hôm nay cô gọi ${n}. Chỉ mình bạn nhỏ được trả lời câu này.`,
    (n) => `${n} ơi, tới lượt bạn nhỏ kiểm tra miệng. Cả lớp im lặng nghe bạn trả lời.`,
    (n) => `Cô dò tên trong sổ... ${n}! Lên bảng.`,
    (n) => `${n} ngồi im quá, cô gọi bạn nhỏ lên. Mười lăm giây, đúng được năm điểm.`,
    (n) => `Mời ${n} lên bảng! Các bạn khác không được nhắc bài nha.`,
    (n) => `Kiểm tra miệng nha, cô chọn ${n}. Run chưa bạn nhỏ?`,
  ],
  callUpRight: [
    (n) => `${n} trả lời đúng! Năm điểm, về chỗ.`,
    (n) => `Giỏi quá ${n}! Cô cho bạn nhỏ năm điểm miệng.`,
    (n) => `${n} học bài kỹ ghê. Đúng rồi, năm điểm nha.`,
    (n) => `Chuẩn rồi ${n}! Cả lớp vỗ tay cho bạn.`,
    (n) => `${n} qua bài kiểm tra miệng. Cô yên tâm rồi.`,
    (n) => `Đúng luôn ${n}. Cô định làm khó mà bạn nhỏ không sợ.`,
  ],
  callUpWrong: [
    (n) => `${n} sai rồi bạn nhỏ ơi. Về chỗ, mai trả bài lại.`,
    (n) => `Ôi ${n}, cô gọi đúng lúc bạn nhỏ chưa học bài.`,
    (n) => `${n} trả lời sai. Cô không ghi sổ đâu, lần sau cố lên.`,
    (n) => `Sai rồi ${n}. Bạn nhỏ có xem bảng không vậy?`,
    (n) => `${n} ơi, đáp án đâu phải vậy. Về chỗ ngồi suy nghĩ nha.`,
    (n) => `Câu dễ vậy mà ${n} sai. Cô mời phụ huynh nha... đùa thôi.`,
    (n) => `${n} gõ tự tin ghê mà sai. Cô cho bạn nhỏ điểm tự tin.`,
    (n) => `Chưa đúng ${n}. Cả lớp đừng cười bạn nha, ai cũng có lúc vậy.`,
  ],
  callUpSilent: [
    (n) => `${n} im lặng luôn. Chắc bạn nhỏ ngủ gật rồi.`,
    (n) => `Hết giờ mà ${n} không nói gì. Cô ghi tên vô sổ đầu bài nha.`,
    (n) => `${n} đâu rồi? Cô gọi mà không thấy trả lời.`,
    (n) => `${n} đứng hình luôn. Về chỗ đi bạn nhỏ.`,
    (n) => `${n} chắc đang đi lấy nước. Thôi để lần sau.`,
    (n) => `Mười lăm giây trôi qua, ${n} vẫn im. Cô hiểu rồi, chưa học bài.`,
    (n) => `${n} trốn kiểm tra miệng hả? Cô nhớ tên bạn nhỏ rồi nha.`,
    (n) => `${n} không trả lời. Cả lớp nhắc bạn học bài đi.`,
  ],

  pickIntro: [
    (a, b) => `Chọn phe nha! ${a} hay ${b}? Gõ số một nếu chọn ${a}, số hai nếu chọn ${b}.`,
    (a, b) => `Cả lớp chia phe: một là ${a}, hai là ${b}. Gõ số đi.`,
    (a, b) => `Câu hỏi khó nhất hôm nay: ${a} hay ${b}? Gõ một hoặc hai.`,
    (a, b) => `Bỏ phiếu nha. Số một là ${a}, số hai là ${b}.`,
  ],
  pickResult: [
    (win, pct) => `Phe ${win} thắng với ${pct} phần trăm.`,
    (win, pct) => `${pct} phần trăm cả lớp chọn ${win}. Phe kia ra góc lớp đứng.`,
    (win, pct) => `Kết quả: ${win} thắng, ${pct} phần trăm.`,
    (win, pct) => `Lớp mình chọn ${win}, ${pct} phần trăm luôn.`,
  ],
  pickRoast: [
    (lose) => `Phe ${lose} ít người quá, ăn nói cẩn thận nha.`,
    (lose) => `Ai chọn ${lose} thì giơ tay lên cho cô coi mặt.`,
    (lose) => `Phe ${lose} thua rồi, về nhà suy nghĩ lại cuộc đời đi.`,
    (lose) => `Cô không bênh ai, nhưng chọn ${lose} là hơi lạ đó.`,
    (lose) => `${lose} cũng ngon mà, sao ít người chọn vậy ta?`,
    (lose) => `Phe ${lose} ơi, đừng buồn, cô cũng từng chọn sai.`,
  ],
  pickTie: [
    'Hòa luôn! Lớp mình chia đôi rõ ràng quá.',
    'Hai phe bằng nhau. Thôi khỏi cãi, chọn cả hai.',
  ],
  pickNobody: [
    'Không ai chọn phe nào. Lớp mình trung lập ghê.',
    'Chưa ai bỏ phiếu hết. Thôi cô chọn giùm luôn.',
  ],

  rollIntro: [
    'Điểm danh siêu tốc! Gõ "có mặt" thật nhanh. Mười bạn đầu tiên được ba điểm.',
    'Ai có mặt thì gõ "có mặt"! Mười bạn nhanh nhất có điểm.',
    'Cô điểm danh nè, gõ "có mặt" đi. Nhanh tay thì có ba điểm.',
    'Điểm danh! Gõ "có mặt". Mười bạn đầu tiên cô cộng ba điểm.',
  ],
  rollResult: [
    (names) => `Nhanh nhất là ${names}. Mỗi bạn ba điểm.`,
    (names) => `Có mặt sớm nhất: ${names}. Ba điểm nha.`,
    (names) => `${names} điểm danh nhanh nhất. Cộng ba điểm.`,
    (names) => `Cô ghi nhận ${names} có mặt đầu tiên.`,
  ],
  rollNobody: [
    'Không ai có mặt hả? Vậy cô dạy cho ai nghe?',
    'Điểm danh mà không ai trả lời. Cả lớp trốn học hết rồi.',
  ],

  heartIntro: [
    (t) => `Thử thách thả tim! Ba mươi giây, cả lớp thả đủ ${t} tim thì ai cũng được một điểm.`,
    (t) => `Cả lớp thả tim đi! Đủ ${t} tim trong ba mươi giây là có quà.`,
    (t) => `Tim nào tim nào! Cần ${t} tim trong ba mươi giây.`,
    (t) => `Thả tim lẹ lên các bạn nhỏ, đủ ${t} tim cô cộng điểm cả lớp.`,
  ],
  heartWin: [
    'Đủ tim rồi! Cả lớp mỗi người một điểm.',
    'Lớp mình đoàn kết quá. Một điểm cho tất cả!',
    'Thành công! Cô cộng mỗi bạn một điểm.',
    'Tim đầy rồi, cả lớp được điểm. Cô vui quá.',
  ],
  heartFail: [
    (c) => `Mới được ${c} tim thôi, chưa đủ. Lần sau thả mạnh tay hơn nha.`,
    (c) => `${c} tim, thiếu chút xíu. Tiếc quá cả lớp ơi.`,
    (c) => `Chỉ có ${c} tim. Ngón tay lớp mình yếu quá.`,
    (c) => `${c} tim thôi hả? Cô buồn nhẹ.`,
  ],
};

// Câu hỏi "chọn phe" cho giờ ra chơi
// Bình chọn vui lúc chờ trả lời: gõ 1 chữ cái (đáp án câu chữ luôn từ 2 chữ nên không lẫn). key viết thường, không dấu.
const POLLS = [
  {
    ask: 'Các bạn nhỏ ở đâu nè? Miền Bắc gõ chữ B, miền Trung gõ chữ T, miền Nam gõ chữ N nha!',
    opts: [{ key: 'b', label: 'miền Bắc' }, { key: 't', label: 'miền Trung' }, { key: 'n', label: 'miền Nam' }],
  },
  {
    ask: 'Bạn nhỏ đang làm gì đó? Đang ăn cơm gõ chữ C, đang học bài gõ chữ H, đang chơi gõ chữ X nha!',
    opts: [{ key: 'c', label: 'phe đang ăn cơm' }, { key: 'h', label: 'phe đang học bài' }, { key: 'x', label: 'phe đang chơi' }],
  },
  {
    ask: 'Thích chó thì gõ chữ C, thích mèo thì gõ chữ M nha các bạn nhỏ!',
    opts: [{ key: 'c', label: 'phe thích chó' }, { key: 'm', label: 'phe thích mèo' }],
  },
  {
    ask: 'Thích đi biển gõ chữ B, thích đi núi gõ chữ N nào!',
    opts: [{ key: 'b', label: 'phe đi biển' }, { key: 'n', label: 'phe đi núi' }],
  },
  {
    ask: 'Thích môn toán gõ chữ T, tiếng Việt gõ chữ V, tiếng Anh gõ chữ A nha!',
    opts: [{ key: 't', label: 'phe môn toán' }, { key: 'v', label: 'phe tiếng Việt' }, { key: 'a', label: 'phe tiếng Anh' }],
  },
  {
    ask: 'Ăn phở gõ chữ P, ăn bún gõ chữ B, ăn cơm tấm gõ chữ C. Bạn nhỏ thích món nào?',
    opts: [{ key: 'p', label: 'phe phở' }, { key: 'b', label: 'phe bún' }, { key: 'c', label: 'phe cơm tấm' }],
  },
  {
    ask: 'Thích ăn kẹo gõ chữ K, thích ăn kem gõ chữ E nha các bạn nhỏ!',
    opts: [{ key: 'k', label: 'phe ăn kẹo' }, { key: 'e', label: 'phe ăn kem' }],
  },
  {
    ask: 'Thích mùa hè gõ chữ H, thích mùa đông gõ chữ D nào!',
    opts: [{ key: 'h', label: 'phe mùa hè' }, { key: 'd', label: 'phe mùa đông' }],
  },
  {
    ask: 'Bạn nhỏ học lớp mấy rồi? Mẫu giáo gõ chữ M, tiểu học gõ chữ T, cấp hai gõ chữ H nha!',
    opts: [{ key: 'm', label: 'các bạn mẫu giáo' }, { key: 't', label: 'các bạn tiểu học' }, { key: 'h', label: 'các bạn cấp hai' }],
  },
  {
    ask: 'Thích màu hồng gõ chữ H, thích màu xanh gõ chữ X nào các bạn nhỏ!',
    opts: [{ key: 'h', label: 'phe màu hồng' }, { key: 'x', label: 'phe màu xanh' }],
  },
];

const PICK_TOPICS = [
  ['phở', 'bún bò'],
  ['trà sữa', 'cà phê'],
  ['chó', 'mèo'],
  ['đi biển', 'đi núi'],
  ['Tết ở quê', 'Tết ở phố'],
  ['mì tôm trứng', 'mì tôm xúc xích'],
  ['ngủ nướng', 'dậy sớm'],
  ['ăn cay', 'không ăn cay'],
  ['mùa hè', 'mùa đông'],
  ['xem phim', 'chơi game'],
  ['bánh mì', 'xôi'],
  ['nhắn tin', 'gọi điện'],
  ['Liên Quân', 'Free Fire'],
  ['cơm nhà', 'cơm quán'],
  ['tóc dài', 'tóc ngắn'],
  ['đi xe máy', 'đi ô tô'],
  ['học sáng', 'học tối'],
  ['bàn đầu', 'bàn cuối'],
  ['kem', 'chè'],
  ['nhạc ballad', 'nhạc remix'],
  ['gà rán', 'pizza'],
  ['ở nhà', 'đi chơi'],
  ['toán', 'văn'],
  ['bánh chưng', 'bánh tét'],
  ['người yêu', 'tiền'],
  ['sầu riêng', 'mít'],
  ['trà đá', 'trà chanh'],
  ['Hà Nội', 'Sài Gòn'],
  ['iPhone', 'Android'],
  ['xem TikTok', 'xem YouTube'],
];


  const BANNED_TOKENS = new Set([
    'lồn', 'lìn', 'cặc', 'buồi', 'đéo', 'địt', 'đụ', 'đĩ', 'cứt', 'đm', 'đmm', 'đcm', 'đkm',
    'dm', 'dmm', 'dcm', 'dkm', 'vcl', 'vkl', 'vcc', 'clgt', 'loz', 'dit', 'ditme', 'dume', 'cmm',
    'fuck', 'fck', 'fuk', 'shit', 'bitch', 'dick', 'pussy', 'sex', 'sexy', 'porn', 'nude', 'xxx', 'cave',
    'giết', 'chém', 'casino', 'scam'
  ]);
  const BANNED_PHRASES = [
    'địt mẹ', 'đụ má', 'đù má', 'đéo mẹ', 'con đĩ', 'dit me', 'du ma',
    'ma túy', 'ma tuý', 'thuốc lắc', 'cần sa', 'cá độ', 'lô đề', 'cờ bạc', 'chuyển khoản', 'lừa đảo'
  ];

  function containsBanned(text) {
    if (!text) return false;
    const norm = String(text).normalize('NFC').toLowerCase().replace(/\s+/g, ' ');
    const tokens = norm.split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
    if (tokens.some((t) => BANNED_TOKENS.has(t))) return true;
    const joined = ' ' + tokens.join(' ') + ' ';
    return BANNED_PHRASES.some((p) => joined.includes(' ' + p + ' '));
  }

  function maskBanned(text) {
    if (!containsBanned(text)) return String(text || '');
    let out = String(text).replace(/[\p{L}\p{M}\p{N}]+/gu, (w) => (BANNED_TOKENS.has(w.normalize('NFC').toLowerCase()) ? '***' : w));
    for (const p of BANNED_PHRASES) {
      out = out.replace(new RegExp(p.replace(/ /g, '\\s+'), 'giu'), '***');
    }
    return out;
  }

  const DIGITS = { '0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn', '5': 'năm', '6': 'sáu', '7': 'bảy', '8': 'tám', '9': 'chín' };
  const NAME_STARTS = ['hoang', 'tuyet', 'thanh', 'trung', 'quang', 'minh', 'ngoc', 'phuc', 'xuan', 'quoc', 'viet', 'tien', 'tuan', 'hong', 'duy', 'van', 'kim', 'hai', 'nam'];

  function speakableName(nickname) {
    if (!nickname) return 'bạn';
    let clean = String(nickname)
      .normalize('NFKC')
      .replace(/[\u{FE00}-\u{FE0F}\u200d\u20e3]/gu, '')
      .replace(/[^\p{L}\p{M}\p{N}\s._-]/gu, ' ')
      .normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean || containsBanned(clean) || /^user\d{4,}$/i.test(clean)) return 'bạn';
    clean = clean
      .replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{L})(\d)/gu, '$1 $2')
      .replace(/(\d)(\p{L})/gu, '$1 $2')
      .replace(/[._-]+/g, ' ');
    const out = [];
    for (const w of clean.split(/\s+/).filter(Boolean)) {
      if (/^\d+$/.test(w)) {
        if (w.length <= 4) out.push(w.split('').map((d) => DIGITS[d]).join(' '));
        continue;
      }
      const start = /^[a-z]+$/.test(w) ? NAME_STARTS.find((p) => w.startsWith(p) && w.length - p.length >= 2) : undefined;
      if (start) out.push(start, w.slice(start.length));
      else out.push(w);
    }
    return out.slice(0, 5).join(' ').trim() || 'bạn';
  }

  window.LopData = {
    QUESTIONS,
    CATEGORIES,
    REWARDS,
    LINES,
    POLLS,
    PICK_TOPICS,
    containsBanned,
    maskBanned,
    speakableName
  };
})();
