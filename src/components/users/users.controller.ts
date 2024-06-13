// src/users/users.controller.ts
import { Controller, Get, Query, Post, Body, Param, Patch, Delete, HttpException, HttpStatus, ParseIntPipe, Put, ParseBoolPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }






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























  @Get(':userId/permissions')
  async getUserColumnPermissions(
    @Param('userId', ParseIntPipe) userId: number
  ) {
    const permissions = await this.usersService.getUserColumnPermissions(userId);
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
    @Param('columnId', ParseIntPipe) columnId: number
  ) {
    await this.usersService.removeColumnPermissionFromUser(userId, columnId);
    return { message: 'Permissão removida com sucesso do usuário.' };
  }

















  @Post(':userId/afilhados')
  async addAfilhadoToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('afilhadoId', ParseIntPipe) afilhadoId: number
  ) {
    await this.usersService.addAfilhadoToUser(userId, afilhadoId);
    return { message: 'Afilhado adicionado com sucesso.' };
  }

  @Delete(':userId/afilhados/:afilhadoId')
  async removeAfilhadoFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('afilhadoId', ParseIntPipe) afilhadoId: number
  ) {
    await this.usersService.removeAfilhadoFromUser(userId, afilhadoId);
    return { message: 'Afilhado removido com sucesso.' };
  }


  @Get(':userId/afilhados')
  async getUserAfilhados(@Param('userId', ParseIntPipe) userId: number) {
    const afilhados = await this.usersService.getUserAfilhados(userId);
    return afilhados;
  }



  @Get(':userId/columns')
  async getUserColumns(@Param('userId', ParseIntPipe) userId: number) {
    const columns = await this.usersService.getUserColumns(userId);
    return columns;
  }

  @Get(':userId/columns-info')
  async getUserColumnsInfo(@Param('userId', ParseIntPipe) userId: number) {
    const columnsInfo = await this.usersService.getUserColumnsInfo(userId);
    return columnsInfo;
  }


  @Post(':userId/columns')
  async addColumnToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('columnId', ParseIntPipe) columnId: number
  ) {
    await this.usersService.addColumnToUser(userId, columnId);
    return {
      message: 'Coluna adicionada com sucesso ao usuário.',
    };
  }

  @Delete(':userId/columns/:columnId')
  async removeColumnFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('columnId', ParseIntPipe) columnId: number
  ) {
    await this.usersService.removeColumnFromUser(userId, columnId);
    return {
      message: 'Coluna removida com sucesso do usuário.',
    };
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
    }
  ) {
    try {
      const updatedUser = await this.usersService.updateUser(userId, body);
      return {
        message: 'Usuário atualizado com sucesso',
        user: updatedUser,
      };
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Erro ao atualizar o usuário. ' + error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }

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

  // src/users/users.controller.ts
  @Post('create')
  async create(@Body() body) {
    // Agora incluindo o avatar na extração do corpo da requisição
    const { userEmail, username, password, email, address, city, state, cep, fone, avatar } = body;

    console.log('### CREATE ### Controller - userEmail:', userEmail);

    // Passe todos os parâmetros, incluindo o avatar, para o serviço
    return await this.usersService.create(userEmail, username, password, email, address, city, state, cep, fone, avatar);
  }



}
