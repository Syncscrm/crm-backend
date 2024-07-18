import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CustomModulesService {
  constructor(private databaseService: DatabaseService) {}

  // async upsertCustomField(fieldData: any) {
  //   const upsertQuery = `
  //     INSERT INTO custom_fields (
  //       name, label, type, empresa_id, ativo
  //     ) VALUES (
  //       $1, $2, $3, $4, $5
  //     )
  //     ON CONFLICT (name, empresa_id) DO UPDATE SET
  //       label = EXCLUDED.label,
  //       type = EXCLUDED.type,
  //       ativo = EXCLUDED.ativo,
  //       updated_at = CURRENT_TIMESTAMP
  //     RETURNING *;
  //   `;

  //   const values = [
  //     fieldData.name, fieldData.label, fieldData.type, fieldData.empresa_id, true
  //   ];

  //   return await this.databaseService.query(upsertQuery, values);
  // }

  // async upsertCustomFieldValue(fieldValueData: any) {
  //   const upsertQuery = `
  //     INSERT INTO custom_field_values (
  //       card_id, field_id, empresa_id, value
  //     ) VALUES (
  //       $1, $2, $3, $4
  //     )
  //     ON CONFLICT (card_id, field_id, empresa_id) DO UPDATE SET
  //       value = EXCLUDED.value,
  //       updated_at = CURRENT_TIMESTAMP
  //     RETURNING *;
  //   `;
  
  //   const values = [
  //     fieldValueData.card_id, fieldValueData.field_id, fieldValueData.empresa_id, fieldValueData.value
  //   ];
  
  //   return await this.databaseService.query(upsertQuery, values);
  // }




  async upsertCustomField(fieldData: any) {
    const upsertQuery = `
      INSERT INTO custom_fields (
        name, label, type, empresa_id, module_id, ativo
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      ON CONFLICT (name, empresa_id, module_id) DO UPDATE SET
        label = EXCLUDED.label,
        type = EXCLUDED.type,
        ativo = EXCLUDED.ativo,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
  
    const values = [
      fieldData.name, fieldData.label, fieldData.type, fieldData.empresa_id, fieldData.module_id, true
    ];
  
    return await this.databaseService.query(upsertQuery, values);
  }


  async upsertCustomFieldValue(fieldValueData: any) {
    const upsertQuery = `
      INSERT INTO custom_field_values (
        card_id, field_id, empresa_id, module_id, value
      ) VALUES (
        $1, $2, $3, $4, $5
      )
      ON CONFLICT (card_id, field_id, empresa_id, module_id) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
  
    const values = [
      fieldValueData.card_id, fieldValueData.field_id, fieldValueData.empresa_id, fieldValueData.module_id, fieldValueData.value
    ];
  
    return await this.databaseService.query(upsertQuery, values);
  }



  async deleteModule(moduleId: number) {
    const deleteFieldValuesQuery = `
      DELETE FROM custom_field_values WHERE module_id = $1
    `;
    const deleteFieldsQuery = `
      DELETE FROM custom_fields WHERE module_id = $1
    `;
    const deleteModuleQuery = `
      DELETE FROM modulos WHERE id = $1
    `;
    await this.databaseService.query(deleteFieldValuesQuery, [moduleId]);
    await this.databaseService.query(deleteFieldsQuery, [moduleId]);
    await this.databaseService.query(deleteModuleQuery, [moduleId]);
    return { message: 'Módulo e todos os campos e valores associados foram excluídos com sucesso' };
  }
  
  
  

  



  // async getFieldsAndValues(cardId: number, empresaId: number) {
  //   const fieldsQuery = `
  //     SELECT * FROM custom_fields
  //     WHERE empresa_id = $1
  //   `;
  //   const fields = await this.databaseService.query(fieldsQuery, [empresaId]);
  
  //   const fieldValuesQuery = `
  //     SELECT * FROM custom_field_values
  //     WHERE card_id = $1 AND empresa_id = $2
  //   `;
  //   const fieldValues = await this.databaseService.query(fieldValuesQuery, [cardId, empresaId]);
  
  //   const activeFields = fields.filter(field => field.ativo);
  //   const inactiveFields = fields.filter(field => !field.ativo);
  
  //   // Map values to corresponding fields
  //   const fieldValuesMap = {};
  //   fieldValues.forEach(value => {
  //     fieldValuesMap[value.field_id] = value;
  //   });
  
  //   // Add values to fields
  //   const fieldsWithValues = activeFields.map(field => ({
  //     ...field,
  //     value: fieldValuesMap[field.id] ? fieldValuesMap[field.id].value : null
  //   }));
  
  //   return { fields: fieldsWithValues, inactiveFields };
  // }




  async getFieldsAndValues(cardId: number, empresaId: number, moduleId: number) {
    const fieldsQuery = `
      SELECT * FROM custom_fields
      WHERE empresa_id = $1 AND module_id = $2
    `;
    const fields = await this.databaseService.query(fieldsQuery, [empresaId, moduleId]);
  
    const fieldValuesQuery = `
      SELECT * FROM custom_field_values
      WHERE card_id = $1 AND empresa_id = $2
    `;
    const fieldValues = await this.databaseService.query(fieldValuesQuery, [cardId, empresaId]);
  
    const activeFields = fields.filter(field => field.ativo);
    const inactiveFields = fields.filter(field => !field.ativo);
  
    // Map values to corresponding fields
    const fieldValuesMap = {};
    fieldValues.forEach(value => {
      fieldValuesMap[value.field_id] = value;
    });
  
    // Add values to fields
    const fieldsWithValues = activeFields.map(field => ({
      ...field,
      value: fieldValuesMap[field.id] ? fieldValuesMap[field.id].value : null
    }));
  
    return { fields: fieldsWithValues, inactiveFields };
  }

  



  async deactivateField(fieldId: number) {
    const deactivateQuery = `
      UPDATE custom_fields SET ativo = FALSE WHERE id = $1
    `;
    await this.databaseService.query(deactivateQuery, [fieldId]);
    return { message: 'Field deactivated successfully' };
  }

  async reactivateField(fieldId: number) {
    const reactivateQuery = `
      UPDATE custom_fields SET ativo = TRUE WHERE id = $1
    `;
    await this.databaseService.query(reactivateQuery, [fieldId]);
    return { message: 'Field reactivated successfully' };
  }

  async checkFieldData(fieldId: number) {
    const checkQuery = `
      SELECT 1 FROM custom_field_values WHERE field_id = $1 LIMIT 1
    `;
    const result = await this.databaseService.query(checkQuery, [fieldId]);
    return { exists: result.length > 0 };
  }

  async deleteField(fieldId: number) {
    const deleteFieldValuesQuery = `
      DELETE FROM custom_field_values WHERE field_id = $1
    `;
    const deleteFieldQuery = `
      DELETE FROM custom_fields WHERE id = $1
    `;
    await this.databaseService.query(deleteFieldValuesQuery, [fieldId]);
    await this.databaseService.query(deleteFieldQuery, [fieldId]);
    return { message: 'Field and associated data deleted successfully' };
  }



  async createModule(moduleData: any) {
    const createModuleQuery = `
      INSERT INTO modulos (name, description, empresa_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [moduleData.name, moduleData.description, moduleData.empresa_id];
    const result = await this.databaseService.query(createModuleQuery, values);
    return result[0];
  }

  async listModules(empresaId: number) {
    const listModulesQuery = `
      SELECT * FROM modulos WHERE empresa_id = $1;
    `;
    const result = await this.databaseService.query(listModulesQuery, [empresaId]);
    return result;
  }




}
