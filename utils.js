const bigIntMin = (...args) => {return args.reduce((m, e) => e < m ? e : m);}

module.exports = {
  async parseMention (user, arg, client) {
    let mentionID = arg.trim().match(/^<@!?(\d+)>$/);
    if (!mentionID) mentionID = arg.trim();
    else {mentionID = mentionID[1]};
    try {
      return await client.users.fetch(mentionID);;
    } catch (error) {
      return user;
    }
  },
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
  fillTextFit (canvas, ctx, text, x, y, max_width=200, fontSize=34, minFontSize=34) {
    do {
      if (fontSize <= minFontSize) {
        while (ctx.measureText(text).width > max_width) {
          text = text.slice(0,-1);
        }
        break;
      }
      ctx.font = `${fontSize--}px sans-serif`;
    } while (ctx.measureText(text).width > max_width);
    ctx.fillText(text, x, y);
    return text;
  },
  roundRect (ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined" ) {
      stroke = true;
    }
    if (typeof radius === "undefined") {
      radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }  
  },
  getRandomValue (min, max) {
    return Math.round(Math.random()*(max-min)+min);
  }
}
