// src/users/users.controller.ts
import { Controller, Get, Query, Post, Body, Param, Patch, Delete, HttpException, HttpStatus, ParseIntPipe, Put, ParseBoolPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }








// -------------------------------------------------------------
// -------------------------------------------------------------
// Endpoint para buscar as informações da empresa e listar no console
// -------------------------------------------------------------
// -------------------------------------------------------------
@Post('send-email/:empresaId')
async sendEmail(
  @Param('empresaId') empresaId: number,
  @Body() emailData: { to: string; subject: string; text: string }
) {
  console.log('controller', empresaId);
  await this.usersService.sendEmail(empresaId, emailData);
  return { message: 'Email sent successfully' };
}






























  @Post('create')
async create(@Body() body) {
  // Agora incluindo o avatar e empresa_id na extração do corpo da requisição
  const { userEmail, username, password, email, address, city, state, cep, fone, avatar, empresa_id } = body;

  console.log('### CREATE ### Controller - userEmail:', userEmail);

  // Passe todos os parâmetros, incluindo o avatar e empresa_id, para o serviço
  return await this.usersService.create(userEmail, username, password, email, address, city, state, cep, fone, avatar, empresa_id);
}





@Put('updateColunaPedido/:empresaId')
async updateColunaPedido(
  @Param('empresaId', ParseIntPipe) empresaId: number,
  @Body() body: { pedido_coluna: string }
) {
  return await this.usersService.updateColunaPedido(empresaId, body.pedido_coluna);
}






  @Put(':userId')
  async updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: {
      username?: string,
      fone?: string,
      avatar?: string,
      is_active?: boolean,
      meta_user?: number,
      meta_grupo?: number,
      entidade?: string,
      access_level?: number,
      address?: string,
      city?: string,
      state?: string,
      cep?: string,
      user_type?: string,
      empresa_id?: number // Adicionando o campo empresa_id
    }
  ) {
    console.log('Recebendo solicitação para atualizar usuário:', userId, body);
    try {
      const updatedUser = await this.usersService.updateUser(userId, body);
      return {
        message: 'Usuário atualizado com sucesso',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Erro ao atualizar o usuário:', error.message);
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Erro ao atualizar o usuário. ' + error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }
  


  @Get(':userId/permissions')
  async getUserColumnPermissions(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('empresaId', ParseIntPipe) empresaId: number
  ) {

    console.log(userId, empresaId)
    const permissions = await this.usersService.getUserColumnPermissions(userId, empresaId);
    return permissions;
  }

  @Post(':userId/permissions')
  async addColumnPermissionToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('columnId', ParseIntPipe) columnId: number,
    @Body('canEdit', ParseBoolPipe) canEdit: boolean,
    @Body('empresaId', ParseIntPipe) empresaId: number
  ) {
    await this.usersService.addColumnPermissionToUser(userId, columnId, canEdit, empresaId);
    return { message: 'Permissão adicionada com sucesso ao usuário.' };
  }

  @Delete(':userId/permissions/:columnId')
  async removeColumnPermissionFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Query('empresaId', ParseIntPipe) empresaId: number
  ) {
    await this.usersService.removeColumnPermissionFromUser(userId, columnId, empresaId);
    return { message: 'Permissão removida com sucesso do usuário.' };
  }

  @Get(':userId/columns')
  async getUserColumns(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('empresaId', ParseIntPipe) empresaId: number
  ) {
    const columns = await this.usersService.getUserColumns(userId, empresaId);
    return columns;
  }

  @Post(':userId/columns')
  async addColumnToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('columnId', ParseIntPipe) columnId: number,
    @Body('empresaId', ParseIntPipe) empresaId: number
  ) {
    await this.usersService.addColumnToUser(userId, columnId, empresaId);
    return {
      message: 'Coluna adicionada com sucesso ao usuário.',
    };
  }

  @Delete(':userId/columns/:columnId')
  async removeColumnFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Query('empresaId', ParseIntPipe) empresaId: number
  ) {
    await this.usersService.removeColumnFromUser(userId, columnId, empresaId);
    return {
      message: 'Coluna removida com sucesso do usuário.',
    };
  }




  @Put(':userId/change-password')
  async changeUserPassword(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { password: string }
  ) {
    return await this.usersService.changeUserPassword(userId, body.password);
  }




  @Get('getRecursos/:empresaId')
  async getRecursosByEmpresaId(@Param('empresaId', ParseIntPipe) empresaId: number) {
    return await this.usersService.getRecursosByEmpresaId(empresaId);
  }



  @Post('create-user-and-company')
  async createUserAndCompany(@Body() body) {
    const {
      username,
      password,
      email,
      fone,
      segment
    } = body;
    return await this.usersService.createUserAndCompany(
      username,
      password,
      email,
      fone,
      segment
    );
  }










  // ---------- modulo pedidos -------------------



  @Get('pedido/:cardId')
  async findPedidoByCardId(@Param('cardId', ParseIntPipe) cardId: number) {

    console.log('pedido/:cardId')
    return await this.usersService.findPedidoByCardId(cardId);
  }

  @Post('upsert-pedido')
  async upsertPedido(@Body() pedidoData: any) {
    console.log('upsert-pedid')
    return await this.usersService.upsertPedido(pedidoData);
  }



































  // @Get('conversation')
  // async getEmailConversation(@Query('email') email: string) {
  //   return this.usersService.getEmails(email);
  // }



























  @Get(':userId/tasks')
  async getUserTasks(@Param('userId', ParseIntPipe) userId: number) {
    return await this.usersService.getUserTasks(userId);
  }








  @Put('updateColunaVendido/:empresaId')
  async updateColunaVendido(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Body() body: { coluna_vendido: string }
  ) {
    return await this.usersService.updateColunaVendido(empresaId, body.coluna_vendido);
  }

  @Put('updateColunaPerdido/:empresaId')
  async updateColunaPerdido(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Body() body: { coluna_perdido: string }
  ) {
    return await this.usersService.updateColunaPerdido(empresaId, body.coluna_perdido);
  }

  @Put('updateColunaArquivado/:empresaId')
  async updateColunaArquivado(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Body() body: { coluna_arquivado: string }
  ) {
    return await this.usersService.updateColunaArquivado(empresaId, body.coluna_arquivado);
  }



  @Get('getEmpresa/:empresaId')
  async buscarEmpresa(@Param('empresaId', ParseIntPipe) empresaId: number) {
    return await this.usersService.buscarEmpresa(empresaId);
  }

  @Get('getCores/:empresaId')
  async buscarCores(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    return await this.usersService.getCores(empresaId);
  }


  // @Post('createCor')
  // async createCor(@Body() body) {
  //   const { name, empresa_id, descricao } = body;
  //   return await this.usersService.createCor(name, empresa_id, descricao);
  // }

  // @Put('updateCor/:id')
  // async updateCor(@Param('id', ParseIntPipe) id: number, @Body() body) {
  //   const { name } = body;
  //   return await this.usersService.updateCor(id, name);
  // }




  @Post('createCor')
