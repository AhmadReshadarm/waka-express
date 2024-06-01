export interface barcodeDTO {
  id: string;
  code: string;
  checked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BarcodeQueryDTO {
  id?: string;
  code?: string;
  checked?: boolean;
  orderBy?: 'DESC' | 'ASC';
  sortBy?: 'id';
  limit?: number;
  offset?: number;
}

export interface CreateBarcodeDTO {
  code: string;
  checked: boolean;
}
