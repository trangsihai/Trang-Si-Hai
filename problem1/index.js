var sum_to_n_b = function (n) {
  // Loop with reduce
  return new Array(n).fill().reduce((acc, _, index) => acc + index + 1, 0);
};

var sum_to_n_b = function (n) {
  // Recursive
  return n === 1 ? 1 : n + sum_to_n_c(n - 1);
};

var sum_to_n_c = function (n) {
  // Use mathematical fomula
  return (n * (n + 1)) / 2;
};
