// workerd's Web Crypto has timingSafeEqual on crypto.subtle; Node's does not. The tests give Node the same call.
import { timingSafeEqual } from 'node:crypto';

const subtle = globalThis.crypto.subtle as SubtleCrypto & { timingSafeEqual?: (a: ArrayBuffer, b: ArrayBuffer) => boolean };
if (!subtle.timingSafeEqual) {
  subtle.timingSafeEqual = (a: ArrayBuffer | ArrayBufferView, b: ArrayBuffer | ArrayBufferView) => {
    const view = (x: ArrayBuffer | ArrayBufferView) => (ArrayBuffer.isView(x) ? new Uint8Array(x.buffer, x.byteOffset, x.byteLength) : new Uint8Array(x));
    const va = view(a);
    const vb = view(b);
    if (va.length !== vb.length) throw new TypeError('timingSafeEqual: lengths differ');
    return timingSafeEqual(va, vb);
  };
}
