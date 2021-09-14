module.exports = {
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
  }
}
