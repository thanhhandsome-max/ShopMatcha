export const formatVND = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null) return '0₫';

    const num = typeof amount === 'number' ? amount : parseFloat(amount);

    if (isNaN(num)) return '0₫';

    return new Intl.NumberFormat('vi-VN',{
        style: 'currency',
        currency: 'VND' 
    }).format(num);
};

export const formatDate = (dateInput: Date | string | undefined | null, includeTime: boolean = false): string => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(includeTime && { hour12: false, minute: '2-digit', second: '2-digit' })   
    };

    return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

export const formatPhone = (phone: string | number | undefined | null): string => {
    if (!phone) return '';
    // Loại bỏ tất cả ký tự không phải số
    const cleaned = ('' + phone).replace(/\D/g, '');

    // chuan 10 so cua Vietnam: 0xxx xxx xxx
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);

    if (match) {
        return `${match[1]} ${match[2]} ${match[3]}`;
    }
    
    return cleaned; // Trả về số đã làm sạch nếu không khớp định dạng
}
