export namespace numbers {
  export const getOrdinalSuffix = (n: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = n % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  };
}
