function dist2(x1, y1, x2, y2) {
    return (x1 -= x2) * x1 + (y1 -= y2) * y1;
}
function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }
