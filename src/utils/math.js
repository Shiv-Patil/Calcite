module.exports = {
  getRandomValue (min, max) {
    return Math.round(Math.random()*(max-min)+min);
  }
}
