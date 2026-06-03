import { Module } from '@nestjs/common'
import { ExcelModule, PrismaModule } from '../shared'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ProductRepository } from './product.repository'
import { ProductManyNewRepository } from './product-many-new.repository'

@Module({
	imports: [PrismaModule, ExcelModule],
	controllers: [ProductController],
	providers: [ProductService, ProductRepository, ProductManyNewRepository],
	exports: [ProductService, ProductRepository],
})
export class ProductModule {}
