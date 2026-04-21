import { dataExcelGoc } from './dataDuToan';
import { dataMaterials } from './dataMaterials';

export interface EstimateItem {
  id: string;
  stt: string;
  hang_muc: string;
  dvt: string;
  chung_loai: string;
  dinh_muc_m2: number;
  so_luong: number;
  he_so: number;
  tong_so_luong: number;
  don_gia: number;
  thanh_tien: number;
  ghi_chu: string;
  isParent: boolean;
}

export interface MaterialItem {
  id: string;
  stt: string;
  name: string;
  brand: string;
  unit: string;
  price: number;
  category: 'PRODUCTION' | 'ROUGH' | 'FINISHING' | 'CONTRACTED';
  dinh_muc_m2: number;
}

export interface SavedProject {
  id: string;
  name: string;
  date: string;
  data: Omit<AppState, 'savedProjects'>;
}

export interface AppState {
  // Step 1
  location: string;
  buildingType: string;
  facades: string;
  architectureType: string;
  smallAreaDisadvantage: string;
  smallAlleyDisadvantage: string;
  landPosition: string;
  splitLevel: boolean;
  difficultCondition: boolean;
  bedrooms: number;
  bathrooms: number;
  worshipRooms: number;
  livingRooms: number;
  readingRooms: number;
  dressingRooms: number;
  mezzanines: number;
  laborPrice: number;
  roughPrice: number;
  packagePrice: number;

  // Step 2
  foundationArea: number;
  foundationType: string;
  basementArea: number;
  basementDepth: string;
  groundFloorArea: number;
  groundFloorType: string;
  mezzanineArea: number;
  floorsCount: number;
  floorAreas: number[];
  terraceArea: number;
  terraceType: string;
  tumArea: number;
  roof1Area: number;
  roof1Type: string;
  roof2Area: number;
  roof2Type: string;
  roof3Area: number;
  roof3Type: string;
  roof4Area: number;
  roof4Type: string;
  voidArea: number;
  voidType: string;
  frontYardArea: number;
  frontYardType: string;
  backYardArea: number;
  backYardType: string;
  balconyArea: number;

  // Step 3
  shoring: boolean;
  shoringLength: number;
  piling: boolean;
  pilingLength: number;
  elevator: boolean;
  elevatorStops: number;
  pool: boolean;
  poolArea: number;
  permit: boolean;
  design2D: boolean;
  
  // Unit Prices for Step 3 items
  shoringPrice: number;
  pilingPrice: number;
  elevatorPrice: number;
  elevatorStopPrice: number;
  permitDrawingPrice: number;
  permitServicePrice: number;
  designPrice: number;
  poolPrice: number;
  materialList: MaterialItem[];
  duToanChiTiet: EstimateItem[];
  
  // Saved Projects
  savedProjects: SavedProject[];
}

export const initialState: AppState = {
  location: "TP. Hồ Chí Minh",
  buildingType: "Nhà phố (chuẩn)",
  facades: "Một mặt tiền (chuẩn)",
  architectureType: "Hiện đại (chuẩn)",
  smallAreaDisadvantage: "Lớn hơn 70m2 (chuẩn)",
  smallAlleyDisadvantage: "Đường xe tải (chuẩn)",
  landPosition: "Xây chen, các phía đã có nhà (chuẩn)",
  splitLevel: false,
  difficultCondition: false,
  bedrooms: 4,
  bathrooms: 4,
  worshipRooms: 1,
  livingRooms: 1,
  readingRooms: 0,
  dressingRooms: 0,
  mezzanines: 1,
  laborPrice: 1800000,
  roughPrice: 4000000,
  packagePrice: 6500000,

  foundationArea: 75,
  foundationType: "Móng cọc (30%)",
  basementArea: 0,
  basementDepth: "DT từ 70m2: Sâu >=1.7 đến 2m (200%)",
  groundFloorArea: 75,
  groundFloorType: "Nền BT gạch vỡ (Chuẩn)",
  mezzanineArea: 0,
  floorsCount: 2,
  floorAreas: [75, 75],
  terraceArea: 60,
  terraceType: "Không tiểu cảnh (50%)",
  tumArea: 15,
  roof1Area: 15,
  roof1Type: "Mái BTCT (50%)",
  roof2Area: 0,
  roof2Type: "Mái BTCT (50%)",
  roof3Area: 0,
  roof3Type: "Mái BTCT (50%)",
  roof4Area: 0,
  roof4Type: "Mái BTCT (50%)",
  voidArea: 10,
  voidType: "Lớn hơn 8m2 (50%)",
  frontYardArea: 0,
  frontYardType: "Không có mái che (70%)",
  backYardArea: 0,
  backYardType: "Không có mái che (70%)",
  balconyArea: 0,

  shoring: false,
  shoringLength: 0,
  piling: false,
  pilingLength: 281,
  elevator: false,
  elevatorStops: 0,
  pool: false,
  poolArea: 0,
  permit: false,
  design2D: false,

  // Default Unit Prices from image
  shoringPrice: 30000000,
  pilingPrice: 320000,
  elevatorPrice: 280000000,
  elevatorStopPrice: 15000000,
  permitDrawingPrice: 15000,
  permitServicePrice: 150000,
  designPrice: 150000,
  poolPrice: 5000000,
  materialList: dataMaterials,
  duToanChiTiet: dataExcelGoc,
  savedProjects: [],
};
