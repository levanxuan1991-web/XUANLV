import { AREA_COEFFICIENTS, PRICE_COEFFICIENTS } from '../constants';

export const calculateTotalCoefficient = (state: any) => {
  let coefficient = 1.0;
  
  // Hệ số diện tích nhỏ
  for (const [key, value] of Object.entries(PRICE_COEFFICIENTS.SMALL_AREA)) {
    if (state.smallAreaDisadvantage.includes(key)) {
      coefficient += value;
      break;
    }
  }

  // Hệ số hẻm nhỏ
  for (const [key, value] of Object.entries(PRICE_COEFFICIENTS.SMALL_ALLEY)) {
    if (state.smallAlleyDisadvantage.includes(key)) {
      coefficient += value;
      break;
    }
  }

  // Hệ số mặt tiền
  for (const [key, value] of Object.entries((PRICE_COEFFICIENTS as any).FACADES)) {
    if (state.facades.includes(key)) {
      coefficient += value as number;
      break;
    }
  }

  // Hệ số loại công trình
  for (const [key, value] of Object.entries((PRICE_COEFFICIENTS as any).BUILDING_TYPE)) {
    if (state.buildingType.includes(key)) {
      coefficient += value as number;
      break;
    }
  }

  // Hệ số loại kiến trúc
  for (const [key, value] of Object.entries((PRICE_COEFFICIENTS as any).ARCHITECTURE_TYPE)) {
    if (state.architectureType.includes(key)) {
      coefficient += value as number;
      break;
    }
  }

  // Hệ số vị trí đất
  if ((PRICE_COEFFICIENTS as any).LAND_POSITION) {
    for (const [key, value] of Object.entries((PRICE_COEFFICIENTS as any).LAND_POSITION)) {
      if (state.landPosition.includes(key)) {
        coefficient += value as number;
        break;
      }
    }
  }

  if (state.difficultCondition) coefficient += PRICE_COEFFICIENTS.DIFFICULT_CONDITION;
  if (state.splitLevel) coefficient += PRICE_COEFFICIENTS.SPLIT_LEVEL;

  return coefficient;
};

