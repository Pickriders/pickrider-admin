export const subUnitToBaseUnit = (amount: number | string) => {
  if (isNaN(Number(amount))) return 0;
  return Number(amount) / 100;
};

export const baseUnitToSubUnit = (amount: number | string) => {
  if (isNaN(Number(amount))) return 0;
  return Number(amount) * 100;
};

export const getOrderMinimumAmount = (amount: number, minimumPercentage: number) => {
  return (amount * (100 - minimumPercentage)) / 100;
};
