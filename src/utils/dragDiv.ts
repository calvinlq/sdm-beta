// 手动调整div宽度
export default function dragDiv(
  resizeDiv: string,
  leftDiv: string,
  rightDiv: string,
  boxDiv: string,
  minW: number,
) {
  let resize: HTMLElement = document.getElementById(resizeDiv)!;
  let left: HTMLElement = document.getElementById(leftDiv)!;
  let right: HTMLElement = document.getElementById(rightDiv)!;
  let box: HTMLElement = document.getElementById(boxDiv)!;

  const resizeWithCapture = resize as HTMLElement & {
    setCapture?: () => void;
    releaseCapture?: () => void;
  };

  resize.onmousedown = function (e) {
    let startX = e.clientX;
    // 使用变量存储位置，而不是设置HTMLElement的left属性
    const initialLeft = resize.offsetLeft;

    document.onmousemove = function (e) {
      let endX = e.clientX;
      let moveLen = initialLeft + (endX - startX);
      let maxT = box.clientWidth - resize.offsetWidth;
      if (minW) {
        if (moveLen < minW) moveLen = minW;
        if (moveLen > maxT - minW) moveLen = maxT - minW;
      } else {
        if (moveLen < 100) moveLen = 100;
        if (moveLen > maxT - 100) moveLen = maxT - 100;
      }
      // resize.style.left = moveLen
      left.style.width = moveLen + "px";
      right.style.width = box.clientWidth - moveLen - 5 + "px";
    };
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
      resizeWithCapture.releaseCapture && resizeWithCapture.releaseCapture();
    };
    resizeWithCapture.setCapture && resizeWithCapture.setCapture();
    return false;
  };
}
