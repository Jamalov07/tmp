import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import {
	ActionModule,
	AuthModule,
	ClientModule,
	CronModule,
	ExcelModule,
	PrismaModule,
	ProductModule,
	PermissionModule,
	StaffModule,
	SupplierModule,
	StaffPaymentModule,
	SupplierPaymentModule,
	SellingModule,
	ArrivalModule,
	ReturningModule,
	ClientPaymentModule,
	ProductMVModule,
	BotModule,
	PdfModule,
} from '@module'
import { appConfig, botConfig, databaseConfig, jwtConfig } from '@config'
import { AuthGuard, CheckPermissionGuard } from '@common'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig, databaseConfig, jwtConfig, botConfig],
		}),
		PrismaModule,
		ActionModule,
		AuthModule,
		StaffModule,
		PermissionModule,
		ClientModule,
		SupplierModule,
		StaffPaymentModule,
		SupplierPaymentModule,
		ClientPaymentModule,
		SellingModule,
		ArrivalModule,
		ReturningModule,
		ProductMVModule,
		ProductModule,
		CronModule,
		ExcelModule,
		PdfModule,
		BotModule,
	],
	controllers: [],
	providers: [AuthGuard, CheckPermissionGuard],
})
export class AppModule {}
