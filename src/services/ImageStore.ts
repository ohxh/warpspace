const IMAGE_STORE_NAME = "WarpspaceImageStore";

export class ImageStore {
  name: string;

  constructor(name = IMAGE_STORE_NAME) {
    this.name = name;
  }

  /** Stores a base64 encoded image */
  store(key: string, image: string) {
    chrome.storage.local.set({ [`${this.name}.${key}`]: image });
  }

  /** Gets a base64 encoded image */
  async get(key: string) {
    return (await chrome.storage.local.get(`${this.name}.${key}`))?.[
      `${this.name}.${key}`
    ];
  }
}
