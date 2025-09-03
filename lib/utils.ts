// lib/utils.ts

/**
 * Intelligently finds the primary array of data within a JSON response.
 */
export const findDataArray = (data: any): any[] | null => {
  if (!data) return null;
  if (Array.isArray(data)) return data;

  if (typeof data === 'object') {
      // Prioritize the 'data' key, which is common in indianapi.com
      const commonKeys = ['data', 'entries', 'results', 'items', 'list'];
      for (const key of commonKeys) {
          if (Array.isArray(data[key])) {
              return data[key];
          }
      }
      // Fallback for other array keys
      for (const key in data) {
          if (Array.isArray(data[key])) {
              return data[key];
          }
      }
  }
  return null;
};

/**
* Intelligently extracts the list of available field keys from API data.
*/
export const getObjectKeysFromData = (data: any): string[] => {
  if (!data) return [];
  const dataArray = findDataArray(data);
  if (dataArray && dataArray.length > 0 && typeof dataArray[0] === 'object') {
      return Object.keys(dataArray[0]);
  }
  if (typeof data === 'object' && !Array.isArray(data)) {
      // For single-object responses, check for a nested 'data' object
      const dataObject = data.data || data;
      return getObjectKeys(dataObject);
  }
  return [];
};

// --- Your existing utility functions below ---

export const getObjectKeys = (obj: any, prefix = ''): string[] => {
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.keys(obj).reduce((res: string[], key: string) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      return [...res, ...getObjectKeys(obj[key], newKey)];
    }
    return [...res, newKey];
  }, []);
};

export const getNestedValue = (obj: any, path: string): any => {
  if (typeof path !== 'string') return undefined;
  // For indianapi.com, some data is nested under a 'data' object.
  const dataObject = obj.data || obj;
  return path.split('.').reduce((acc, part) => acc && acc[part], dataObject);
};

export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 1, removed);
  return newArray;
}