async createCor(@Body() body) {
  const { name, empresa_id, descricao, color_code } = body;
  return await this.usersService.createCor(name, empresa_id, descricao, color_code);
}

@Put('updateCor/:id')
async updateCor(@Param('id', ParseIntPipe) id: number, @Body() body) {
  const { name, color_code } = body;
  return await this.usersService.updateCor(id, name, color_code);
}




  @Delete('deleteCor/:id')
  async deleteCor(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteCor(id);
  }



  // ----------- create ------------



  @Post('createEtiqueta')
  async createEtiqueta(@Body() body) {
    const { description, color, empresa_id, order } = body;
    return await this.usersService.createEtiqueta(description, color, empresa_id, order);
  }

  @Post('createOrigem')
  async createOrigem(@Body() body) {
    const { name, empresa_id, descricao } = body;
    return await this.usersService.createOrigem(name, empresa_id, descricao);
  }

  @Post('createColuna')
  async createColuna(@Body() body) {
    const { name, empresa_id, display_order, description } = body;
    return await this.usersService.createColuna(name, empresa_id, display_order, description);
  }

  @Post('createProduto')
  async createProduto(@Body() body) {
    const { name, empresa_id, descricao } = body;
    return await this.usersService.createProduto(name, empresa_id, descricao);
  }

  // ----------- delete -----------
  @Delete('deleteEtiqueta/:id')
  async deleteEtiqueta(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteEtiqueta(id);
  }

  @Delete('deleteOrigem/:id')
  async deleteOrigem(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteOrigem(id);
  }

  // @Delete('deleteColuna/:id')
  // async deleteColuna(@Param('id', ParseIntPipe) id: number) {
  //   return await this.usersService.deleteColuna(id);
  // }

  @Delete('deleteProduto/:id')
  async deleteProduto(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.deleteProduto(id);
  }

  //------------- update -----------

  // @Put('updateEtiqueta/:id')
  // async updateEtiqueta(@Param('id', ParseIntPipe) id: number, @Body() body) {
  //   const { description } = body;
  //   return await this.usersService.updateEtiqueta(id, description);
  // }

  // src/users/users.controller.ts

  // src/users/users.controller.ts

  @Put('updateEtiqueta/:id')
  async updateEtiqueta(@Param('id', ParseIntPipe) id: number, @Body() body) {
    const { description, color, order } = body;
    return await this.usersService.updateEtiqueta(id, description, color, order);
  }



  @Put('updateOrigem/:id')
  async updateOrigem(@Param('id', ParseIntPipe) id: number, @Body() body) {
    const { name } = body;
    return await this.usersService.updateOrigem(id, name);
  }

  // @Put('updateColuna/:id')
  // async updateColuna(@Param('id', ParseIntPipe) id: number, @Body() body) {
  //   const { name } = body;
  //   return await this.usersService.updateColuna(id, name);
  // }

  @Put('updateColuna/:id')
  async updateColuna(@Param('id', ParseIntPipe) id: number, @Body() body) {
    const { name, display_order, description, setor } = body;
    return await this.usersService.updateColuna(id, name, display_order, description, setor);
  }

  @Delete('deleteColuna/:id')
  async deleteColuna(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.usersService.deleteColuna(id);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }





  @Put('updateProduto/:id')
  async updateProduto(@Param('id', ParseIntPipe) id: number, @Body() body) {
    const { name } = body;
    return await this.usersService.updateProduto(id, name);
  }

  //------------- get --------------
  @Get('getEtiquetas/:empresaId')
  async buscarEtiquetas(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    console.log('controller getEtiquetas')
    return await this.usersService.getEtiquetas(empresaId);
  }

  @Get('getOrigens/:empresaId')
  async buscarOrigens(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    console.log('controller getOrigens')
    return await this.usersService.getOrigens(empresaId);
  }

  @Get('getColumns/:empresaId')
  async buscarColumns(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    console.log('controller getColumns')
    return await this.usersService.getColumns(empresaId);
  }

  @Get('getProdutos/:empresaId')
  async buscarProdutos(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ) {
    console.log('controller getProdutos')
    return await this.usersService.getProdutos(empresaId);
  }























  @Post('/cards')
  async getCards(@Body('empresa_id') empresaId: number) {
    return await this.usersService.getCardsByEmpresaId(empresaId);
  }

  @Post('/users')
  async getUsers(@Body('empresa_id') empresaId: number) {
    return await this.usersService.getUsersByEmpresaId(empresaId);
  }

  @Post('/history')
  async getCardHistory(@Body('empresa_id') empresaId: number) {
    return await this.usersService.getCardHistoryByEmpresaId(empresaId);
  }

  @Post('/tasks')
  async getCardTasks(@Body('empresa_id') empresaId: number) {
    return await this.usersService.getCardTasksByEmpresaId(empresaId);
  }

  @Post('/modulo_esquadrias')
  async getModuloEsquadrias(@Body('empresa_id') empresaId: number) {
    return await this.usersService.getModuloEsquadriasByEmpresaId(empresaId);
  }























  // @Get(':userId/permissions')
  // async getUserColumnPermissions(
  //   @Param('userId', ParseIntPipe) userId: number
  // ) {
  //   const permissions = await this.usersService.getUserColumnPermissions(userId);
  //   return permissions;
  // }

  // @Post(':userId/permissions')
  // async addColumnPermissionToUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Body('columnId', ParseIntPipe) columnId: number,
  //   @Body('canEdit', ParseBoolPipe) canEdit: boolean,
  //   @Body('empresaId', ParseIntPipe) empresaId: number
  // ) {
  //   await this.usersService.addColumnPermissionToUser(userId, columnId, canEdit, empresaId);
  //   return { message: 'Permissão adicionada com sucesso ao usuário.' };
  // }

  // @Delete(':userId/permissions/:columnId')
  // async removeColumnPermissionFromUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Param('columnId', ParseIntPipe) columnId: number
  // ) {
  //   await this.usersService.removeColumnPermissionFromUser(userId, columnId);
  //   return { message: 'Permissão removida com sucesso do usuário.' };
  // }















  @Post(':userId/afilhados')
  async addAfilhadoToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { afilhadoId: number, empresaId: number } // Adicione empresaId aqui
  ) {
    await this.usersService.addAfilhadoToUser(userId, body.afilhadoId, body.empresaId); // Passe empresaId para o serviço
    return { message: 'Afilhado adicionado com sucesso.' };
  }
  
  @Delete(':userId/afilhados/:afilhadoId')
  async removeAfilhadoFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('afilhadoId', ParseIntPipe) afilhadoId: number,
    @Query('empresaId', ParseIntPipe) empresaId: number // Adicione empresaId como parâmetro da query
  ) {
    await this.usersService.removeAfilhadoFromUser(userId, afilhadoId, empresaId); // Passe empresaId para o serviço
    return { message: 'Afilhado removido com sucesso.' };
  }
  

  // @Post(':userId/afilhados')
  // async addAfilhadoToUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Body('afilhadoId', ParseIntPipe) afilhadoId: number
  // ) {
  //   await this.usersService.addAfilhadoToUser(userId, afilhadoId);
  //   return { message: 'Afilhado adicionado com sucesso.' };
  // }

  // @Delete(':userId/afilhados/:afilhadoId')
  // async removeAfilhadoFromUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Param('afilhadoId', ParseIntPipe) afilhadoId: number
  // ) {
  //   await this.usersService.removeAfilhadoFromUser(userId, afilhadoId);
  //   return { message: 'Afilhado removido com sucesso.' };
  // }


  @Get(':userId/afilhados')
  async getUserAfilhados(@Param('userId', ParseIntPipe) userId: number) {
    const afilhados = await this.usersService.getUserAfilhados(userId);
    return afilhados;
  }



  // @Get(':userId/columns')
  // async getUserColumns(@Param('userId', ParseIntPipe) userId: number) {
  //   const columns = await this.usersService.getUserColumns(userId);
  //   return columns;
  // }

  @Get(':userId/columns-info')
  async getUserColumnsInfo(@Param('userId', ParseIntPipe) userId: number) {
    const columnsInfo = await this.usersService.getUserColumnsInfo(userId);
    return columnsInfo;
  }


  // @Post(':userId/columns')
  // async addColumnToUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Body('columnId', ParseIntPipe) columnId: number
  // ) {
  //   await this.usersService.addColumnToUser(userId, columnId);
  //   return {
  //     message: 'Coluna adicionada com sucesso ao usuário.',
  //   };
  // }

  // @Delete(':userId/columns/:columnId')
  // async removeColumnFromUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Param('columnId', ParseIntPipe) columnId: number
  // ) {
  //   await this.usersService.removeColumnFromUser(userId, columnId);
  //   return {
  //     message: 'Coluna removida com sucesso do usuário.',
  //   };
  // }





  // @Put(':userId')
  // async updateUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Body() body: {
  //     username?: string,
  //     fone?: string,
  //     avatar?: string,
  //     is_active?: boolean,
  //     meta_user?: number,
  //     meta_grupo?: number,
  //     entidade?: string,
  //     access_level?: number,
  //   }
  // ) {
  //   try {
  //     const updatedUser = await this.usersService.updateUser(userId, body);
  //     return {
  //       message: 'Usuário atualizado com sucesso',
  //       user: updatedUser,
  //     };
  //   } catch (error) {
  //     throw new HttpException({
  //       status: HttpStatus.BAD_REQUEST,
  //       error: 'Erro ao atualizar o usuário. ' + error.message,
  //     }, HttpStatus.BAD_REQUEST);
  //   }
  // }



















  // @Put(':userId')
  // async updateUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Body() body: {
  //     username?: string,
  //     fone?: string,
  //     avatar?: string,
  //     is_active?: boolean,
  //     meta_user?: number,
  //     meta_grupo?: number,
  //     entidade?: string,
  //     access_level?: number,
  //     address?: string,
  //     city?: string,
  //     state?: string,
  //     cep?: string,
  //     user_type?: string // Adicionando o campo user_type
  //   }
  // ) {
  //   try {
  //     const updatedUser = await this.usersService.updateUser(userId, body);
  //     return {
  //       message: 'Usuário atualizado com sucesso',
  //       user: updatedUser,
  //     };
  //   } catch (error) {
  //     throw new HttpException({
  //       status: HttpStatus.BAD_REQUEST,
  //       error: 'Erro ao atualizar o usuário. ' + error.message,
  //     }, HttpStatus.BAD_REQUEST);
  //   }
  // }





  @Get('list-by-company')
  async listByCompany(@Query('empresa_id', ParseIntPipe) empresaId: number) {
    try {
      const users = await this.usersService.listByCompany(empresaId);
      return users;
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Erro ao buscar usuários da empresa.',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Get('find-by-email')
  async findByEmail(@Query('email') email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          error: 'Usuário não encontrado.',
        }, HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      // Aqui você pode tratar erros específicos ou erros desconhecidos de forma mais genérica
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Erro ao buscar informações do usuário.',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }




  @Post('login')
  async login(@Body() body) {
    const { email, password } = body;

    try {
      // Utilize o método login do UsersService que inclui a geração do token JWT
      const access_token = await this.usersService.login(email, password);
      return { message: 'Login bem-sucedido', access_token };
    } catch (error) {
      // Lança uma exceção HTTP para tratar de maneira adequada o erro
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: 'Credenciais inválidas ou usuário não encontrado.',
      }, HttpStatus.FORBIDDEN);
    }
  }

  // // src/users/users.controller.ts
  // @Post('create')
  // async create(@Body() body) {
  //   // Agora incluindo o avatar na extração do corpo da requisição
  //   const { userEmail, username, password, email, address, city, state, cep, fone, avatar } = body;

  //   console.log('### CREATE ### Controller - userEmail:', userEmail);

  //   // Passe todos os parâmetros, incluindo o avatar, para o serviço
  //   return await this.usersService.create(userEmail, username, password, email, address, city, state, cep, fone, avatar);
  // }



}
