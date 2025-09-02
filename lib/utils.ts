// takes json object and returns a flat array of all keys in the object, including nested keys, in dot notation
export const getObjectKeys = (obj: any, prefix = ''): string[] => {
    if (typeof obj !== 'object' || obj === null) {
      return [];
    }
  
    return Object.keys(obj).reduce((res: string[], key: string) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
  
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // if the value is another object, recurse
        return [...res, ...getObjectKeys(obj[key], newKey)];
      }
      // otherwise, add the key to the result
      return [...res, newKey];
    }, []);
  };