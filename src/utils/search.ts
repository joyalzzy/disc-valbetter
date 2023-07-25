import {Bus} from "../busses/bus.js";

export function binarySearchRange(list: Bus.Stops[], prefix: string): [number, number] {
  const lowerBound = lowerBoundSearch(list, prefix);
  const upperBound = upperBoundSearch(list, prefix);
  return [lowerBound, upperBound - 1];
}

// Lower bound binary search
function lowerBoundSearch(list: Bus.Stops[], prefix: string): number {
  let left = 0;
  let right = list.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (list[mid].name.toLowerCase().startsWith(prefix)) {
      right = mid;
    } else if (list[mid].name.toLowerCase() < prefix) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

// Upper bound binary search
function upperBoundSearch(list: Bus.Stops[], prefix: string): number {
  let left = 0;
  let right = list.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (list[mid].name.toLowerCase().startsWith(prefix)) {
      left = mid + 1;
    } else if (list[mid].name.toLowerCase() < prefix) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

// Function to get autocomplete suggestions based on the input


