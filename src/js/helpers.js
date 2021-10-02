export function getRandomIndex(array) {
  return Math.floor((Math.random() * array.length));
}

export function getRandomNumber(minimum, maximum) {
  const min = Math.ceil(minimum);
  const max = Math.floor(maximum);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomPercentage() {
  return Math.floor(Math.random() * (100 - 0 + 1) + 0);
}

export function getRandomBoolean() {
  return Math.random() < 0.5;
}
