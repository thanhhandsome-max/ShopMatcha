export const API_BASE_URL = 'http://localhost:3000/api';

//Vai tro he thong(dong bo voi ma vai tro trong database)

export const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'MGR',
    STAFF: 'STAFF',
    CUSTOMER: 'CUST',
} as const;

//trang thai don hang
export const ORDER_STATUS = {
    CANCELLED: 0,   //Huy don hang
    PENDING: 1,     //Cho xac nhan
    PROCESSING: 2,  //Dang xu ly
    SHIPPING: 3,    //Dang giao hang
    COMPLETED: 4,   //Hoan thanh don hang
} as const;

//trang thai san pham
export const PRODUCT_STATUS = {
    INACTIVE: 0,    //Khong con ban
    ACTIVE: 1,      //Con ban
    OUT_OF_STOCK: 2,//Het hang
} as const;

//trang thai Chung tu(Phieu nhap, phieu xuat, phieu chuyen)

export const RECEIPT_STATUS = {
    CANCELLED: 0, //Huy chung tu
    COMPLETED: 1, //Hoan thanh chung tu
    DRAFT: 2,     //Ban nhap chung tu
} as const;

//Key dung de luu LocalStorage/SessionStorage
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    USER_INFO: 'user_info',
} as const;
