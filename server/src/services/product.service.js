import { productRepo } from '../repositories/product.repo.js';

export const productService = {
  create(productInput) {
    return productRepo.insert(productInput);
  },
  updateMetadata(productId, metadata) {
    return productRepo.updateMetadata(productId, metadata);
  },
  getAll() {
    return productRepo.all();
  },
  count() {
    return productRepo.count();
  },
};
