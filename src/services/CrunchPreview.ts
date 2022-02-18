export interface CrunchOptions {
  outputType: "jpeg" | "webp";
  quality: number;
  maxWidth: number;
  maxHeight: number;
  linearDownsampleFactor: number;
}

/**
 * Crunches an image. May take quite some time (1s+) to resolve.
 * @param dataUrl Base64 JPEG dataUrl representing the image
 * @param options Options for compression
 */
export async function crunchPreview(dataUrl: string, options: CrunchOptions) {
  return new Promise<string>(async (resolve) => {
    var t0 = performance.now();

    // Todo: faster way to draw dataurl to canvas
    const img = await createImageBitmap(await dataURLtoBlob(dataUrl));

    var width, height;

    // Fit to box
    if (img.width / img.height >= options.maxWidth / options.maxHeight) {
      width = options.maxWidth;
      height = (width / img.width) * img.height;
    } else {
      height = options.maxHeight;
      width = (height / img.height) * img.width;
    }

    var canvas = new OffscreenCanvas(width, height);
    var ctx = canvas.getContext("2d")!;

    //Start by linear downsampling as it's much faster
    canvas.width = img.width / options.linearDownsampleFactor;
    canvas.height = img.height / options.linearDownsampleFactor;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    var t0 = performance.now();

    //Finish off with a hermite filter to avoid text artifacts
    HermiteFilterResize(canvas, width, height);

    var t0 = performance.now();

    const resized = await canvas.convertToBlob({
      type: "image/webp",
      quality: 0.3,
    });

    const res = await toDataURL(resized);

    var t0 = performance.now();

    resolve(res);
  });
}

const toDataURL = async (data: Blob) =>
  new Promise<string>((ok) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => ok(reader.result as string));
    reader.readAsDataURL(data);
  });

/**
 * Modified Hermite filter resize stolen from stackoverflow:
 * https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly
 * Downside: It's too slow.
 * @param canvas
 * @param width
 * @param height
 */
function HermiteFilterResize(
  canvas: OffscreenCanvas,
  width: number,
  height: number
) {
  var ctx = canvas.getContext("2d")!;

  const ratioW = canvas.width / width;
  const ratioH = canvas.height / height;
  const ratioWHalf = Math.ceil(ratioW / 2);
  const ratioHHalf = Math.ceil(ratioH / 2);

  const inputImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const input = inputImage.data;

  const outputImage = ctx.createImageData(width, height);
  const output = outputImage.data;

  for (var j = 0; j < height; j++) {
    for (var i = 0; i < width; i++) {
      var x2 = (i + j * width) * 4;
      var weight = 0;
      var weights = 0;
      var weightsAlpha = 0;
      var gx_r = 0;
      var gx_g = 0;
      var gx_b = 0;
      var gx_a = 0;
      var center_y = (j + 0.5) * ratioH;
      var yy_start = Math.floor(j * ratioH);
      var yy_stop = Math.ceil((j + 1) * ratioH);
      for (var yy = yy_start; yy < yy_stop; yy++) {
        var dy = Math.abs(center_y - (yy + 0.5)) / ratioHHalf;
        var center_x = (i + 0.5) * ratioW;
        var w0 = dy * dy; //pre-calc part of w
        var xx_start = Math.floor(i * ratioW);
        var xx_stop = Math.ceil((i + 1) * ratioW);
        for (var xx = xx_start; xx < xx_stop; xx++) {
          var dx = Math.abs(center_x - (xx + 0.5)) / ratioWHalf;
          var w = Math.sqrt(w0 + dx * dx);
          if (w >= 1) {
            //pixel too far
            continue;
          }
          //hermite filter
          weight = 2 * w * w * w - 3 * w * w + 1;
          var pos_x = 4 * (xx + yy * canvas.width);
          //alpha
          gx_a += weight * input[pos_x + 3];
          weightsAlpha += weight;
          //colors
          if (input[pos_x + 3] < 255)
            weight = (weight * input[pos_x + 3]) / 250;
          gx_r += weight * input[pos_x];
          gx_g += weight * input[pos_x + 1];
          gx_b += weight * input[pos_x + 2];
          weights += weight;
        }
      }
      output[x2] = gx_r / weights;
      output[x2 + 1] = gx_g / weights;
      output[x2 + 2] = gx_b / weights;
      output[x2 + 3] = gx_a / weightsAlpha;
    }
  }

  canvas.width = width;
  canvas.height = height;

  //draw
  ctx.putImageData(outputImage, 0, 0);
}

async function dataURLtoBlob(dataurl: string) {
  return await (await fetch(dataurl)).blob();
}
