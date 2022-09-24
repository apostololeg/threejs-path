export default function drawImage(inputImageData: ImageData) {
  const canvas = <HTMLCanvasElement>document.querySelector('.img-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 200;
  canvas.height = 200;

  const invertedImgData = invertImageData(inputImageData);

  ctx.putImageData(invertedImgData, 0, 0);
}

function invertImageData(imgData: ImageData) {
  var i;
  for (i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = 255 - imgData.data[i];
    imgData.data[i + 1] = 255 - imgData.data[i + 1];
    imgData.data[i + 2] = 255 - imgData.data[i + 2];
    imgData.data[i + 3] = 255;
  }

  return imgData;
}
