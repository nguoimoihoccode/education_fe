import type {
  PaginatedQuizHistoryResponse,
  PaginatedQuizResponse,
  CreateQuizDto,
  Quiz,
  QuizHistoryItem,
  QuizSession,
  QuizStats,
  SubmitAnswerResult,
  UpdateQuizDto,
  WrongAnswer,
} from '@/types/quiz.types';

type OfflineQuiz = Quiz & {
  questions: NonNullable<Quiz['questions']>;
};

type SubmitPayload = {
  questionId: string;
  answer: string;
  timeSpent?: number;
};

type OfflineQuizStartConfig = {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount?: 10 | 20 | 30;
};

interface OfflineSessionState {
  session: QuizSession;
  wrongAnswers: WrongAnswer[];
  questions: OfflineQuiz['questions'];
}

interface Hsk1WordEntry {
  hanzi: string;
  pinyin: string;
  meaning: string;
  distractors: string[];
}

const nowIso = () => new Date().toISOString();

const HSK1_WORD_BANK: Hsk1WordEntry[] = [
  { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào', distractors: ['Tạm biệt', 'Cảm ơn', 'Xin lỗi'] },
  { hanzi: '谢谢', pinyin: 'xiè xie', meaning: 'Cảm ơn', distractors: ['Xin chào', 'Không có gì', 'Tạm biệt'] },
  { hanzi: '再见', pinyin: 'zài jiàn', meaning: 'Gặp lại', distractors: ['Xin chào', 'Chúc ngủ ngon', 'Cảm ơn'] },
  { hanzi: '我', pinyin: 'wǒ', meaning: 'Tôi', distractors: ['Bạn', 'Anh ấy', 'Chúng tôi'] },
  { hanzi: '你', pinyin: 'nǐ', meaning: 'Bạn', distractors: ['Tôi', 'Cô ấy', 'Họ'] },
  { hanzi: '他', pinyin: 'tā', meaning: 'Anh ấy', distractors: ['Cô ấy', 'Tôi', 'Chúng tôi'] },
  { hanzi: '她', pinyin: 'tā', meaning: 'Cô ấy', distractors: ['Anh ấy', 'Bạn', 'Tôi'] },
  { hanzi: '我们', pinyin: 'wǒ men', meaning: 'Chúng tôi', distractors: ['Tôi', 'Các bạn', 'Họ'] },
  { hanzi: '你们', pinyin: 'nǐ men', meaning: 'Các bạn', distractors: ['Chúng tôi', 'Họ', 'Tôi'] },
  { hanzi: '爸爸', pinyin: 'bà ba', meaning: 'Bố', distractors: ['Mẹ', 'Anh trai', 'Em gái'] },
  { hanzi: '妈妈', pinyin: 'mā ma', meaning: 'Mẹ', distractors: ['Bố', 'Con trai', 'Bạn'] },
  { hanzi: '老师', pinyin: 'lǎo shī', meaning: 'Giáo viên', distractors: ['Học sinh', 'Bác sĩ', 'Bạn học'] },
  { hanzi: '学生', pinyin: 'xué shēng', meaning: 'Học sinh', distractors: ['Giáo viên', 'Nhân viên', 'Bố'] },
  { hanzi: '学校', pinyin: 'xué xiào', meaning: 'Trường học', distractors: ['Nhà', 'Cửa hàng', 'Bệnh viện'] },
  { hanzi: '医院', pinyin: 'yī yuàn', meaning: 'Bệnh viện', distractors: ['Trường học', 'Siêu thị', 'Ngân hàng'] },
  { hanzi: '中国', pinyin: 'Zhōng guó', meaning: 'Trung Quốc', distractors: ['Mỹ', 'Nhật Bản', 'Hàn Quốc'] },
  { hanzi: '美国', pinyin: 'Měi guó', meaning: 'Mỹ', distractors: ['Trung Quốc', 'Anh', 'Pháp'] },
  { hanzi: '今天', pinyin: 'jīn tiān', meaning: 'Hôm nay', distractors: ['Hôm qua', 'Ngày mai', 'Buổi sáng'] },
  { hanzi: '明天', pinyin: 'míng tiān', meaning: 'Ngày mai', distractors: ['Hôm nay', 'Hôm qua', 'Buổi tối'] },
  { hanzi: '现在', pinyin: 'xiàn zài', meaning: 'Bây giờ', distractors: ['Sau này', 'Hôm nay', 'Đã từng'] },
  { hanzi: '看', pinyin: 'kàn', meaning: 'Nhìn/xem', distractors: ['Ăn', 'Ngủ', 'Nghe'] },
  { hanzi: '吃', pinyin: 'chī', meaning: 'Ăn', distractors: ['Uống', 'Đi', 'Ngồi'] },
  { hanzi: '喝', pinyin: 'hē', meaning: 'Uống', distractors: ['Ăn', 'Ngủ', 'Mua'] },
  { hanzi: '米饭', pinyin: 'mǐ fàn', meaning: 'Cơm', distractors: ['Mì', 'Nước', 'Táo'] },
  { hanzi: '苹果', pinyin: 'píng guǒ', meaning: 'Táo', distractors: ['Chuối', 'Cam', 'Nho'] },
  { hanzi: '茶', pinyin: 'chá', meaning: 'Trà', distractors: ['Cà phê', 'Sữa', 'Nước'] },
  { hanzi: '水', pinyin: 'shuǐ', meaning: 'Nước', distractors: ['Cơm', 'Táo', 'Bút'] },
  { hanzi: '几', pinyin: 'jǐ', meaning: 'Mấy/Bao nhiêu (ít)', distractors: ['Ở đâu', 'Ai', 'Như thế nào'] },
  { hanzi: '喜欢', pinyin: 'xǐ huan', meaning: 'Thích', distractors: ['Ghét', 'Biết', 'Nhớ'] },
  { hanzi: '在哪儿', pinyin: 'zài nǎr', meaning: 'Ở đâu', distractors: ['Khi nào', 'Bao nhiêu', 'Tại sao'] },
  { hanzi: '点', pinyin: 'diǎn', meaning: 'Giờ', distractors: ['Ngày', 'Tháng', 'Năm'] },
  { hanzi: '不', pinyin: 'bù', meaning: 'Không', distractors: ['Có', 'Rất', 'Cũng'] },
  { hanzi: '没', pinyin: 'méi', meaning: 'Chưa/Không có', distractors: ['Có', 'Rất', 'Đang'] },
  { hanzi: '汉语', pinyin: 'hàn yǔ', meaning: 'Tiếng Trung', distractors: ['Tiếng Anh', 'Tiếng Nhật', 'Tiếng Việt'] },
  { hanzi: '英语', pinyin: 'yīng yǔ', meaning: 'Tiếng Anh', distractors: ['Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn'] },
  { hanzi: '朋友', pinyin: 'péng you', meaning: 'Bạn bè', distractors: ['Gia đình', 'Giáo viên', 'Học sinh'] },
  { hanzi: '同学', pinyin: 'tóng xué', meaning: 'Bạn học', distractors: ['Giáo viên', 'Bố', 'Bác sĩ'] },
  { hanzi: '猫', pinyin: 'māo', meaning: 'Con mèo', distractors: ['Con chó', 'Con cá', 'Con chim'] },
  { hanzi: '狗', pinyin: 'gǒu', meaning: 'Con chó', distractors: ['Con mèo', 'Con cá', 'Con chim'] },
  { hanzi: '车', pinyin: 'chē', meaning: 'Xe', distractors: ['Nhà', 'Bàn', 'Sách'] },
  { hanzi: '书', pinyin: 'shū', meaning: 'Sách', distractors: ['Bút', 'Bàn', 'Ghế'] },
  { hanzi: '桌子', pinyin: 'zhuō zi', meaning: 'Cái bàn', distractors: ['Cái ghế', 'Cái cửa', 'Cái giường'] },
  { hanzi: '椅子', pinyin: 'yǐ zi', meaning: 'Cái ghế', distractors: ['Cái bàn', 'Cái cửa', 'Cái giường'] },
  { hanzi: '电脑', pinyin: 'diàn nǎo', meaning: 'Máy tính', distractors: ['Điện thoại', 'Tivi', 'Đồng hồ'] },
  { hanzi: '电视', pinyin: 'diàn shì', meaning: 'Tivi', distractors: ['Máy tính', 'Điện thoại', 'Tủ lạnh'] },
  { hanzi: '电话', pinyin: 'diàn huà', meaning: 'Điện thoại', distractors: ['Máy tính', 'Tivi', 'Cái bàn'] },
  { hanzi: '工作', pinyin: 'gōng zuò', meaning: 'Làm việc', distractors: ['Nghỉ ngơi', 'Ăn cơm', 'Ngủ'] },
  { hanzi: '学习', pinyin: 'xué xí', meaning: 'Học', distractors: ['Dạy', 'Chơi', 'Nghe'] },
  { hanzi: '写', pinyin: 'xiě', meaning: 'Viết', distractors: ['Đọc', 'Nghe', 'Nhìn'] },
  { hanzi: '读', pinyin: 'dú', meaning: 'Đọc', distractors: ['Viết', 'Nghe', 'Nói'] },
  { hanzi: '说', pinyin: 'shuō', meaning: 'Nói', distractors: ['Nghe', 'Đọc', 'Viết'] },
  { hanzi: '听', pinyin: 'tīng', meaning: 'Nghe', distractors: ['Nói', 'Viết', 'Xem'] },
  { hanzi: '开', pinyin: 'kāi', meaning: 'Mở', distractors: ['Đóng', 'Ăn', 'Uống'] },
  { hanzi: '关', pinyin: 'guān', meaning: 'Đóng/Tắt', distractors: ['Mở', 'Đi', 'Đến'] },
  { hanzi: '上', pinyin: 'shàng', meaning: 'Trên/Lên', distractors: ['Dưới', 'Trong', 'Ngoài'] },
  { hanzi: '下', pinyin: 'xià', meaning: 'Dưới/Xuống', distractors: ['Trên', 'Trong', 'Ngoài'] },
  { hanzi: '里', pinyin: 'lǐ', meaning: 'Trong', distractors: ['Ngoài', 'Trước', 'Sau'] },
  { hanzi: '家', pinyin: 'jiā', meaning: 'Nhà', distractors: ['Trường học', 'Cửa hàng', 'Bệnh viện'] },
  { hanzi: '商店', pinyin: 'shāng diàn', meaning: 'Cửa hàng', distractors: ['Nhà', 'Trường học', 'Bệnh viện'] },
  { hanzi: '北京', pinyin: 'Běi jīng', meaning: 'Bắc Kinh', distractors: ['Thượng Hải', 'Mỹ', 'Trung Quốc'] },
  { hanzi: '上海', pinyin: 'Shàng hǎi', meaning: 'Thượng Hải', distractors: ['Bắc Kinh', 'Mỹ', 'Trung Quốc'] },
  { hanzi: '飞机', pinyin: 'fēi jī', meaning: 'Máy bay', distractors: ['Xe lửa', 'Xe đạp', 'Xe buýt'] },
  { hanzi: '出租车', pinyin: 'chū zū chē', meaning: 'Taxi', distractors: ['Xe buýt', 'Tàu hỏa', 'Máy bay'] },
  { hanzi: '菜', pinyin: 'cài', meaning: 'Món ăn/Rau', distractors: ['Nước', 'Táo', 'Bánh'] },
  { hanzi: '茶馆', pinyin: 'chá guǎn', meaning: 'Quán trà', distractors: ['Trường học', 'Nhà hàng', 'Bệnh viện'] },
  { hanzi: '苹果汁', pinyin: 'píng guǒ zhī', meaning: 'Nước táo', distractors: ['Trà', 'Cà phê', 'Sữa'] },
  { hanzi: '天气', pinyin: 'tiān qì', meaning: 'Thời tiết', distractors: ['Thời gian', 'Ngày tháng', 'Nhiệt độ'] },
  { hanzi: '冷', pinyin: 'lěng', meaning: 'Lạnh', distractors: ['Nóng', 'Mát', 'Vui'] },
  { hanzi: '热', pinyin: 'rè', meaning: 'Nóng', distractors: ['Lạnh', 'Mát', 'Buồn'] },
  { hanzi: '高兴', pinyin: 'gāo xìng', meaning: 'Vui', distractors: ['Buồn', 'Mệt', 'Đói'] },
  { hanzi: '今天晚上', pinyin: 'jīn tiān wǎn shang', meaning: 'Tối nay', distractors: ['Sáng nay', 'Ngày mai', 'Hôm qua tối'] },
  { hanzi: '早上', pinyin: 'zǎo shang', meaning: 'Buổi sáng', distractors: ['Buổi trưa', 'Buổi tối', 'Ngày mai'] },
  { hanzi: '下午', pinyin: 'xià wǔ', meaning: 'Buổi chiều', distractors: ['Buổi sáng', 'Buổi tối', 'Ngày mai'] },
  { hanzi: '晚上', pinyin: 'wǎn shang', meaning: 'Buổi tối', distractors: ['Buổi sáng', 'Buổi chiều', 'Hôm nay'] },
  { hanzi: '月', pinyin: 'yuè', meaning: 'Tháng', distractors: ['Ngày', 'Năm', 'Tuần'] },
  { hanzi: '号', pinyin: 'hào', meaning: 'Ngày (trong tháng)', distractors: ['Tháng', 'Năm', 'Giờ'] },
  { hanzi: '岁', pinyin: 'suì', meaning: 'Tuổi', distractors: ['Ngày', 'Giờ', 'Tháng'] },
  { hanzi: '钱', pinyin: 'qián', meaning: 'Tiền', distractors: ['Sách', 'Nước', 'Bàn'] },
  { hanzi: '多少', pinyin: 'duō shao', meaning: 'Bao nhiêu', distractors: ['Ở đâu', 'Ai', 'Khi nào'] },
  { hanzi: '这', pinyin: 'zhè', meaning: 'Đây/Cái này', distractors: ['Kia', 'Ở đâu', 'Ai'] },
  { hanzi: '那', pinyin: 'nà', meaning: 'Kia/Cái kia', distractors: ['Đây', 'Ở đâu', 'Khi nào'] },
  { hanzi: '请', pinyin: 'qǐng', meaning: 'Mời/Xin', distractors: ['Cảm ơn', 'Xin lỗi', 'Thích'] },
  { hanzi: '问', pinyin: 'wèn', meaning: 'Hỏi', distractors: ['Trả lời', 'Nói', 'Nghe'] },
  { hanzi: '回', pinyin: 'huí', meaning: 'Quay lại/Trở về', distractors: ['Đi', 'Ở', 'Đến'] },
  { hanzi: '来', pinyin: 'lái', meaning: 'Đến', distractors: ['Đi', 'Trở về', 'Ngồi'] },
  { hanzi: '去', pinyin: 'qù', meaning: 'Đi', distractors: ['Đến', 'Ở', 'Ngồi'] },
  { hanzi: '坐', pinyin: 'zuò', meaning: 'Ngồi', distractors: ['Đứng', 'Đi', 'Đọc'] },
  { hanzi: '站', pinyin: 'zhàn', meaning: 'Đứng', distractors: ['Ngồi', 'Đi', 'Ngủ'] },
  { hanzi: '前面', pinyin: 'qián miàn', meaning: 'Phía trước', distractors: ['Phía sau', 'Bên trong', 'Bên ngoài'] },
  { hanzi: '后面', pinyin: 'hòu miàn', meaning: 'Phía sau', distractors: ['Phía trước', 'Bên trong', 'Bên ngoài'] },
  { hanzi: '左边', pinyin: 'zuǒ biān', meaning: 'Bên trái', distractors: ['Bên phải', 'Phía trước', 'Phía sau'] },
  { hanzi: '右边', pinyin: 'yòu biān', meaning: 'Bên phải', distractors: ['Bên trái', 'Phía trước', 'Phía sau'] },
  { hanzi: '北', pinyin: 'běi', meaning: 'Phía bắc', distractors: ['Phía nam', 'Phía đông', 'Phía tây'] },
  { hanzi: '南', pinyin: 'nán', meaning: 'Phía nam', distractors: ['Phía bắc', 'Phía đông', 'Phía tây'] },
  { hanzi: '东', pinyin: 'dōng', meaning: 'Phía đông', distractors: ['Phía tây', 'Phía nam', 'Phía bắc'] },
  { hanzi: '西', pinyin: 'xī', meaning: 'Phía tây', distractors: ['Phía đông', 'Phía nam', 'Phía bắc'] },
  { hanzi: '儿子', pinyin: 'ér zi', meaning: 'Con trai', distractors: ['Con gái', 'Bố', 'Mẹ'] },
  { hanzi: '女儿', pinyin: 'nǚ ér', meaning: 'Con gái', distractors: ['Con trai', 'Mẹ', 'Em gái'] },
  { hanzi: '医生', pinyin: 'yī shēng', meaning: 'Bác sĩ', distractors: ['Giáo viên', 'Học sinh', 'Bạn học'] },
  { hanzi: '先生', pinyin: 'xiān sheng', meaning: 'Ông/Anh', distractors: ['Cô/Bà', 'Học sinh', 'Bác sĩ'] },
  { hanzi: '小姐', pinyin: 'xiǎo jiě', meaning: 'Cô/Chị', distractors: ['Ông', 'Bố', 'Mẹ'] },
  { hanzi: '火车', pinyin: 'huǒ chē', meaning: 'Tàu hỏa', distractors: ['Máy bay', 'Taxi', 'Xe đạp'] },
  { hanzi: '自行车', pinyin: 'zì xíng chē', meaning: 'Xe đạp', distractors: ['Xe buýt', 'Máy bay', 'Tàu hỏa'] },
  { hanzi: '老师好', pinyin: 'lǎo shī hǎo', meaning: 'Chào thầy/cô', distractors: ['Tạm biệt thầy/cô', 'Cảm ơn thầy/cô', 'Xin lỗi thầy/cô'] },
  { hanzi: '没关系', pinyin: 'méi guān xi', meaning: 'Không sao/Không có gì', distractors: ['Xin lỗi', 'Tạm biệt', 'Cảm ơn'] },
  { hanzi: '请问', pinyin: 'qǐng wèn', meaning: 'Xin hỏi', distractors: ['Xin chào', 'Tạm biệt', 'Cảm ơn'] },
  { hanzi: '对不起', pinyin: 'duì bu qǐ', meaning: 'Xin lỗi', distractors: ['Cảm ơn', 'Không sao', 'Xin chào'] },
  { hanzi: '上午', pinyin: 'shàng wǔ', meaning: 'Buổi sáng (trước trưa)', distractors: ['Buổi chiều', 'Buổi tối', 'Ngày mai'] },
  { hanzi: '中午', pinyin: 'zhōng wǔ', meaning: 'Buổi trưa', distractors: ['Buổi sáng', 'Buổi tối', 'Ngày mai'] },
  { hanzi: '明年', pinyin: 'míng nián', meaning: 'Năm sau', distractors: ['Năm nay', 'Năm ngoái', 'Ngày mai'] },
  { hanzi: '去年', pinyin: 'qù nián', meaning: 'Năm ngoái', distractors: ['Năm nay', 'Năm sau', 'Hôm qua'] },
  { hanzi: '星期一', pinyin: 'xīng qī yī', meaning: 'Thứ hai', distractors: ['Thứ ba', 'Chủ nhật', 'Thứ sáu'] },
  { hanzi: '星期天', pinyin: 'xīng qī tiān', meaning: 'Chủ nhật', distractors: ['Thứ hai', 'Thứ ba', 'Thứ sáu'] },
  { hanzi: '生日', pinyin: 'shēng rì', meaning: 'Sinh nhật', distractors: ['Ngày mai', 'Kỳ nghỉ', 'Buổi tối'] },
  { hanzi: '名字', pinyin: 'míng zi', meaning: 'Tên', distractors: ['Tuổi', 'Quốc gia', 'Nghề nghiệp'] },
  { hanzi: '国', pinyin: 'guó', meaning: 'Quốc gia', distractors: ['Tên', 'Tuổi', 'Giờ'] },
  { hanzi: '老师们', pinyin: 'lǎo shī men', meaning: 'Các giáo viên', distractors: ['Một giáo viên', 'Các học sinh', 'Các bạn học'] },
  { hanzi: '同事', pinyin: 'tóng shì', meaning: 'Đồng nghiệp', distractors: ['Bạn học', 'Bạn bè', 'Giáo viên'] },
  { hanzi: '饭店', pinyin: 'fàn diàn', meaning: 'Nhà hàng/Khách sạn', distractors: ['Trường học', 'Bệnh viện', 'Nhà'] },
  { hanzi: '杯子', pinyin: 'bēi zi', meaning: 'Cái cốc', distractors: ['Cái bàn', 'Cái ghế', 'Cái bút'] },
  { hanzi: '本', pinyin: 'běn', meaning: 'Quyển/cuốn (lượng từ)', distractors: ['Cái (đồ vật)', 'Người', 'Ly/cốc'] },
  { hanzi: '个', pinyin: 'gè', meaning: 'Cái/đơn vị chung', distractors: ['Quyển', 'Tờ', 'Người lớn'] },
  { hanzi: '些', pinyin: 'xiē', meaning: 'Một ít/một vài', distractors: ['Rất nhiều', 'Tất cả', 'Không có'] },
  { hanzi: '零', pinyin: 'líng', meaning: 'Số không', distractors: ['Một', 'Hai', 'Ba'] },
  { hanzi: '十', pinyin: 'shí', meaning: 'Mười', distractors: ['Một', 'Hai', 'Trăm'] },
  { hanzi: '百', pinyin: 'bǎi', meaning: 'Trăm', distractors: ['Mười', 'Một nghìn', 'Một'] },
  { hanzi: '男', pinyin: 'nán', meaning: 'Nam', distractors: ['Nữ', 'Con trai', 'Con gái'] },
  { hanzi: '女', pinyin: 'nǚ', meaning: 'Nữ', distractors: ['Nam', 'Con trai', 'Bố'] },
  { hanzi: '漂亮', pinyin: 'piào liang', meaning: 'Đẹp', distractors: ['Xấu', 'Cao', 'Thấp'] },
  { hanzi: '大', pinyin: 'dà', meaning: 'To/Lớn', distractors: ['Nhỏ', 'Cao', 'Ngắn'] },
  { hanzi: '小', pinyin: 'xiǎo', meaning: 'Nhỏ', distractors: ['To', 'Cao', 'Dài'] },
  { hanzi: '多', pinyin: 'duō', meaning: 'Nhiều', distractors: ['Ít', 'To', 'Nhỏ'] },
  { hanzi: '少', pinyin: 'shǎo', meaning: 'Ít', distractors: ['Nhiều', 'To', 'Đủ'] },
];

const HSK2_WORD_BANK: Hsk1WordEntry[] = [
  { hanzi: '帮助', pinyin: 'bāng zhù', meaning: 'Giúp đỡ', distractors: ['Quên', 'Nghỉ ngơi', 'Bắt đầu'] },
  { hanzi: '介绍', pinyin: 'jiè shào', meaning: 'Giới thiệu', distractors: ['Giải thích', 'Nhắc lại', 'Hỏi'] },
  { hanzi: '希望', pinyin: 'xī wàng', meaning: 'Hy vọng', distractors: ['Lo lắng', 'Quên', 'Bán'] },
  { hanzi: '准备', pinyin: 'zhǔn bèi', meaning: 'Chuẩn bị', distractors: ['Kết thúc', 'Đứng dậy', 'Mua'] },
  { hanzi: '考试', pinyin: 'kǎo shì', meaning: 'Kỳ thi', distractors: ['Bài tập', 'Công việc', 'Cuộc họp'] },
  { hanzi: '问题', pinyin: 'wèn tí', meaning: 'Vấn đề/Câu hỏi', distractors: ['Bài học', 'Thời tiết', 'Bạn bè'] },
  { hanzi: '所以', pinyin: 'suǒ yǐ', meaning: 'Vì vậy', distractors: ['Nhưng', 'Nếu', 'Trước đây'] },
  { hanzi: '因为', pinyin: 'yīn wèi', meaning: 'Bởi vì', distractors: ['Vì vậy', 'Nếu', 'Mặc dù'] },
  { hanzi: '虽然', pinyin: 'suī rán', meaning: 'Mặc dù', distractors: ['Bởi vì', 'Vì vậy', 'Nếu'] },
  { hanzi: '已经', pinyin: 'yǐ jīng', meaning: 'Đã rồi', distractors: ['Sắp', 'Đang', 'Chưa'] },
  { hanzi: '一起', pinyin: 'yì qǐ', meaning: 'Cùng nhau', distractors: ['Một mình', 'Lập tức', 'Từ từ'] },
  { hanzi: '开始', pinyin: 'kāi shǐ', meaning: 'Bắt đầu', distractors: ['Kết thúc', 'Tạm dừng', 'Đi qua'] },
  { hanzi: '结束', pinyin: 'jié shù', meaning: 'Kết thúc', distractors: ['Bắt đầu', 'Tiếp tục', 'Ở lại'] },
  { hanzi: '运动', pinyin: 'yùn dòng', meaning: 'Vận động/Thể thao', distractors: ['Âm nhạc', 'Bài tập', 'Du lịch'] },
  { hanzi: '旅游', pinyin: 'lǚ yóu', meaning: 'Du lịch', distractors: ['Làm việc', 'Nghỉ ngơi', 'Học tập'] },
  { hanzi: '附近', pinyin: 'fù jìn', meaning: 'Gần đây/Ở gần', distractors: ['Xa', 'Ở giữa', 'Bên trong'] },
  { hanzi: '担心', pinyin: 'dān xīn', meaning: 'Lo lắng', distractors: ['Hy vọng', 'Vui vẻ', 'Giúp đỡ'] },
  { hanzi: '明白', pinyin: 'míng bai', meaning: 'Hiểu rõ', distractors: ['Quên', 'Lo lắng', 'Giới thiệu'] },
  { hanzi: '干净', pinyin: 'gān jìng', meaning: 'Sạch sẽ', distractors: ['Bẩn', 'Ồn ào', 'Im lặng'] },
  { hanzi: '安静', pinyin: 'ān jìng', meaning: 'Yên tĩnh', distractors: ['Ồn ào', 'Nóng', 'Sạch sẽ'] },
  { hanzi: '重要', pinyin: 'zhòng yào', meaning: 'Quan trọng', distractors: ['Dễ dàng', 'Bình thường', 'Nhỏ'] },
  { hanzi: '简单', pinyin: 'jiǎn dān', meaning: 'Đơn giản', distractors: ['Khó', 'Quan trọng', 'Đắt'] },
  { hanzi: '觉得', pinyin: 'jué de', meaning: 'Cảm thấy/Cho rằng', distractors: ['Nhìn thấy', 'Giúp đỡ', 'Học'] },
  { hanzi: '文化', pinyin: 'wén huà', meaning: 'Văn hóa', distractors: ['Thể thao', 'Công việc', 'Cửa hàng'] },
  { hanzi: '上班', pinyin: 'shàng bān', meaning: 'Đi làm', distractors: ['Tan làm', 'Đi học', 'Đi chơi'] },
  { hanzi: '下班', pinyin: 'xià bān', meaning: 'Tan làm', distractors: ['Đi làm', 'Bắt đầu', 'Kết thúc giờ học'] },
  { hanzi: '起床', pinyin: 'qǐ chuáng', meaning: 'Thức dậy', distractors: ['Đi ngủ', 'Ngồi xuống', 'Đứng dậy'] },
  { hanzi: '迟到', pinyin: 'chí dào', meaning: 'Đi muộn', distractors: ['Đến sớm', 'Tan làm', 'Kết thúc'] },
  { hanzi: '欢迎', pinyin: 'huān yíng', meaning: 'Hoan nghênh', distractors: ['Tạm biệt', 'Xin lỗi', 'Lo lắng'] },
  { hanzi: '回答', pinyin: 'huí dá', meaning: 'Trả lời', distractors: ['Hỏi', 'Giới thiệu', 'Nhắc lại'] },
  { hanzi: '借', pinyin: 'jiè', meaning: 'Mượn', distractors: ['Trả', 'Bán', 'Mua'] },
  { hanzi: '还', pinyin: 'huán', meaning: 'Trả lại', distractors: ['Mượn', 'Mua', 'Dùng'] },
  { hanzi: '比较', pinyin: 'bǐ jiào', meaning: 'Khá/Tương đối', distractors: ['Rất', 'Cực kỳ', 'Một chút'] },
  { hanzi: '容易', pinyin: 'róng yì', meaning: 'Dễ', distractors: ['Khó', 'Chậm', 'Quan trọng'] },
  { hanzi: '决定', pinyin: 'jué dìng', meaning: 'Quyết định', distractors: ['Quên', 'Chuẩn bị', 'Nghỉ'] },
  { hanzi: '开始吧', pinyin: 'kāi shǐ ba', meaning: 'Hãy bắt đầu', distractors: ['Hãy dừng lại', 'Hãy ngủ đi', 'Hãy về nhà'] },
  { hanzi: '服务员', pinyin: 'fú wù yuán', meaning: 'Nhân viên phục vụ', distractors: ['Khách hàng', 'Bác sĩ', 'Giáo viên'] },
  { hanzi: '菜单', pinyin: 'cài dān', meaning: 'Thực đơn', distractors: ['Hóa đơn', 'Bức thư', 'Bài kiểm tra'] },
  { hanzi: '办法', pinyin: 'bàn fǎ', meaning: 'Cách / biện pháp', distractors: ['Vấn đề', 'Bắt đầu', 'Kỳ thi'] },
];

const HSK3_WORD_BANK: Hsk1WordEntry[] = [
  { hanzi: '经验', pinyin: 'jīng yàn', meaning: 'Kinh nghiệm', distractors: ['Mục tiêu', 'Lời khuyên', 'Kế hoạch'] },
  { hanzi: '安排', pinyin: 'ān pái', meaning: 'Sắp xếp/安排', distractors: ['Quên', 'Mượn', 'Trả lời'] },
  { hanzi: '建议', pinyin: 'jiàn yì', meaning: 'Gợi ý/Đề nghị', distractors: ['Vấn đề', 'Lo lắng', 'Quyết định'] },
  { hanzi: '提高', pinyin: 'tí gāo', meaning: 'Nâng cao/Cải thiện', distractors: ['Bắt đầu', 'Mượn', 'Kết thúc'] },
  { hanzi: '计划', pinyin: 'jì huà', meaning: 'Kế hoạch', distractors: ['Bài học', 'Bức thư', 'Bữa ăn'] },
  { hanzi: '情况', pinyin: 'qíng kuàng', meaning: 'Tình hình', distractors: ['Thời gian', 'Màu sắc', 'Quốc gia'] },
  { hanzi: '准时', pinyin: 'zhǔn shí', meaning: 'Đúng giờ', distractors: ['Đi muộn', 'Đã kết thúc', 'Ở gần'] },
  { hanzi: '抱歉', pinyin: 'bào qiàn', meaning: 'Xin lỗi', distractors: ['Cảm ơn', 'Hoan nghênh', 'Bắt đầu'] },
  { hanzi: '理解', pinyin: 'lǐ jiě', meaning: 'Hiểu', distractors: ['Quên', 'Lo lắng', 'Mua'] },
  { hanzi: '联系', pinyin: 'lián xì', meaning: 'Liên lạc', distractors: ['Chuẩn bị', 'Mượn', 'Nghỉ ngơi'] },
  { hanzi: '选择', pinyin: 'xuǎn zé', meaning: 'Lựa chọn', distractors: ['Câu trả lời', 'Bài tập', 'Giới thiệu'] },
  { hanzi: '机会', pinyin: 'jī huì', meaning: 'Cơ hội', distractors: ['Bài kiểm tra', 'Kỳ nghỉ', 'Buổi tối'] },
  { hanzi: '目标', pinyin: 'mù biāo', meaning: 'Mục tiêu', distractors: ['Địa chỉ', 'Món ăn', 'Tiền'] },
  { hanzi: '负责', pinyin: 'fù zé', meaning: 'Phụ trách/Chịu trách nhiệm', distractors: ['Thư giãn', 'Mượn', 'Đi muộn'] },
  { hanzi: '消息', pinyin: 'xiāo xi', meaning: 'Tin tức/Tin nhắn', distractors: ['Bức tranh', 'Bài kiểm tra', 'Màu sắc'] },
  { hanzi: '成功', pinyin: 'chéng gōng', meaning: 'Thành công', distractors: ['Thất bại', 'Bắt đầu', 'Kết thúc'] },
  { hanzi: '失败', pinyin: 'shī bài', meaning: 'Thất bại', distractors: ['Thành công', 'Đúng giờ', 'Đơn giản'] },
  { hanzi: '参加', pinyin: 'cān jiā', meaning: 'Tham gia', distractors: ['Rời đi', 'Chờ đợi', 'Mượn'] },
  { hanzi: '通知', pinyin: 'tōng zhī', meaning: 'Thông báo', distractors: ['Giải thích', 'Thực đơn', 'Hoan nghênh'] },
  { hanzi: '解决', pinyin: 'jiě jué', meaning: 'Giải quyết', distractors: ['Giữ lại', 'Nghỉ ngơi', 'Liên lạc'] },
  { hanzi: '保持', pinyin: 'bǎo chí', meaning: 'Giữ/duy trì', distractors: ['Quên', 'Mua', 'Bán'] },
  { hanzi: '改变', pinyin: 'gǎi biàn', meaning: 'Thay đổi', distractors: ['Bắt đầu', 'Đứng yên', 'Tạm dừng'] },
  { hanzi: '习惯', pinyin: 'xí guàn', meaning: 'Thói quen', distractors: ['Kế hoạch', 'Kinh nghiệm', 'Đề nghị'] },
  { hanzi: '讨论', pinyin: 'tǎo lùn', meaning: 'Thảo luận', distractors: ['Mua bán', 'Đi ngủ', 'Mượn trả'] },
  { hanzi: '比较好', pinyin: 'bǐ jiào hǎo', meaning: 'Khá tốt', distractors: ['Rất xấu', 'Hoàn toàn sai', 'Không hiểu'] },
  { hanzi: '着急', pinyin: 'zháo jí', meaning: 'Sốt ruột/Lo lắng', distractors: ['Bình tĩnh', 'Vui vẻ', 'Im lặng'] },
  { hanzi: '适合', pinyin: 'shì hé', meaning: 'Phù hợp', distractors: ['Không thích hợp', 'Không hiểu', 'Đi muộn'] },
  { hanzi: '接受', pinyin: 'jiē shòu', meaning: 'Chấp nhận/Nhận', distractors: ['Từ chối', 'Bỏ quên', 'Trả lại'] },
  { hanzi: '拒绝', pinyin: 'jù jué', meaning: 'Từ chối', distractors: ['Chấp nhận', 'Chuẩn bị', 'Bắt đầu'] },
  { hanzi: '提醒', pinyin: 'tí xǐng', meaning: 'Nhắc nhở', distractors: ['Quên', 'Mua', 'Kết thúc'] },
  { hanzi: '解释', pinyin: 'jiě shì', meaning: 'Giải thích', distractors: ['Đặt câu hỏi', 'Rời đi', 'Đợi'] },
  { hanzi: '认真', pinyin: 'rèn zhēn', meaning: 'Nghiêm túc', distractors: ['Cẩu thả', 'Đơn giản', 'Thất bại'] },
  { hanzi: '耐心', pinyin: 'nài xīn', meaning: 'Kiên nhẫn', distractors: ['Lo lắng', 'Vội vàng', 'Mệt mỏi'] },
  { hanzi: '熟悉', pinyin: 'shú xī', meaning: 'Quen thuộc', distractors: ['Lạ lẫm', 'Khó khăn', 'Đắt đỏ'] },
  { hanzi: '陌生', pinyin: 'mò shēng', meaning: 'Xa lạ', distractors: ['Quen thuộc', 'Đơn giản', 'Rẻ'] },
  { hanzi: '决定吧', pinyin: 'jué dìng ba', meaning: 'Hãy quyết định đi', distractors: ['Hãy ngủ đi', 'Hãy quên đi', 'Hãy mua đi'] },
  { hanzi: '地址', pinyin: 'dì zhǐ', meaning: 'Địa chỉ', distractors: ['Tên', 'Màu sắc', 'Quốc gia'] },
  { hanzi: '号码', pinyin: 'hào mǎ', meaning: 'Số/ID', distractors: ['Tên', 'Ngày', 'Giờ'] },
  { hanzi: '快递', pinyin: 'kuài dì', meaning: 'Chuyển phát nhanh', distractors: ['Bức thư', 'Nhà hàng', 'Kỳ thi'] },
  { hanzi: '银行', pinyin: 'yín háng', meaning: 'Ngân hàng', distractors: ['Bệnh viện', 'Thư viện', 'Nhà hàng'] },
  { hanzi: '效率', pinyin: 'xiào lǜ', meaning: 'Hiệu suất', distractors: ['Kế hoạch', 'Thời gian', 'Âm thanh'] },
  { hanzi: '态度', pinyin: 'tài dù', meaning: 'Thái độ', distractors: ['Thói quen', 'Màu sắc', 'Quốc gia'] },
  { hanzi: '方法', pinyin: 'fāng fǎ', meaning: 'Phương pháp', distractors: ['Vấn đề', 'Bữa ăn', 'Màu sắc'] },
  { hanzi: '细心', pinyin: 'xì xīn', meaning: 'Cẩn thận / tỉ mỉ', distractors: ['Vội vàng', 'Ồn ào', 'Đơn giản'] },
  { hanzi: '及时', pinyin: 'jí shí', meaning: 'Kịp thời', distractors: ['Muộn màng', 'Vô ích', 'Ồn ào'] },
  { hanzi: '适应', pinyin: 'shì yìng', meaning: 'Thích nghi', distractors: ['Từ chối', 'Bắt đầu', 'Giải thích'] },
  { hanzi: '复杂', pinyin: 'fù zá', meaning: 'Phức tạp', distractors: ['Đơn giản', 'Rẻ', 'Nhỏ'] },
  { hanzi: '熟练', pinyin: 'shú liàn', meaning: 'Thành thạo', distractors: ['Lạ lẫm', 'Khó khăn', 'Chậm chạp'] },
  { hanzi: '沟通', pinyin: 'gōu tōng', meaning: 'Giao tiếp', distractors: ['Nghỉ ngơi', 'Mượn', 'Bắt đầu'] },
  { hanzi: '提醒一下', pinyin: 'tí xǐng yí xià', meaning: 'Nhắc một chút', distractors: ['Quên mất', 'Đi ngủ', 'Từ chối'] },
  { hanzi: '确认', pinyin: 'què rèn', meaning: 'Xác nhận', distractors: ['Nghi ngờ', 'Từ chối', 'Bỏ qua'] },
  { hanzi: '通知大家', pinyin: 'tōng zhī dà jiā', meaning: 'Thông báo cho mọi người', distractors: ['Giấu mọi người', 'Quên mọi người', 'Tránh mọi người'] },
  { hanzi: '按照计划', pinyin: 'àn zhào jì huà', meaning: 'Theo kế hoạch', distractors: ['Không theo kế hoạch', 'Sau giờ làm', 'Một cách ngẫu nhiên'] },
  { hanzi: '来得及', pinyin: 'lái de jí', meaning: 'Kịp', distractors: ['Không kịp', 'Rất xa', 'Đã nghỉ'] },
  { hanzi: '来不及', pinyin: 'lái bu jí', meaning: 'Không kịp', distractors: ['Kịp', 'Rất gần', 'Hoàn toàn đúng'] },
  { hanzi: '优点', pinyin: 'yōu diǎn', meaning: 'Ưu điểm', distractors: ['Nhược điểm', 'Màu sắc', 'Quốc gia'] },
  { hanzi: '缺点', pinyin: 'quē diǎn', meaning: 'Nhược điểm', distractors: ['Ưu điểm', 'Thói quen', 'Kinh nghiệm'] },
  { hanzi: '合理', pinyin: 'hé lǐ', meaning: 'Hợp lý', distractors: ['Vô lý', 'Quá sớm', 'Quá muộn'] },
  { hanzi: '稳定', pinyin: 'wěn dìng', meaning: 'Ổn định', distractors: ['Thay đổi liên tục', 'Mất bình tĩnh', 'Lạ lẫm'] },
  { hanzi: '安排好', pinyin: 'ān pái hǎo', meaning: 'Sắp xếp xong', distractors: ['Chưa sắp xếp', 'Mới bắt đầu', 'Đã quên mất'] },
  { hanzi: '负责地', pinyin: 'fù zé de', meaning: 'Một cách có trách nhiệm', distractors: ['Một cách qua loa', 'Một cách chậm chạp', 'Một cách ngẫu nhiên'] },
  { hanzi: '认真地', pinyin: 'rèn zhēn de', meaning: 'Một cách nghiêm túc', distractors: ['Một cách qua loa', 'Một cách tùy tiện', 'Một cách vội vàng'] },
  { hanzi: '顺利', pinyin: 'shùn lì', meaning: 'Thuận lợi', distractors: ['Khó khăn', 'Bất tiện', 'Muộn màng'] },
  { hanzi: '及时地', pinyin: 'jí shí de', meaning: 'Một cách kịp thời', distractors: ['Một cách chậm trễ', 'Một cách im lặng', 'Một cách miễn cưỡng'] },
  { hanzi: '解释清楚', pinyin: 'jiě shì qīng chu', meaning: 'Giải thích rõ ràng', distractors: ['Quên mất', 'Nói rất nhanh', 'Im lặng luôn'] },
  { hanzi: '完全', pinyin: 'wán quán', meaning: 'Hoàn toàn', distractors: ['Một chút', 'Có lẽ', 'Hiếm khi'] },
  { hanzi: '符合', pinyin: 'fú hé', meaning: 'Phù hợp / đáp ứng', distractors: ['Từ chối', 'Quên', 'Rời đi'] },
  { hanzi: '压力', pinyin: 'yā lì', meaning: 'Áp lực', distractors: ['Cơ hội', 'Niềm vui', 'Thói quen'] },
  { hanzi: '效果', pinyin: 'xiào guǒ', meaning: 'Hiệu quả', distractors: ['Âm thanh', 'Tốc độ', 'Mùi vị'] },
  { hanzi: '证明', pinyin: 'zhèng míng', meaning: 'Chứng minh', distractors: ['Dự đoán', 'Bán', 'Dừng lại'] },
  { hanzi: '讨论一下', pinyin: 'tǎo lùn yí xià', meaning: 'Thảo luận một chút', distractors: ['Nghỉ ngơi một chút', 'Đi ngủ một chút', 'Mua một chút'] },
  { hanzi: '尽快', pinyin: 'jǐn kuài', meaning: 'Càng sớm càng tốt', distractors: ['Rất chậm', 'Không bao giờ', 'Đôi khi'] },
  { hanzi: '适应新环境', pinyin: 'shì yìng xīn huán jìng', meaning: 'Thích nghi môi trường mới', distractors: ['Rời khỏi môi trường cũ', 'Quên địa chỉ mới', 'Từ chối làm việc'] },
  { hanzi: '越来越忙', pinyin: 'yuè lái yuè máng', meaning: 'Ngày càng bận hơn', distractors: ['Ngày càng rảnh hơn', 'Đã xong việc rồi', 'Không đi làm nữa'] },
  { hanzi: '好不容易', pinyin: 'hǎo bù róng yì', meaning: 'Khó khăn lắm mới', distractors: ['Rất dễ dàng', 'Lúc nào cũng', 'Hoàn toàn không'] },
  { hanzi: '打算', pinyin: 'dǎ suàn', meaning: 'Dự định', distractors: ['Quên mất', 'Kết thúc', 'Đã quen'] },
  { hanzi: '申请', pinyin: 'shēn qǐng', meaning: 'Nộp đơn/Đăng ký', distractors: ['Hủy bỏ', 'Bán đi', 'Rời khỏi'] },
  { hanzi: '合格', pinyin: 'hé gé', meaning: 'Đạt chuẩn/Đạt yêu cầu', distractors: ['Không đạt', 'Không rõ', 'Không tiện'] },
  { hanzi: '浪费', pinyin: 'làng fèi', meaning: 'Lãng phí', distractors: ['Tiết kiệm', 'Sắp xếp', 'Mượn'] },
  { hanzi: '坚持', pinyin: 'jiān chí', meaning: 'Kiên trì', distractors: ['Bỏ cuộc', 'Quên mất', 'Đứng yên'] },
  { hanzi: '座位', pinyin: 'zuò wèi', meaning: 'Chỗ ngồi', distractors: ['Bàn ăn', 'Cửa ra vào', 'Nhà bếp'] },
  { hanzi: '钥匙', pinyin: 'yào shi', meaning: 'Chìa khóa', distractors: ['Ví tiền', 'Điện thoại', 'Bản đồ'] },
  { hanzi: '地图', pinyin: 'dì tú', meaning: 'Bản đồ', distractors: ['Chìa khóa', 'Tin nhắn', 'Hóa đơn'] },
  { hanzi: '约会', pinyin: 'yuē huì', meaning: 'Cuộc hẹn', distractors: ['Bài kiểm tra', 'Kế hoạch', 'Bài học'] },
  { hanzi: '迟早', pinyin: 'chí zǎo', meaning: 'Sớm hay muộn', distractors: ['Đã xong', 'Tối nay', 'Hôm qua'] },
  { hanzi: '放心', pinyin: 'fàng xīn', meaning: 'Yên tâm', distractors: ['Lo lắng', 'Mệt mỏi', 'Bực mình'] },
  { hanzi: '约', pinyin: 'yuē', meaning: 'Hẹn / khoảng', distractors: ['Học', 'Đi', 'Ngủ'] },
  { hanzi: '着', pinyin: 'zhe', meaning: 'Đang / trạng thái kéo dài', distractors: ['Đã', 'Sẽ', 'Không'] },
  { hanzi: '检查', pinyin: 'jiǎn chá', meaning: 'Kiểm tra', distractors: ['Giải thích', 'Giới thiệu', 'Thảo luận'] },
  { hanzi: '习惯了', pinyin: 'xí guàn le', meaning: 'Đã quen rồi', distractors: ['Chưa quen', 'Đang hỏi', 'Muốn ngủ'] },
  { hanzi: '顺便', pinyin: 'shùn biàn', meaning: 'Tiện thể', distractors: ['Đột nhiên', 'Rất nhanh', 'Quá muộn'] },
  { hanzi: '终于', pinyin: 'zhōng yú', meaning: 'Cuối cùng', distractors: ['Lập tức', 'Vẫn còn', 'Hiếm khi'] },
  { hanzi: '热情', pinyin: 'rè qíng', meaning: 'Nhiệt tình', distractors: ['Lạnh lùng', 'Yên tĩnh', 'Khó chịu'] },
  { hanzi: '诚实', pinyin: 'chéng shí', meaning: 'Thật thà', distractors: ['Lười biếng', 'Ồn ào', 'Nóng nảy'] },
  { hanzi: '可爱', pinyin: 'kě ài', meaning: 'Dễ thương', distractors: ['Khó hiểu', 'Đắt đỏ', 'Nặng nề'] },
  { hanzi: '方便', pinyin: 'fāng biàn', meaning: 'Thuận tiện', distractors: ['Bất tiện', 'Đắt đỏ', 'Khó khăn'] },
  { hanzi: '麻烦', pinyin: 'má fan', meaning: 'Phiền phức', distractors: ['Thuận tiện', 'Đơn giản', 'Quan trọng'] },
  { hanzi: '上次', pinyin: 'shàng cì', meaning: 'Lần trước', distractors: ['Lần sau', 'Lần này', 'Lúc nào'] },
  { hanzi: '下次', pinyin: 'xià cì', meaning: 'Lần sau', distractors: ['Lần trước', 'Hôm nay', 'Năm nay'] },
  { hanzi: '马上', pinyin: 'mǎ shàng', meaning: 'Ngay lập tức', distractors: ['Từ từ', 'Sớm hay muộn', 'Có lẽ'] },
  { hanzi: '认真地', pinyin: 'rèn zhēn de', meaning: 'Một cách nghiêm túc', distractors: ['Qua loa', 'Tình cờ', 'Hiếm khi'] },
  { hanzi: '特别', pinyin: 'tè bié', meaning: 'Đặc biệt / rất', distractors: ['Bình thường', 'Hiếm khi', 'Một ít'] },
  { hanzi: '多数', pinyin: 'duō shù', meaning: 'Phần lớn / đa số', distractors: ['Một ít', 'Không ai', 'Ngay lập tức'] },
  { hanzi: '几乎', pinyin: 'jī hū', meaning: 'Hầu như', distractors: ['Hoàn toàn', 'Một ít', 'Có lẽ'] },
  { hanzi: '后来', pinyin: 'hòu lái', meaning: 'Sau đó', distractors: ['Trước đây', 'Ngay bây giờ', 'Có lẽ'] },
  { hanzi: '以前', pinyin: 'yǐ qián', meaning: 'Trước đây', distractors: ['Sau này', 'Ngay bây giờ', 'Ngày mai'] },
  { hanzi: '大概', pinyin: 'dà gài', meaning: 'Đại khái / khoảng', distractors: ['Chắc chắn', 'Hoàn toàn', 'Rõ ràng'] },
  { hanzi: '一定', pinyin: 'yí dìng', meaning: 'Nhất định / chắc chắn', distractors: ['Có lẽ', 'Hiếm khi', 'Đôi khi'] },
  { hanzi: '刚才', pinyin: 'gāng cái', meaning: 'Vừa nãy', distractors: ['Lát nữa', 'Ngày mai', 'Năm ngoái'] },
  { hanzi: '聊天', pinyin: 'liáo tiān', meaning: 'Trò chuyện', distractors: ['Làm việc', 'Ngủ', 'Lái xe'] },
  { hanzi: '发邮件', pinyin: 'fā yóu jiàn', meaning: 'Gửi email', distractors: ['Viết bài', 'Mua đồ', 'Nói chuyện'] },
  { hanzi: '照片', pinyin: 'zhào piàn', meaning: 'Ảnh chụp', distractors: ['Bản đồ', 'Hóa đơn', 'Thời tiết'] },
  { hanzi: '文章', pinyin: 'wén zhāng', meaning: 'Bài viết', distractors: ['Cuộc hẹn', 'Ảnh chụp', 'Đồng hồ'] },
  { hanzi: '声音', pinyin: 'shēng yīn', meaning: 'Âm thanh', distractors: ['Mùi vị', 'Ánh sáng', 'Màu sắc'] },
  { hanzi: '味道', pinyin: 'wèi dào', meaning: 'Mùi vị', distractors: ['Âm thanh', 'Giờ giấc', 'Tốc độ'] },
  { hanzi: '终于来了', pinyin: 'zhōng yú lái le', meaning: 'Cuối cùng cũng đến', distractors: ['Đã về rồi', 'Chưa tới', 'Không đi nữa'] },
  { hanzi: '请假', pinyin: 'qǐng jià', meaning: 'Xin nghỉ', distractors: ['Đi làm', 'Học thêm', 'Trả lời'] },
  { hanzi: '加班', pinyin: 'jiā bān', meaning: 'Làm thêm giờ', distractors: ['Tan làm', 'Đi học', 'Xin nghỉ'] },
  { hanzi: '搬家', pinyin: 'bān jiā', meaning: 'Chuyển nhà', distractors: ['Về nhà', 'Mua nhà', 'Tìm nhà'] },
  { hanzi: '合适', pinyin: 'hé shì', meaning: 'Phù hợp/Thích hợp', distractors: ['Bất tiện', 'Xa lạ', 'Bận rộn'] },
  { hanzi: '预约', pinyin: 'yù yuē', meaning: 'Đặt lịch hẹn', distractors: ['Hủy lịch', 'Mượn sách', 'Đi muộn'] },
  { hanzi: '负责的', pinyin: 'fù zé de', meaning: 'Có trách nhiệm', distractors: ['Lười biếng', 'Ồn ào', 'Tùy tiện'] },
  { hanzi: '同意', pinyin: 'tóng yì', meaning: 'Đồng ý', distractors: ['Từ chối', 'Do dự', 'Quên mất'] },
  { hanzi: '反对', pinyin: 'fǎn duì', meaning: 'Phản đối', distractors: ['Đồng ý', 'Giúp đỡ', 'Bắt đầu'] },
  { hanzi: '按时', pinyin: 'àn shí', meaning: 'Đúng giờ / theo giờ', distractors: ['Đi muộn', 'Đêm qua', 'Một chút'] },
  { hanzi: '机会不多', pinyin: 'jī huì bù duō', meaning: 'Cơ hội không nhiều', distractors: ['Có rất nhiều thời gian', 'Không có vấn đề', 'Rất dễ dàng'] },
  { hanzi: '越来越好', pinyin: 'yuè lái yuè hǎo', meaning: 'Ngày càng tốt hơn', distractors: ['Ngày càng tệ', 'Hoàn toàn giống nhau', 'Không thay đổi'] },
  { hanzi: '检查一下', pinyin: 'jiǎn chá yí xià', meaning: 'Kiểm tra một chút', distractors: ['Giải thích một chút', 'Ngủ một chút', 'Ăn một chút'] },
  { hanzi: '及时', pinyin: 'jí shí', meaning: 'Kịp thời', distractors: ['Rất muộn', 'Không rõ', 'Tùy ý'] },
  { hanzi: '适应', pinyin: 'shì yìng', meaning: 'Thích nghi', distractors: ['Từ chối', 'Giải thích', 'Bắt đầu'] },
];

function pickUniqueValues(pool: string[], exclude: string, count: number, seed: number): string[] {
  const candidates = pool.filter((item) => item !== exclude);
  if (candidates.length === 0 || count <= 0) return [];

  const picked: string[] = [];
  const stride = Math.max(1, Math.floor(candidates.length / count) || 1);

  for (let step = 0; picked.length < count && step < candidates.length * 2; step += 1) {
    const candidate = candidates[(seed + step * stride) % candidates.length];
    if (!picked.includes(candidate)) {
      picked.push(candidate);
    }
  }

  for (const candidate of candidates) {
    if (picked.length >= count) break;
    if (!picked.includes(candidate)) picked.push(candidate);
  }

  return picked.slice(0, count);
}

function buildChoiceOptions(correct: string, distractors: string[]): string[] {
  const unique = [correct, ...distractors.filter((item) => item && item !== correct)];
  return [...new Set(unique)].slice(0, 4);
}

function pickHanziDistractors(
  wordBank: Hsk1WordEntry[],
  entry: Hsk1WordEntry,
  index: number,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
): string[] {
  const allHanzi = wordBank.map((item) => item.hanzi);

  if (difficulty === 'HARD') {
    return pickUniqueValues(allHanzi, entry.hanzi, 3, Math.max(0, index - 1));
  }

  if (difficulty === 'MEDIUM') {
    const nearby = pickUniqueValues(allHanzi, entry.hanzi, 2, Math.max(0, index - 1));
    const farther = pickUniqueValues(allHanzi, entry.hanzi, 3, index + 11).filter(
      (item) => !nearby.includes(item),
    );
    return [...nearby, ...farther].slice(0, 3);
  }

  return pickUniqueValues(allHanzi, entry.hanzi, 3, index + 17);
}

function pickMeaningDistractors(
  wordBank: Hsk1WordEntry[],
  entry: Hsk1WordEntry,
  index: number,
): string[] {
  const fromEntry = entry.distractors.filter((item) => item !== entry.meaning);
  if (fromEntry.length >= 3) return fromEntry.slice(0, 3);

  const otherMeanings = wordBank
    .filter((item) => item.hanzi !== entry.hanzi && item.meaning !== entry.meaning)
    .map((item) => item.meaning);

  return [...fromEntry, ...pickUniqueValues(otherMeanings, entry.meaning, 3 - fromEntry.length, index + 5)].slice(0, 3);
}

function createChineseQuestions(
  wordBank: Hsk1WordEntry[],
  quizId: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
) {
  return wordBank.flatMap((entry, index) => {
    const meaningOptions = buildChoiceOptions(entry.meaning, pickMeaningDistractors(wordBank, entry, index));
    const hanziOptions = buildChoiceOptions(
      entry.hanzi,
      pickHanziDistractors(wordBank, entry, index, difficulty),
    );

    return [
      {
        id: `${quizId}-q${index * 3 + 1}`,
        quizId,
        question:
          difficulty === 'HARD'
            ? `Trong câu đơn giản, "${entry.hanzi}" (${entry.pinyin}) thường được hiểu gần nhất là gì?`
            : `"${entry.hanzi}" (${entry.pinyin}) có nghĩa gần đúng là gì?`,
        type: 'MULTIPLE_CHOICE' as const,
        options: rotateOptions(meaningOptions, index % meaningOptions.length),
        correctAnswer: entry.meaning,
        explanation: `${entry.hanzi} (${entry.pinyin}) có nghĩa là ${entry.meaning.toLowerCase()}.`,
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: `${quizId}-q${index * 3 + 2}`,
        quizId,
        question:
          difficulty === 'EASY'
            ? `Nếu ai đó nói "${entry.hanzi}", ý gần nhất là gì?`
            : difficulty === 'MEDIUM'
              ? `Nếu trong đối thoại có từ "${entry.hanzi}", người nói đang muốn diễn đạt gì?`
              : `Nếu nghe từ "${entry.hanzi}" trong hội thoại, cách hiểu nào phù hợp nhất?`,
        type: 'MULTIPLE_CHOICE' as const,
        options: rotateOptions(meaningOptions, (index + 1) % meaningOptions.length),
        correctAnswer: entry.meaning,
        explanation: `${entry.hanzi} (${entry.pinyin}) được hiểu là ${entry.meaning.toLowerCase()}.`,
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: `${quizId}-q${index * 3 + 3}`,
        quizId,
        question:
          difficulty === 'EASY'
            ? `Từ nào phù hợp nhất với nghĩa "${entry.meaning}"?`
            : difficulty === 'MEDIUM'
              ? `Trong tình huống quen thuộc, từ nào mang nghĩa gần với "${entry.meaning}" nhất?`
              : `Nếu cần diễn đạt ý "${entry.meaning}", cách chọn từ nào là phù hợp nhất?`,
        type: 'MULTIPLE_CHOICE' as const,
        options: rotateOptions(hanziOptions, (index + 2) % hanziOptions.length),
        correctAnswer: entry.hanzi,
        explanation: `Đáp án đúng là ${entry.hanzi} (${entry.pinyin}), mang nghĩa ${entry.meaning.toLowerCase()}.`,
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ];
  });
}

function createHsk1ContextQuestions(quizId: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
  const byDifficulty = {
    EASY: [
      {
        question: 'Nếu ai đó hỏi "今天星期几？", họ đang hỏi điều gì?',
        options: ['Hôm nay là ngày mấy?', 'Hôm nay thứ mấy?', 'Bây giờ mấy giờ?', 'Bạn bao nhiêu tuổi?'],
        correctAnswer: 'Hôm nay thứ mấy?',
        explanation: '星期几 dùng để hỏi thứ trong tuần.',
      },
      {
        question: '“我喜欢喝茶” 这句话最接近什么意思？',
        options: ['Tôi thích uống trà', 'Tôi thích ăn cơm', 'Tôi không thích trà', 'Tôi muốn mua trà'],
        correctAnswer: 'Tôi thích uống trà',
        explanation: 'Câu này có nghĩa là “Tôi thích uống trà”.',
      },
      {
        question: 'Nếu ai đó nói "在哪儿", họ đang hỏi gì?',
        options: ['Hỏi thời gian', 'Hỏi nơi chốn', 'Hỏi tuổi', 'Hỏi số lượng'],
        correctAnswer: 'Hỏi nơi chốn',
        explanation: '在哪儿 có nghĩa là ở đâu.',
      },
    ],
    MEDIUM: [
      {
        question: 'Nếu ai đó hỏi "你是哪国人？", họ đang hỏi gì?',
        options: ['Bạn tên là gì?', 'Bạn là người nước nào?', 'Bạn bao nhiêu tuổi?', 'Bạn sống ở đâu?'],
        correctAnswer: 'Bạn là người nước nào?',
        explanation: '哪国人 dùng để hỏi quốc tịch.',
      },
      {
        question: '“他在学校” 这句话最接近什么意思？',
        options: ['Anh ấy ở trường học', 'Anh ấy là giáo viên', 'Anh ấy thích trường học', 'Anh ấy đi bệnh viện'],
        correctAnswer: 'Anh ấy ở trường học',
        explanation: 'Câu này có nghĩa là “Anh ấy ở trường học”.',
      },
      {
        question: 'Nếu câu là "我没有水", người nói muốn diễn đạt điều gì?',
        options: ['Tôi không có nước', 'Tôi thích nước', 'Tôi uống nước', 'Tôi mua nước'],
        correctAnswer: 'Tôi không có nước',
        explanation: '没有 nghĩa là không có.',
      },
      {
        question: '"老师有几个学生？" đang hỏi điều gì?',
        options: ['Giáo viên có bao nhiêu học sinh?', 'Giáo viên thích học sinh nào?', 'Học sinh là giáo viên à?', 'Bao giờ giáo viên đến?'],
        correctAnswer: 'Giáo viên có bao nhiêu học sinh?',
        explanation: 'Câu này chứa cả 老师, 学生 và 几 để hỏi số lượng học sinh của giáo viên.',
      },
      {
        question: 'Nếu người A nói "老师好！", người B nên 怎么回答?',
        options: ['你好！', '谢谢。', '对不起。', '没关系。'],
        correctAnswer: '你好！',
        explanation: 'Với lời chào, phản hồi tự nhiên nhất là chào lại.',
      },
      {
        question: 'Bạn nghe câu hỏi "你叫什么名字？", câu nào là 回答 phù hợp nhất?',
        options: ['我叫李明。', '我在学校。', '我喜欢苹果。', '今天星期五。'],
        correctAnswer: '我叫李明。',
        explanation: 'Câu hỏi hỏi tên, nên đáp án phải giới thiệu tên mình.',
      },
      {
        question: 'Nếu bạn hỏi "你去哪里？", 哪句最合适 để trả lời?',
        options: ['我去商店。', '我是老师。', '我三十岁。', '我喜欢汉语。'],
        correctAnswer: '我去商店。',
        explanation: 'Câu hỏi hỏi đi đâu, nên đáp án cần là địa điểm đến.',
      },
      {
        question: 'A: 谢谢！ B: ______. Câu nào 最合适?',
        options: ['不客气。', '你好。', '对不起。', '再见。'],
        correctAnswer: '不客气。',
        explanation: 'Không có gì là phản hồi tự nhiên sau lời cảm ơn.',
      },
    ],
    HARD: [
      {
        question: 'Câu nào phù hợp nhất để trả lời cho "你喜欢喝什么？"?',
        options: ['我喜欢喝茶。', '我是老师。', '今天星期三。', '我在学校。'],
        correctAnswer: '我喜欢喝茶。',
        explanation: 'Câu hỏi hỏi đồ uống yêu thích, nên câu trả lời phải nói về việc thích uống gì.',
      },
      {
        question: '如果句子里有“几”，说话的人通常在问什么？',
        options: ['时间', '数量（比较少）', '国籍', '爱好'],
        correctAnswer: '数量（比较少）',
        explanation: '“几” thường dùng để hỏi số lượng nhỏ hoặc thứ tự.',
      },
      {
        question: '“我在中国学校学习汉语” 这句话最接近什么意思？',
        options: [
          'Tôi học tiếng Trung ở trường tại Trung Quốc',
          'Tôi thích trường học ở Mỹ',
          'Tôi là giáo viên dạy tiếng Trung',
          'Tôi không học tiếng Trung',
        ],
        correctAnswer: 'Tôi học tiếng Trung ở trường tại Trung Quốc',
        explanation: 'Câu này có nghĩa là “Tôi học tiếng Trung ở trường tại Trung Quốc”.',
      },
      {
        question: 'Câu nào hợp lý nhất nếu một 学生 nói mình 喜欢 老师?',
        options: ['我喜欢老师。', '老师喜欢几。', '学生在点。', '中国喜欢学校。'],
        correctAnswer: '我喜欢老师。',
        explanation: 'Câu đúng và tự nhiên nhất là 我喜欢老师。',
      },
      {
        question: 'Nếu người A nói "你好！", người B nên 怎么回答?',
        options: ['你好！', '谢谢。', '对不起。', '没关系。'],
        correctAnswer: '你好！',
        explanation: 'Với lời chào 你好, cách đáp tự nhiên nhất là chào lại.',
      },
      {
        question: 'Bạn nghe câu hỏi "你叫什么名字？", câu nào là 回答 phù hợp nhất?',
        options: ['我叫王明。', '我在学校。', '今天星期一。', '我喜欢茶。'],
        correctAnswer: '我叫王明。',
        explanation: 'Câu hỏi hỏi tên, nên đáp án đúng là giới thiệu tên mình.',
      },
      {
        question: 'Nếu thầy giáo hỏi "你是哪国人？", 哪句最合适 để trả lời?',
        options: ['我是越南人。', '我二十岁。', '我是学生。', '我喜欢汉语。'],
        correctAnswer: '我是越南人。',
        explanation: 'Câu hỏi hỏi quốc tịch, nên phải trả lời bằng mẫu 我是…人。',
      },
      {
        question: 'Trong hội thoại, nếu ai đó hỏi "现在几点？", bạn 应该说什么?',
        options: ['三点。', '星期三。', '三个人。', '三本书。'],
        correctAnswer: '三点。',
        explanation: '几点 hỏi giờ giấc, nên đáp án cần là mốc giờ.',
      },
      {
        question: 'Nếu bạn hỏi "你去哪里？", câu trả lời nào 最合适?',
        options: ['我去学校。', '我是老师。', '我叫李明。', '我二十三岁。'],
        correctAnswer: '我去学校。',
        explanation: 'Đi đâu thì câu trả lời cần nêu địa điểm đến.',
      },
      {
        question: 'A: 谢谢！ B: ______. Câu nào hợp lý nhất?',
        options: ['不客气。', '对不起。', '你好。', '再见。'],
        correctAnswer: '不客气。',
        explanation: 'Không có gì / không khách sáo là phản hồi tự nhiên sau lời cảm ơn.',
      },
    ],
  } as const;

  return byDifficulty[difficulty].map((item, index) => ({
    id: `${quizId}-context-${index + 1}`,
    quizId,
    question: item.question,
    type: 'MULTIPLE_CHOICE' as const,
    options: [...item.options],
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
    points: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }));
}

function createHsk2ContextQuestions(quizId: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
  const byDifficulty = {
    EASY: [
      {
        question: 'Nếu bạn nghe "请你介绍一下自己", người kia muốn bạn làm gì?',
        options: ['Giới thiệu bản thân', 'Đi ngủ', 'Mua đồ', 'Trả lời điện thoại'],
        correctAnswer: 'Giới thiệu bản thân',
        explanation: '介绍一下自己 nghĩa là giới thiệu về bản thân một chút.',
      },
      {
        question: 'A: 你准备好了吗？ B: ______. Câu nào phù hợp nhất?',
        options: ['准备好了。', '我是老师。', '我去学校。', '今天星期二。'],
        correctAnswer: '准备好了。',
        explanation: 'Khi hỏi đã chuẩn bị xong chưa, đáp án tự nhiên là 准备好了。',
      },
      {
        question: 'Nếu ai đó hỏi "为什么你今天迟到？", họ muốn biết điều gì?',
        options: ['Vì sao bạn đi muộn hôm nay?', 'Bạn thích ăn gì?', 'Bạn học ở đâu?', 'Bạn bao nhiêu tuổi?'],
        correctAnswer: 'Vì sao bạn đi muộn hôm nay?',
        explanation: '为什么 dùng để hỏi nguyên nhân.',
      },
      {
        question: 'A: 我可以帮助你吗？ B: ______. Câu nào trả lời phù hợp nhất?',
        options: ['谢谢你。', '我是老师。', '今天很热。', '我在银行。'],
        correctAnswer: '谢谢你。',
        explanation: 'Khi ai đó hỏi có thể giúp không, lời cảm ơn là phản hồi tự nhiên nhất.',
      },
    ],
    MEDIUM: [
      {
        question: 'Nếu đồng nghiệp nói "今天下班以后一起吃饭吧", ý gần nhất là gì?',
        options: ['Tan làm rồi cùng đi ăn nhé', 'Hôm nay đi học nhé', 'Tan làm rồi về nhà ngay', 'Hôm nay không ăn cơm'],
        correctAnswer: 'Tan làm rồi cùng đi ăn nhé',
        explanation: 'Đây là lời rủ đi ăn sau giờ làm.',
      },
      {
        question: 'A: 这个问题很简单。 B: ______. Câu trả lời nào tự nhiên nhất?',
        options: ['我明白了。', '我昨天去北京。', '我是医生。', '现在三点。'],
        correctAnswer: '我明白了。',
        explanation: 'Khi nghe nói vấn đề đơn giản, phản hồi tự nhiên là “tôi hiểu rồi”.',
      },
      {
        question: 'Nếu ai đó nói "虽然今天很冷，但是我还是想出去运动", ý chính là gì?',
        options: ['Dù trời lạnh nhưng vẫn muốn ra ngoài vận động', 'Hôm nay trời nóng', 'Không muốn ra ngoài', 'Muốn ở nhà ngủ'],
        correctAnswer: 'Dù trời lạnh nhưng vẫn muốn ra ngoài vận động',
        explanation: '虽然...但是... diễn tả nhượng bộ: dù... nhưng...',
      },
      {
        question: 'A: 你能不能帮我检查一下这个文件？ B: ______. Câu nào hợp lý nhất?',
        options: ['当然可以。', '我昨天去银行。', '我不喜欢运动。', '现在十二点。'],
        correctAnswer: '当然可以。',
        explanation: 'Khi được nhờ giúp kiểm tra tài liệu, câu trả lời phù hợp là đồng ý hỗ trợ.',
      },
    ],
    HARD: [
      {
        question: 'Nếu khách nói "服务员，我想看看菜单", phục vụ nên nói gì là phù hợp nhất?',
        options: ['好的，请看。', '我下班了。', '今天很热。', '你是学生吗？'],
        correctAnswer: '好的，请看。',
        explanation: 'Khi khách muốn xem thực đơn, phục vụ nên đáp lịch sự: 好的，请看。',
      },
      {
        question: 'A: 你觉得这个办法怎么样？ B: ______. Câu nào hợp lý nhất?',
        options: ['我觉得很好。', '我去商店。', '我是中国人。', '现在星期三。'],
        correctAnswer: '我觉得很好。',
        explanation: 'Câu hỏi hỏi ý kiến, nên câu trả lời phù hợp là đưa ra nhận xét.',
      },
      {
        question: 'Nếu một người nói "我已经准备好了，我们现在可以开始", ý gần nhất là gì?',
        options: ['Tôi đã chuẩn bị xong, bây giờ có thể bắt đầu', 'Tôi chưa chuẩn bị xong', 'Tôi muốn về nhà', 'Bây giờ không thể bắt đầu'],
        correctAnswer: 'Tôi đã chuẩn bị xong, bây giờ có thể bắt đầu',
        explanation: '已经...好了 表示 việc chuẩn bị đã hoàn tất.',
      },
      {
        question: 'A: 这个安排你觉得合适吗？ B: ______. Câu nào tự nhiên nhất?',
        options: ['我觉得比较合适。', '我去超市买菜。', '今天晚上有点冷。', '她是我的老师。'],
        correctAnswer: '我觉得比较合适。',
        explanation: 'Câu hỏi hỏi đánh giá về sự sắp xếp, nên câu trả lời phải nêu nhận xét trực tiếp.',
      },
      {
        question: 'A: 这个工作比较复杂，你有什么建议？ B: ______. Câu nào hợp lý nhất?',
        options: ['我们可以先讨论一下。', '我昨天去学校。', '他是中国人。', '现在三点。'],
        correctAnswer: '我们可以先讨论一下。',
        explanation: 'Khi được hỏi gợi ý cho một việc phức tạp, phản hồi phù hợp là đề xuất thảo luận/giải pháp.',
      },
      {
        question: 'Nếu ai đó nói "虽然时间不多，但是我们还是来得及", ý chính là gì?',
        options: ['Dù thời gian không nhiều nhưng vẫn kịp', 'Thời gian còn rất nhiều', 'Không thể bắt đầu', 'Họ không muốn làm nữa'],
        correctAnswer: 'Dù thời gian không nhiều nhưng vẫn kịp',
        explanation: '虽然...但是... và 来得及 cho thấy vẫn còn kịp dù thời gian hạn chế.',
      },
      {
        question: 'A: 你能不能把这个消息及时通知大家？ B: ______. Câu nào phù hợp nhất?',
        options: ['没问题，我马上发邮件。', '我今天不上班。', '这本书很有意思。', '外面有点冷。'],
        correctAnswer: '没问题，我马上发邮件。',
        explanation: 'Khi được nhờ thông báo gấp cho mọi người, phản hồi hợp lý là đồng ý và nêu hành động cụ thể.',
      },
      {
        question: 'Nếu một người nói "这个办法不一定适合每个人", ý gần nhất là gì?',
        options: ['Cách này không chắc phù hợp với tất cả mọi người', 'Cách này chắc chắn phù hợp với mọi người', 'Không ai có cách làm', 'Mọi người đều thích cách này'],
        correctAnswer: 'Cách này không chắc phù hợp với tất cả mọi người',
        explanation: '不一定适合 mỗi người nghĩa là không chắc phù hợp cho tất cả.',
      },
      {
        question: 'A: 你为什么还没决定？ B: ______. Câu trả lời nào tự nhiên nhất?',
        options: ['因为我还想比较一下。', '因为我已经下班了。', '因为今天是星期二。', '因为这本书很新。'],
        correctAnswer: '因为我还想比较一下。',
        explanation: 'Bị hỏi vì sao chưa quyết định thì câu trả lời tự nhiên là giải thích vẫn đang cân nhắc.',
      },
    ],
  } as const;

  return byDifficulty[difficulty].map((item, index) => ({
    id: `${quizId}-context-${index + 1}`,
    quizId,
    question: item.question,
    type: 'MULTIPLE_CHOICE' as const,
    options: [...item.options],
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
    points: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }));
}

export const HSK1_EASY_QUESTIONS = [
  ...createChineseQuestions(HSK1_WORD_BANK, 'offline-quiz-hsk1-easy', 'EASY').slice(0, 64),
  ...createHsk1ContextQuestions('offline-quiz-hsk1-easy', 'EASY'),
];

export const HSK1_MEDIUM_QUESTIONS = [
  ...createChineseQuestions(HSK1_WORD_BANK, 'offline-quiz-hsk1-medium', 'MEDIUM').slice(32, 96),
  ...createHsk1ContextQuestions('offline-quiz-hsk1-medium', 'MEDIUM'),
];

export const HSK1_HARD_QUESTIONS = [
  ...createChineseQuestions(HSK1_WORD_BANK, 'offline-quiz-hsk1-hard', 'HARD').slice(72, 136),
  ...createHsk1ContextQuestions('offline-quiz-hsk1-hard', 'HARD'),
];

function createWordBankExtraQuestions(
  wordBank: Hsk1WordEntry[],
  quizId: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  variants: Array<'meaning' | 'hanzi'>,
) {
  return variants.flatMap((variant, variantIndex) =>
    wordBank.map((entry, index) => {
      if (variant === 'meaning') {
        const options = buildChoiceOptions(
          entry.meaning,
          pickMeaningDistractors(wordBank, entry, index + variantIndex * 17),
        );
        const prompts =
          difficulty === 'EASY'
            ? [
                `Nếu ai đó dùng từ "${entry.hanzi}", họ đang nói gần nhất về điều gì?`,
                `Nếu người học mới gặp từ "${entry.hanzi}", cách hiểu dễ nhất là gì?`,
              ]
            : difficulty === 'MEDIUM'
              ? [
                  `Nếu trong ngữ cảnh công việc hoặc học tập có từ "${entry.hanzi}", người nói đang muốn diễn đạt gì?`,
                ]
              : [
                  `Nếu trong đoạn hội thoại xuất hiện "${entry.hanzi}", cách hiểu nào phù hợp nhất?`,
                ];

        return {
          id: `${quizId}-extra${variantIndex + 1}-${index + 1}`,
          quizId,
          question: prompts[variantIndex % prompts.length],
          type: 'MULTIPLE_CHOICE' as const,
          options: rotateOptions(options, (index + variantIndex) % options.length),
          correctAnswer: entry.meaning,
          explanation: `${entry.hanzi} (${entry.pinyin}) được hiểu gần nhất là ${entry.meaning.toLowerCase()}.`,
          points: 1,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
      }

      const options = buildChoiceOptions(
        entry.hanzi,
        pickHanziDistractors(wordBank, entry, index + variantIndex * 11, difficulty),
      );
      const prompts =
        difficulty === 'EASY'
          ? [`Câu nào dùng để diễn đạt nghĩa gần với "${entry.meaning}" nhất?`]
          : difficulty === 'MEDIUM'
            ? [`Trong các lựa chọn sau, từ nào mang nghĩa gần nhất với "${entry.meaning}"?`]
            : [
                `Nếu phải chọn từ phù hợp nhất cho ý "${entry.meaning}", đáp án nào đáng tin nhất?`,
                `Trong ngữ cảnh phức hơn, từ nào phù hợp nhất với ý "${entry.meaning}"?`,
              ];

      return {
        id: `${quizId}-extra${variantIndex + 1}-${index + 1}`,
        quizId,
        question: prompts[variantIndex % prompts.length],
        type: 'MULTIPLE_CHOICE' as const,
        options: rotateOptions(options, (index + variantIndex + 1) % options.length),
        correctAnswer: entry.hanzi,
        explanation: `${entry.hanzi} là lựa chọn phù hợp nhất cho nghĩa "${entry.meaning}".`,
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    }),
  );
}

export const HSK2_EASY_QUESTIONS = [
  ...createChineseQuestions(HSK2_WORD_BANK, 'offline-quiz-hsk2-easy', 'EASY'),
  ...createWordBankExtraQuestions(HSK2_WORD_BANK, 'offline-quiz-hsk2-easy', 'EASY', [
    'meaning',
    'hanzi',
    'meaning',
  ]),
  ...createHsk2ContextQuestions('offline-quiz-hsk2-easy', 'EASY'),
];

export const HSK2_MEDIUM_QUESTIONS = [
  ...createChineseQuestions(HSK2_WORD_BANK, 'offline-quiz-hsk2-medium', 'MEDIUM'),
  ...createWordBankExtraQuestions(HSK2_WORD_BANK, 'offline-quiz-hsk2-medium', 'MEDIUM', [
    'meaning',
    'hanzi',
  ]),
  ...createHsk2ContextQuestions('offline-quiz-hsk2-medium', 'MEDIUM'),
];

export const HSK2_HARD_QUESTIONS = [
  ...createChineseQuestions(HSK2_WORD_BANK, 'offline-quiz-hsk2-hard', 'HARD'),
  ...createWordBankExtraQuestions(HSK2_WORD_BANK, 'offline-quiz-hsk2-hard', 'HARD', [
    'meaning',
    'hanzi',
  ]),
  ...createHsk2ContextQuestions('offline-quiz-hsk2-hard', 'HARD'),
];

const HSK3_EASY_QUESTIONS = [
  ...createChineseQuestions(HSK3_WORD_BANK, 'offline-quiz-hsk3-easy', 'EASY').slice(0, 40),
  ...createWordBankExtraQuestions(HSK3_WORD_BANK, 'offline-quiz-hsk3-easy', 'EASY', [
    'meaning',
    'hanzi',
  ]),
  ...createHsk2ContextQuestions('offline-quiz-hsk3-easy', 'EASY'),
];

const HSK3_MEDIUM_QUESTIONS = [
  ...createChineseQuestions(HSK3_WORD_BANK, 'offline-quiz-hsk3-medium', 'MEDIUM').slice(18, 62),
  ...createWordBankExtraQuestions(HSK3_WORD_BANK, 'offline-quiz-hsk3-medium', 'MEDIUM', [
    'meaning',
    'hanzi',
  ]),
  ...createHsk2ContextQuestions('offline-quiz-hsk3-medium', 'MEDIUM'),
];

const HSK3_HARD_QUESTIONS = [
  ...createChineseQuestions(HSK3_WORD_BANK, 'offline-quiz-hsk3-hard', 'HARD').slice(30, 76),
  ...createWordBankExtraQuestions(HSK3_WORD_BANK, 'offline-quiz-hsk3-hard', 'HARD', [
    'hanzi',
    'hanzi',
  ]),
  ...createHsk2ContextQuestions('offline-quiz-hsk3-hard', 'HARD'),
];

const HSK1_ALL_QUESTIONS = [
  ...HSK1_EASY_QUESTIONS,
  ...HSK1_MEDIUM_QUESTIONS,
  ...HSK1_HARD_QUESTIONS,
];

function rotateOptions<T>(options: T[], offset: number) {
  if (options.length === 0) return options;
  const normalized = ((offset % options.length) + options.length) % options.length;
  return [...options.slice(normalized), ...options.slice(0, normalized)];
}

function shuffleSessionQuestionOptions(
  questions: OfflineQuiz['questions'],
  sessionSeed: number,
) {
  return questions.map((question, index) => ({
    ...question,
    options: question.options
      ? rotateOptions(question.options, (sessionSeed + index) % question.options.length)
      : question.options,
  }));
}

function pickRandomQuestions<T>(items: T[], count: number) {
  const shuffled = [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

  return shuffled.slice(0, Math.min(count, items.length));
}

const OFFLINE_QUIZZES: OfflineQuiz[] = [
  {
    id: 'offline-quiz-1',
    name: 'Japanese Basics',
    description: 'Simple starter quiz for hiragana and greetings.',
    topic: 'Japanese',
    questionType: 'MULTIPLE_CHOICE',
    questionCount: 3,
    timeLimit: 300,
    passingScore: 60,
    difficulty: 'EASY',
    isPublic: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswer: true,
    allowRetry: true,
    maxRetries: 99,
    userId: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    questions: [
      {
        id: 'offline-q1',
        quizId: 'offline-quiz-1',
        question: 'What does "Ohayo" mean?',
        type: 'MULTIPLE_CHOICE',
        options: ['Good morning', 'Good night', 'Thank you', 'See you'],
        correctAnswer: 'Good morning',
        explanation: 'Ohayo is a common casual morning greeting in Japanese.',
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: 'offline-q2',
        quizId: 'offline-quiz-1',
        question: 'Which character is pronounced "a"?',
        type: 'MULTIPLE_CHOICE',
        options: ['あ', 'い', 'う', 'え'],
        correctAnswer: 'あ',
        explanation: 'The hiragana あ is pronounced "a".',
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: 'offline-q3',
        quizId: 'offline-quiz-1',
        question: 'True or false: "Arigato" means thank you.',
        type: 'TRUE_FALSE',
        options: ['true', 'false'],
        correctAnswer: 'true',
        explanation: 'Arigato means thank you.',
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
  },
  {
    id: 'offline-quiz-2',
    name: 'React Fundamentals',
    description: 'A quick quiz on hooks and component behavior.',
    topic: 'React',
    questionType: 'MULTIPLE_CHOICE',
    questionCount: 2,
    timeLimit: 240,
    passingScore: 50,
    difficulty: 'MEDIUM',
    isPublic: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswer: true,
    allowRetry: true,
    maxRetries: 99,
    userId: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    questions: [
      {
        id: 'offline-q4',
        quizId: 'offline-quiz-2',
        question: 'Which hook stores local state?',
        type: 'MULTIPLE_CHOICE',
        options: ['useMemo', 'useState', 'useRef', 'useId'],
        correctAnswer: 'useState',
        explanation: 'useState is the primary hook for local component state.',
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: 'offline-q5',
        quizId: 'offline-quiz-2',
        question: 'Components must return a single React node.',
        type: 'TRUE_FALSE',
        options: ['true', 'false'],
        correctAnswer: 'true',
        explanation: 'A component returns one React node, which can be a fragment.',
        points: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ],
  },
  {
    id: 'offline-quiz-hsk1',
    name: 'HSK1 Practice',
    description: 'Choose difficulty and number of questions before starting.',
    topic: 'HSK1',
    questionType: 'MULTIPLE_CHOICE',
    questionCount: 30,
    timeLimit: 900,
    passingScore: 60,
    difficulty: 'MIXED',
    isPublic: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswer: true,
    allowRetry: true,
    maxRetries: 99,
    userId: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    questions: HSK1_ALL_QUESTIONS,
  },
  {
    id: 'offline-quiz-hsk2',
    name: 'HSK2 Practice',
    description: 'Choose difficulty and number of questions before starting.',
    topic: 'HSK2',
    questionType: 'MULTIPLE_CHOICE',
    questionCount: 30,
    timeLimit: 1200,
    passingScore: 60,
    difficulty: 'MIXED',
    isPublic: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswer: true,
    allowRetry: true,
    maxRetries: 99,
    userId: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    questions: [...HSK2_EASY_QUESTIONS, ...HSK2_MEDIUM_QUESTIONS, ...HSK2_HARD_QUESTIONS],
  },
  {
    id: 'offline-quiz-hsk3',
    name: 'HSK3 Practice',
    description: 'Choose difficulty and number of questions before starting.',
    topic: 'HSK3',
    questionType: 'MULTIPLE_CHOICE',
    questionCount: 30,
    timeLimit: 1500,
    passingScore: 60,
    difficulty: 'MIXED',
    isPublic: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showCorrectAnswer: true,
    allowRetry: true,
    maxRetries: 99,
    userId: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    questions: [...HSK3_EASY_QUESTIONS, ...HSK3_MEDIUM_QUESTIONS, ...HSK3_HARD_QUESTIONS],
  },
];

export function createQuizOfflineProvider() {
  const quizzes: OfflineQuiz[] = OFFLINE_QUIZZES.map((quiz) => ({
    ...quiz,
    questions: quiz.questions.map((question) => ({ ...question })),
  }));
  const sessions = new Map<string, OfflineSessionState>();
  const history: QuizHistoryItem[] = [];
  let sessionCounter = 0;

  const getQuiz = (id: string): OfflineQuiz => {
    const quiz = quizzes.find((item) => item.id === id);
    if (!quiz) throw new Error(`Offline quiz not found: ${id}`);
    return quiz;
  };

  return {
    async getQuizzes(): Promise<PaginatedQuizResponse> {
      return {
        items: quizzes,
        total: quizzes.length,
        page: 1,
        limit: quizzes.length,
        totalPages: 1,
      };
    },

    async getQuizById(id: string): Promise<Quiz> {
      return getQuiz(id);
    },

    async createQuiz(dto: CreateQuizDto): Promise<Quiz> {
      const quiz: OfflineQuiz = {
        id: `offline-quiz-${Date.now()}`,
        name: dto.name,
        description: dto.description ?? null,
        topic: dto.topic ?? 'General',
        questionType: dto.questionType ?? 'MIXED',
        questionCount: dto.questionCount ?? 5,
        timeLimit: dto.timeLimit ?? 300,
        passingScore: dto.passingScore ?? 70,
        difficulty: dto.difficulty ?? 'MEDIUM',
        isPublic: dto.isPublic ?? false,
        shuffleQuestions: dto.shuffleQuestions ?? true,
        shuffleAnswers: dto.shuffleAnswers ?? true,
        showCorrectAnswer: dto.showCorrectAnswer ?? true,
        allowRetry: dto.allowRetry ?? false,
        maxRetries: dto.maxRetries ?? 0,
        userId: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        questions: [],
      };

      quizzes.unshift(quiz);
      return quiz;
    },

    async updateQuiz(id: string, dto: UpdateQuizDto): Promise<Quiz> {
      const quiz = getQuiz(id);
      Object.assign(quiz, dto, { updatedAt: nowIso() });
      return quiz;
    },

    async deleteQuiz(id: string): Promise<void> {
      const index = quizzes.findIndex((quiz) => quiz.id === id);
      if (index >= 0) {
        quizzes.splice(index, 1);
      }
    },

    async startQuizSession(quizId: string, config?: OfflineQuizStartConfig): Promise<QuizSession> {
      const quiz = getQuiz(quizId);
      const session: QuizSession = {
        id: `offline-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        quizId,
        userId: 1,
        status: 'IN_PROGRESS',
        currentQuestionIndex: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        score: 0,
        startTime: nowIso(),
        endTime: null,
        timeSpent: 0,
        passed: false,
        certificateUrl: null,
      };

      const hskDifficultyPool = quiz.id === 'offline-quiz-hsk3'
        ? config?.difficulty === 'EASY'
          ? HSK3_EASY_QUESTIONS
          : config?.difficulty === 'MEDIUM'
            ? HSK3_MEDIUM_QUESTIONS
            : config?.difficulty === 'HARD'
              ? HSK3_HARD_QUESTIONS
              : HSK3_EASY_QUESTIONS
        : quiz.id === 'offline-quiz-hsk2'
        ? config?.difficulty === 'EASY'
          ? HSK2_EASY_QUESTIONS
          : config?.difficulty === 'MEDIUM'
            ? HSK2_MEDIUM_QUESTIONS
            : config?.difficulty === 'HARD'
              ? HSK2_HARD_QUESTIONS
              : HSK2_EASY_QUESTIONS
        : config?.difficulty === 'EASY'
          ? HSK1_EASY_QUESTIONS
          : config?.difficulty === 'MEDIUM'
            ? HSK1_MEDIUM_QUESTIONS
            : config?.difficulty === 'HARD'
              ? HSK1_HARD_QUESTIONS
              : HSK1_EASY_QUESTIONS;

      const requestedCount = config?.questionCount ?? 20;

      const baseSessionQuestions = (quiz.id === 'offline-quiz-hsk1' || quiz.id === 'offline-quiz-hsk2' || quiz.id === 'offline-quiz-hsk3')
        ? pickRandomQuestions(hskDifficultyPool, requestedCount)
        : quiz.questions;
      sessionCounter += 1;
      const sessionSeed = sessionCounter;
      const sessionQuestions = shuffleSessionQuestionOptions(baseSessionQuestions, sessionSeed);

      session.totalAnswers = 0;

      sessions.set(session.id, { session, wrongAnswers: [], questions: sessionQuestions });
      return { ...session };
    },

    async getQuizSession(sessionId: string): Promise<QuizSession> {
      const state = sessions.get(sessionId);
      if (!state) throw new Error(`Offline quiz session not found: ${sessionId}`);
      return { ...state.session };
    },

    async getSessionQuestions(sessionId: string) {
      const state = sessions.get(sessionId);
      if (!state) throw new Error(`Offline quiz session not found: ${sessionId}`);
      return state.questions.map((question) => ({ ...question }));
    },

    async submitQuizAnswer(sessionId: string, payload: SubmitPayload): Promise<SubmitAnswerResult> {
      const state = sessions.get(sessionId);
      if (!state) throw new Error(`Offline quiz session not found: ${sessionId}`);

      const question = state.questions.find((item) => item.id === payload.questionId);
      if (!question) throw new Error(`Offline quiz question not found: ${payload.questionId}`);

      const isCorrect = payload.answer === question.correctAnswer;
      state.session.currentQuestionIndex += 1;
      state.session.totalAnswers += 1;
      state.session.timeSpent += payload.timeSpent ?? 0;

      if (isCorrect) {
        state.session.correctAnswers += 1;
      } else {
        state.wrongAnswers.push({
          sessionId,
          questionId: question.id,
          question: question.question,
          userAnswer: payload.answer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation ?? '',
          type: question.type,
          options: question.options ?? undefined,
          timeSpent: payload.timeSpent ?? 0,
        });
      }

      return {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation ?? undefined,
        points: question.points,
      };
    },

    async completeQuizSession(sessionId: string): Promise<QuizSession> {
      const state = sessions.get(sessionId);
      if (!state) throw new Error(`Offline quiz session not found: ${sessionId}`);

      const quiz = getQuiz(state.session.quizId);
      const score =
        state.session.totalAnswers > 0
          ? (state.session.correctAnswers / state.session.totalAnswers) * 100
          : 0;

      state.session.status = 'COMPLETED';
      state.session.score = score;
      state.session.endTime = nowIso();
      state.session.passed = score >= quiz.passingScore;

      history.unshift({
        id: state.session.id,
        quizId: quiz.id,
        quizName: quiz.name,
        topic: quiz.topic ?? '',
        status: 'COMPLETED',
        score,
        correctAnswers: state.session.correctAnswers,
        totalAnswers: state.session.totalAnswers,
        timeSpent: state.session.timeSpent,
        startTime: state.session.startTime,
        endTime: state.session.endTime ?? nowIso(),
        passed: state.session.passed ?? false,
      });

      return { ...state.session };
    },

    async getQuizStats(): Promise<QuizStats> {
      const attempts = history.length;
      const scores = history.map((item) => item.score);

      return {
        totalQuizzes: quizzes.length,
        totalAttempts: attempts,
        averageScore: attempts ? scores.reduce((sum, score) => sum + score, 0) / attempts : 0,
        highestScore: attempts ? Math.max(...scores) : 0,
        lowestScore: attempts ? Math.min(...scores) : 0,
        averageTimePerQuestion: 0,
        watchedTopics: Array.from(new Set(quizzes.map((quiz) => quiz.topic).filter(Boolean) as string[])),
        completedQuizzes: attempts,
        passedQuizzes: history.filter((item) => item.passed).length,
      };
    },

    async getQuizHistory(): Promise<PaginatedQuizHistoryResponse> {
      return {
        items: [...history],
        total: history.length,
        page: 1,
        limit: Math.max(1, history.length || 1),
        totalPages: 1,
      };
    },

    async getWrongAnswers(sessionId: string): Promise<WrongAnswer[]> {
      const state = sessions.get(sessionId);
      return state ? [...state.wrongAnswers] : [];
    },
  };
}
