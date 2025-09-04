export const findDataArray = (data: unknown): unknown[] | null => {
  if (!data) return null;
  if (Array.isArray(data)) return data;

  if (typeof data === 'object' && data !== null) {
    const dataRecord = data as Record<string, unknown>;
    const commonKeys = ['data', 'entries', 'results', 'items', 'list'];
    for (const key of commonKeys) {
      const value = dataRecord[key];
      if (Array.isArray(value)) {
        return value;
      }
    }
    // Fallback: return the first array value found in the object
    for (const key in dataRecord) {
      const value = dataRecord[key];
      if (Array.isArray(value)) {
        return value;
      }
    }
  }
  return null;
};

/**
 * Extracts all nested object keys from the first item in a found data array,
 * or from the object itself.
 */
export const getObjectKeysFromData = (data: unknown): string[] => {
  if (!data) return [];
  const dataArray = findDataArray(data);

  // If an array is found, get keys from its first element
  if (dataArray && dataArray.length > 0) {
    const firstElement = dataArray[0];
    if (typeof firstElement === 'object' && firstElement !== null) {
      return getObjectKeys(firstElement);
    }
  }

  // Fallback for non-array objects
  if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
    const dataRecord = data as Record<string, unknown>;
    const dataToInspect = 'data' in dataRecord ? dataRecord.data : dataRecord;
    return getObjectKeys(dataToInspect);
  }

  return [];
};

/**
 * Recursively gets all keys from an object, using dot notation for nested keys.
 */
export const getObjectKeys = (obj: unknown, prefix = ''): string[] => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return [];
  }
  const objRecord = obj as Record<string, unknown>;

  return Object.keys(objRecord).reduce((res, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = objRecord[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // If the value is another object, recurse
      return [...res, ...getObjectKeys(value, newKey)];
    }
    // Otherwise, add the key to the list
    return [...res, newKey];
  }, [] as string[]);
};

/**
 * Safely retrieves a nested value from an object using a dot-notation path string.
 */
export const getNestedValue = (obj: unknown, path: string): unknown => {
  if (typeof path !== 'string' || typeof obj !== 'object' || obj === null) {
    return undefined;
  }

  // Handle a common pattern where data is wrapped in a 'data' property
  const objRecord = obj as Record<string, unknown>;
  const startObject = 'data' in objRecord ? objRecord.data : objRecord;

  return path.split('.').reduce((acc: unknown, part: string) => {
    // At each step, check if the accumulator is an object before accessing the next part
    if (typeof acc === 'object' && acc !== null && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, startObject);
};

/**
 * Moves an element within an array from one position to another.
 * This function was already type-safe and did not need changes.
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
}