export const calculateEstimate = (state: any) => {
  let totalArea = 0;
  const details: any[] = [];

  const addDetail = (name: string, area: number, percentage: number) => {
    const calculatedArea = area * percentage;
    if (area > 0) {
      details.push({
        name,
        area,
        percentage,
        calculatedArea
      });
      totalArea += calculatedArea;
    }
  };

  // 1. Móng
  let foundationPercentage = 0.3; // Default Móng cọc
  for (const [key, value] of Object.entries(AREA_COEFFICIENTS.FOUNDATION)) {
    if (state.foundationType.includes(key)) {
      foundationPercentage = value;
      break;
    }
  }
  addDetail('Móng', state.foundationArea, foundationPercentage);

  // 2. Hầm
  let basementPercentage = 1.5;
  for (const [key, value] of Object.entries(AREA_COEFFICIENTS.BASEMENT)) {
    if (state.basementDepth.includes(key)) {
      basementPercentage = value;
      break;
    }
  }
  addDetail('Hầm', state.basementArea, basementPercentage);

  // 3. Tầng 1 (Trệt)
  let groundFloorPercentage = 1.0;
  for (const [key, value] of Object.entries(AREA_COEFFICIENTS.GROUND_FLOOR)) {
    if (state.groundFloorType.includes(key)) {
      groundFloorPercentage = value;
      break;
    }
  }
  addDetail('Tầng 1 (Trệt)', state.groundFloorArea, groundFloorPercentage);

  // 3.1 Tầng lửng
  addDetail('Tầng lửng', state.mezzanineArea, AREA_COEFFICIENTS.MEZZANINE);

  // 4. Các tầng lầu
  state.floorAreas.forEach((area: number, index: number) => {
    addDetail(`Tầng ${index + 2}`, area, AREA_COEFFICIENTS.FLOOR);
  });

  // 5. Tầng lửng (If any)
  if (state.mezzanines > 0) {
    // Assuming mezzanine area is same as floor area for calculation if not specified
    // But let's check if we have a separate field. We don't. 
    // Usually mezzanine is part of a floor. Let's skip for now or assume 0 if not provided.
  }

  // 6. Sân thượng/Ban công
  let terracePercentage = 0.5;
  for (const [key, value] of Object.entries(AREA_COEFFICIENTS.TERRACE)) {
    if (state.terraceType.includes(key)) {
      terracePercentage = value as number;
      break;
    }
  }
  addDetail('Sân thượng', state.terraceArea, terracePercentage);
  addDetail('Ban công (Không mái che)', state.balconyArea, 0.7);

  // 7. Tum
  addDetail('Tum', state.tumArea, AREA_COEFFICIENTS.TUM);

  // 8. Thông tầng
  let voidPercentage = 0.5;
  for (const [key, value] of Object.entries(AREA_COEFFICIENTS.VOID)) {
    if (state.voidType.includes(key)) {
      voidPercentage = value;
      break;
    }
  }
  addDetail('Thông tầng', state.voidArea, voidPercentage);

  // 9. Mái
  const processRoof = (name: string, area: number, type: string) => {
    if (area > 0) {
      let roofPercentage = 0.5;
      for (const [key, value] of Object.entries(AREA_COEFFICIENTS.ROOF)) {
        if (type.includes(key)) {
          roofPercentage = value;
          break;
        }
      }
      addDetail(name, area, roofPercentage);
    }
  };

  processRoof('Mái loại 1', state.roof1Area, state.roof1Type);
  processRoof('Mái loại 2', state.roof2Area, state.roof2Type);
  processRoof('Mái loại 3', state.roof3Area, state.roof3Type);
  processRoof('Mái loại 4', state.roof4Area, state.roof4Type);

  // 10. Sân trước/sau
  let frontYardPercentage = 0.7;
  for (const [key, value] of Object.entries(AREA_COEFFICIENTS.YARD)) {
    if (state.frontYardType.includes(key)) {
      frontYardPercentage = value;
      break;
    }
  }
  addDetail('Sân trước', state.frontYardArea, frontYardPercentage);

  let backYardPercentage = 0.7;
  for (const [key, value] of Object.entries(AREA_COEFFICIENTS.YARD)) {
    if (state.backYardType.includes(key)) {
      backYardPercentage = value;
      break;
    }
  }
  addDetail('Sân sau', state.backYardArea, backYardPercentage);

  // Coefficients (Hệ số bất lợi)
  const coefficient = calculateTotalCoefficient(state);

  // Costs
  const laborCost = totalArea * state.laborPrice * coefficient;
  const roughCost = totalArea * state.roughPrice * coefficient;
  const packageCost = totalArea * state.packagePrice * coefficient;

  // Hạng mục khác (Fixed costs or area based)
  const pilingCost = state.piling ? state.pilingLength * (state.pilingPrice || 320000) : 0;
  const shoringCost = state.shoring ? state.shoringLength * (state.shoringPrice || 30000000) : 0;
  const elevatorCost = state.elevator ? (state.elevatorPrice || 280000000) + (state.elevatorStops * (state.elevatorStopPrice || 15000000)) : 0;
  const poolCost = state.pool ? state.poolArea * (state.poolPrice || 5000000) : 0;
  const permitCost = state.permit ? totalArea * ((state.permitDrawingPrice || 15000) + (state.permitServicePrice || 150000)) : 0;
  const designCost = state.design2D ? totalArea * (state.designPrice || 150000) : 0;

  const totalPackageCost = packageCost + pilingCost + shoringCost + elevatorCost + poolCost + permitCost + designCost;
  const totalCost = totalPackageCost * 0.85; // Internal cost is 85% of the price to client

  // Material Estimates (Mock data for Step 5)
  const materials = [
    { name: 'Thép xây dựng', unit: 'kg', rate: 45, price: 18500 },
    { name: 'Bê tông tươi', unit: 'm3', rate: 0.3, price: 1450000 },
    { name: 'Cát xây tô', unit: 'm3', rate: 0.08, price: 380000 },
    { name: 'Gạch ống', unit: 'viên', rate: 180, price: 1200 },
    { name: 'Xi măng', unit: 'kg', rate: 350, price: 1800 },
  ].map(m => ({
    ...m,
    quantity: totalArea * m.rate,
    amount: totalArea * m.rate * m.price
  }));

  return {
    totalArea,
    details,
    coefficient,
    laborCost,
    roughCost,
    packageCost,
    pilingCost,
    shoringCost,
    elevatorCost,
    poolCost,
    permitCost,
    designCost,
    totalPackageCost,
    totalCost,
    materials
  };
};
