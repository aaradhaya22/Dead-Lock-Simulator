// frontend/src/utils/matrixHelpers.js

/**
 * Creates an empty matrix of size rows x cols initialized to 0
 */
export function createEmptyMatrix(rows, cols) {
  return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

/**
 * Creates an empty vector of size initialized to 0
 */
export function createEmptyVector(size) {
  return Array(size).fill(0);
}

/**
 * Validates that all elements of a matrix are non-negative integers
 */
export function validateMatrix(matrix) {
  if (!Array.isArray(matrix)) return false;
  for (let i = 0; i < matrix.length; i++) {
    if (!Array.isArray(matrix[i])) return false;
    for (let j = 0; j < matrix[i].length; j++) {
      const val = Number(matrix[i][j]);
      if (isNaN(val) || val < 0 || !Number.isInteger(val)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Validates that all elements of a vector are non-negative integers
 */
export function validateVector(vector) {
  if (!Array.isArray(vector)) return false;
  for (let i = 0; i < vector.length; i++) {
    const val = Number(vector[i]);
    if (isNaN(val) || val < 0 || !Number.isInteger(val)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns a standard 5 processes, 3 resources Banker's Algorithm dataset.
 * This matches standard textbook examples.
 */
export function getStandardTextbookData() {
  return {
    numProcesses: 5,
    numResources: 3,
    available: [3, 3, 2],
    maxMatrix: [
      [7, 5, 3], // P0
      [3, 2, 2], // P1
      [9, 0, 2], // P2
      [2, 2, 2], // P3
      [4, 3, 3]  // P4
    ],
    allocMatrix: [
      [0, 1, 0], // P0
      [2, 0, 0], // P1
      [3, 0, 2], // P2
      [2, 1, 1], // P3
      [0, 0, 2]  // P4
    ]
  };
}
