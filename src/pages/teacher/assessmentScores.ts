export const pointsToUnits=(points:number):number=>Math.round(points*1000);
export const unitsToPoints=(units:number):number=>units/1000;
export function assessmentLabel(value:string):string{
 const labels:Record<string,string>={idle:'Chờ xử lý',queued:'Đang chờ',pending:'Đang chờ',dispatched:'Đã xếp lịch',preparing:'Chuẩn bị bài',extracting:'Đang đọc bài',grading:'Đang chấm',ready:'Có kết quả',running:'Đang xử lý',succeeded:'Hoàn tất',failed:'Xử lý lỗi',paused:'Tạm dừng',retry_wait:'Chờ thử lại',seal:'Xác minh tệp',extract:'Đọc và chấm',grade:'Chấm lại',export:'Xuất báo cáo',confirmed:'Đã xác nhận',proposed:'Cần xác nhận',unresolved:'Chưa xác định',conflict:'Cần kiểm tra danh tính',readable:'Đọc được',unreadable:'Chưa đọc rõ',not_found:'Chưa tìm thấy',confirmed_blank:'Đã xác nhận bỏ trống',open:'Chưa xử lý',resolved:'Đã xử lý',rule:'Theo đáp án',ai:'AI đề xuất',teacher:'Giáo viên điều chỉnh'};
 return value.split(':').map(v=>labels[v]||v).join(' · ');
}
