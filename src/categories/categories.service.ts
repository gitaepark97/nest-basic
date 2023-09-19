import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Categories } from '../entities/Categories';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,
  ) {}

  async getCategoryList() {
    try {
      const categories = await this.categoriesRepository.find();

      return { list: categories };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
