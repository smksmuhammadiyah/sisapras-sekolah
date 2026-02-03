import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('stock')
@UseGuards(AuthGuard('jwt'))
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @Post('items')
  createItem(@Body() createStockItemDto: CreateStockItemDto) {
    return this.stockService.createItem(createStockItemDto);
  }

  @Get('items')
  findAllItems() {
    return this.stockService.findAllItems();
  }

  @Get('items/:id')
  findOneItem(@Param('id') id: string) {
    return this.stockService.findOneItem(id);
  }

  @Post('items/:id/transactions')
  createTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateStockTransactionDto,
  ) {
    return this.stockService.createTransaction(id, req.user.userId, dto);
  }
}
