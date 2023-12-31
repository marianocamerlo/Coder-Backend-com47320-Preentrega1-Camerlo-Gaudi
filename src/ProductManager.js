import fs from "fs/promises";

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
  }

  async _readFile() {
    try {
      const data = await fs.readFile(this.path, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async _writeFile(products) {
    try {
      await fs.writeFile(this.path, JSON.stringify(products, null, 2), "utf8");
    } catch (error) {
      console.error("Error al guardar productos en el archivo:", error);
    }
  }

  async loadProductsFromFile() {
    return await this._readFile();
  }

  async saveProductsToFile(products) {
    await this._writeFile(products);
  }

  async addProduct(product) {
    const products = await this.loadProductsFromFile();
    if (
      !product.title ||
      !product.description ||
      !product.code ||
      !product.price ||
      !product.stock
    ) {
      console.error("Todos los campos son obligatorios.");
      return { success: false, error: "Todos los campos son obligatorios." };
    }

    const existingProduct = products.find((p) => p.code === product.code);
    if (existingProduct) {
      console.error(`Ya existe un producto con el code ${product.code}.`);
      return {
        success: false,
        error: `Ya existe un producto con el code ${product.code}.`,
      };
    }

    product.id = this.getNextId(products);

    products.push(product);
    await this.saveProductsToFile(products);

    return { success: true, message: "Producto agregado correctamente." };
  }

  getNextId(products) {
    const lastId = products.length > 0 ? products[products.length - 1].id : 0;
    return lastId + 1;
  }

  async getProducts(limit) {
    const allProducts = await this.loadProductsFromFile();
    if (limit) {
      return allProducts.slice(0, limit);
    } else {
      return allProducts;
    }
  }

  async getProductById(id) {
    const products = await this.loadProductsFromFile();
    const product = products.find((product) => product.id === id);
    if (!product) {
      console.log(`El producto con ID ${id} no existe.`);
    }
    return product;
  }

  async updateProduct(id, updatedProduct) {
    const products = await this.loadProductsFromFile();
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) {
      console.error(`Producto con ID ${id} no encontrado.`);
      return false;
    }

    products[index] = {
      ...products[index],
      ...updatedProduct,
    };

    await this.saveProductsToFile(products);
    return true;
  }

  async deleteProduct(id) {
    const products = await this.loadProductsFromFile();
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) {
      console.error(`Producto con ID ${id} no encontrado.`);
      return false;
    }

    products.splice(index, 1);

    await this.saveProductsToFile(products);
    return true;
  }
}

export default ProductManager;
