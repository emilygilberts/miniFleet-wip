// utils.js
//hardcorded to central med for now
export function getRandomLongInRange() {
  return (
    Math.random() * (23.53822224695913 - 12.321715363613052) +
    12.321715363613052
  );
}

export function getRandomLatInRange() {
  return (
    Math.random() * (39.257778150283364 - 32.24068253457369) + 32.24068253457369
  );
}

export function generateRandomId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000); // Adjust the range as needed
  return `${timestamp}_${random}`;
}

export function arraysHaveSameElements(array1, array2) {
  return array1.some((item1) => array2.some((item2) => item1 === item2));
}

export function excludeFields(source, fieldsToExclude) {
  const filteredCopy = { ...source };
  fieldsToExclude.forEach((field) => delete filteredCopy[field]);
  return filteredCopy;
}
