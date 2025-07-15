export namespace text {
  export const uppercaseFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  export const acronym = (str: string) => {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  };
  export const truncate = (str: string, length: number) => {
    if (!str || str.length <= length) return str;
    return str.slice(0, length) + '...';
  };
}
