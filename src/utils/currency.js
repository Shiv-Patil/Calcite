const bigIntMin = (...args) => {return args.reduce((m, e) => e < m ? e : m);}

module.exports = {
  parseCalciteString (balance, string, max_value) {
    string = string.toLowerCase();
    if (["all", "max"].includes(string)) {
      return (!max_value) ? balance : bigIntMin(balance, max_value);
    } else if (string === "half") {
      balance = balance/BigInt(2);
      return (!max_value) ? balance : bigIntMin(balance, max_value);
    } else {
      balance = BigInt(0);
      if (!Number.isNaN(+string)) return BigInt(Math.floor(+string));
      let _splitString = string.split("k");
      if (_splitString.length !== 2) return null;
      if (_splitString[1].length) return null;
      if (Number.isNaN(+_splitString[0])) return null;
      return BigInt(Math.floor(+_splitString[0]*1000));
    }
  },
  getRandomValue (min, max) {
    return Math.round(Math.random()*(max-min)+min);
  }
}
