import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CustomModulesService } from './customModules.service';

@Controller('custom-modules')
export class CustomModulesController {
  constructor(private readonly customModulesService: CustomModulesService) { }

  @Post('upsert-field')
  async upsertField(@Body() fieldData: any) {
    return await this.customModulesService.upsertCustomField(fieldData);
  }

  @Post('upsert-field-value')
  async upsertFieldValue(@Body() fieldValueData: any) {
    return await this.customModulesService.upsertCustomFieldValue(fieldValueData);
  }

  // @Get('fields')
  // async getFields(@Query('card_id') cardId: number, @Query('empresa_id') empresaId: number) {
  //   return await this.customModulesService.getFieldsAndValues(cardId, empresaId);
  // }

  @Get('fields')
  async getFields(
    @Query('card_id') cardId: number,
    @Query('empresa_id') empresaId: number,
    @Query('module_id') moduleId: number // Adicionar moduleId
  ) {
    return await this.customModulesService.getFieldsAndValues(cardId, empresaId, moduleId);
  }
  


  @Post('deactivate-field')
  async deactivateField(@Body() body: any) {
    const { fieldId } = body;
    return await this.customModulesService.deactivateField(fieldId);
  }

  @Post('reactivate-field')
  async reactivateField(@Body() body: any) {
    const { fieldId } = body;
    return await this.customModulesService.reactivateField(fieldId);
  }

  @Get('check-field-data')
  async checkFieldData(@Query('field_id') fieldId: number) {
    return await this.customModulesService.checkFieldData(fieldId);
  }

  @Post('delete-field')
  async deleteField(@Body() body: any) {
    const { fieldId } = body;
    return await this.customModulesService.deleteField(fieldId);
  }

  @Post('create-module')
  async createModule(@Body() moduleData: any) {
    return await this.customModulesService.createModule(moduleData);
  }

  @Get('list-modules')
  async listModules(@Query('empresa_id') empresaId: number) {
    return await this.customModulesService.listModules(empresaId);
  }

  @Post('delete-module')
async deleteModule(@Body() body: any) {
  const { moduleId } = body;
  return await this.customModulesService.deleteModule(moduleId);
}


}
