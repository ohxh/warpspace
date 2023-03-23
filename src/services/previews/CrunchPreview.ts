export interface CrunchOptions {
  outputType: "jpeg" | "webp";
  quality: number;
  maxWidth: number;
  maxHeight: number;
  linearDownsampleFactor: number;
}

const toDataURL = async (data: Blob) =>
  new Promise<string>((ok) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => ok(reader.result as string));
    reader.readAsDataURL(data);
  });

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

    //Finish off with a hermite filter to avoid text artifacts
    //HermiteFilterResize(canvas, width, height);

    const data = downsample(
      ctx.getImageData(0, 0, canvas.width, canvas.height),
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(data, 0, 0);

    const resized = await canvas.convertToBlob({
      type: "image/webp",
      quality: options.quality,
    });

    const res = await toDataURL(resized);

    resolve(res);
  });
}

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

// export async function isWarpspace(image: any): Promise<number> {
//   const newTab = await new ImageStore().get("newtab");

//   return new Promise((resolve, reject) =>
//     compare(
//       image,
//       newTab,
//       {
//         ignore: "less",
//         output: {
//           boundingBox: {
//             left: 0,
//             top: 0,
//             right: 100,
//             bottom: 100,
//           },
//         },
//       },
//       (err, data) => {
//         if (err) reject(err);
//         resolve(data.rawMisMatchPercentage);
//       }
//     )
//   );
// }

function round(val: number) {
  return (val + 0.49) << 0;
}

function downsample(
  sourceImageData: ImageData,
  destWidth: number,
  destHeight: number,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number
) {
  var dest = new ImageData(destWidth, destHeight);

  var SOURCE_DATA = new Int32Array(sourceImageData.data.buffer);
  var SOURCE_WIDTH = sourceImageData.width;

  var DEST_DATA = new Int32Array(dest.data.buffer);
  var DEST_WIDTH = dest.width;

  var SCALE_FACTOR_X = destWidth / sourceWidth;
  var SCALE_FACTOR_Y = destHeight / sourceHeight;
  var SCALE_RANGE_X = round(1 / SCALE_FACTOR_X);
  var SCALE_RANGE_Y = round(1 / SCALE_FACTOR_Y);
  var SCALE_RANGE_SQR = SCALE_RANGE_X * SCALE_RANGE_Y;

  for (var destRow = 0; destRow < dest.height; destRow++) {
    for (var destCol = 0; destCol < DEST_WIDTH; destCol++) {
      var sourceInd =
        sourceX +
        round(destCol / SCALE_FACTOR_X) +
        (sourceY + round(destRow / SCALE_FACTOR_Y)) * SOURCE_WIDTH;

      var destRed = 0;
      var destGreen = 0;
      var destBlue = 0;
      var destAlpha = 0;

      for (var sourceRow = 0; sourceRow < SCALE_RANGE_Y; sourceRow++)
        for (var sourceCol = 0; sourceCol < SCALE_RANGE_X; sourceCol++) {
          var sourcePx =
            SOURCE_DATA[sourceInd + sourceCol + sourceRow * SOURCE_WIDTH];
          destRed += (sourcePx << 24) >>> 24;
          destGreen += (sourcePx << 16) >>> 24;
          destBlue += (sourcePx << 8) >>> 24;
          destAlpha += sourcePx >>> 24;
        }

      destRed = round(destRed / SCALE_RANGE_SQR);
      destGreen = round(destGreen / SCALE_RANGE_SQR);
      destBlue = round(destBlue / SCALE_RANGE_SQR);
      destAlpha = round(destAlpha / SCALE_RANGE_SQR);

      DEST_DATA[destCol + destRow * DEST_WIDTH] =
        (destAlpha << 24) | (destBlue << 16) | (destGreen << 8) | destRed;
    }
  }

  return dest;
}
