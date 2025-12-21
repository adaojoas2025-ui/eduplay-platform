# Sistema de Gamificação - EducaplayJA

## Visão Geral

O sistema de gamificação da plataforma EducaplayJA foi desenvolvido para aumentar o engajamento dos usuários através de pontos, níveis, badges, missões e rankings.

## Funcionalidades

### 1. Sistema de Pontos e Níveis

#### Pontos
Os usuários ganham pontos por realizar diversas ações na plataforma:

- **Primeira Compra**: 100 pontos
- **Compra**: 50 pontos
- **Primeira Venda**: 150 pontos
- **Venda**: 75 pontos
- **Publicar Primeiro Produto**: 200 pontos
- **Publicar Produto**: 100 pontos
- **Fazer Avaliação**: 25 pontos
- **Login Diário**: 10 pontos
- **Bônus de Streak**: 5 pontos por dia de streak
- **Conclusão de Curso**: 100 pontos

#### Níveis
Os usuários sobem de nível ao acumular pontos:

| Nível | Pontos Necessários |
|-------|-------------------|
| 1     | 0                 |
| 2     | 100               |
| 3     | 300               |
| 4     | 600               |
| 5     | 1.000             |
| 6     | 1.500             |
| 7     | 2.100             |
| 8     | 2.800             |
| 9     | 3.600             |
| 10    | 4.500             |
| 11    | 5.500             |
| 12    | 6.600             |
| 13    | 7.800             |
| 14    | 9.100             |
| 15    | 10.500            |

**Bônus de Nível**: Ao subir de nível, o usuário recebe 50 pontos adicionais por nível.

### 2. Sistema de Badges

Os badges são conquistas que os usuários podem desbloquear ao atingir determinados marcos.

#### Tipos de Badges

##### Compras (FIRST_PURCHASE)
- **Primeira Compra** (Comum): 1 compra - 100 pontos
- **Comprador Frequente** (Raro): 5 compras - 250 pontos
- **Entusiasta** (Épico): 10 compras - 500 pontos
- **Colecionador Master** (Lendário): 25 compras - 1.000 pontos

##### Vendas (FIRST_SALE)
- **Primeira Venda** (Comum): 1 venda - 150 pontos
- **Vendedor Bronze** (Raro): 10 vendas - 500 pontos
- **Vendedor Prata** (Épico): 50 vendas - 1.500 pontos
- **Vendedor Ouro** (Lendário): 100 vendas - 3.000 pontos
- **Vendedor Elite** (Lendário): 500 vendas - 10.000 pontos

##### Cursos Completados (COURSES_COMPLETED)
- **Primeiro Curso** (Comum): 1 curso - 100 pontos
- **Estudante Dedicado** (Raro): 5 cursos - 300 pontos
- **Mestre do Conhecimento** (Épico): 10 cursos - 750 pontos
- **Sábio** (Lendário): 25 cursos - 2.000 pontos

##### Avaliações (REVIEWS_MADE)
- **Primeira Avaliação** (Comum): 1 avaliação - 25 pontos
- **Crítico** (Raro): 10 avaliações - 150 pontos
- **Avaliador Expert** (Épico): 50 avaliações - 500 pontos

##### Streaks (STREAK_ACHIEVEMENT)
- **Streak 7 Dias** (Raro): 7 dias consecutivos - 200 pontos
- **Streak 30 Dias** (Épico): 30 dias consecutivos - 1.000 pontos
- **Streak 100 Dias** (Lendário): 100 dias consecutivos - 5.000 pontos

##### Engajamento (ENGAGEMENT)
- **Bem-vindo** (Comum): Criar conta - 50 pontos

### 3. Sistema de Missões

As missões são desafios que os usuários podem completar para ganhar pontos extras.

#### Missões Diárias
- **Login Diário**: Fazer login - 10 pontos
- **Explorador Diário**: Visualizar 5 produtos - 20 pontos

#### Missões Semanais
- **Comprador da Semana**: Realizar 2 compras - 150 pontos
- **Avaliador Semanal**: Fazer 3 avaliações - 100 pontos
- **Produtor Ativo**: Realizar 5 vendas - 200 pontos

#### Missões Mensais
- **Estudante do Mês**: Completar 3 cursos - 500 pontos
- **Top Vendedor**: Realizar 20 vendas - 1.000 pontos
- **Engajamento Total**: Manter streak de 30 dias - 750 pontos

#### Missões Especiais
- **Boas-vindas**: Completar perfil pela primeira vez - 100 pontos

### 4. Sistema de Streaks

Os streaks incentivam o uso diário da plataforma:

- Cada dia consecutivo de login aumenta o streak
- Bônus crescente de pontos: 10 pontos base + (5 pontos × dias de streak)
- Se o usuário não fizer login por mais de 24 horas, o streak é reiniciado
- O streak mais longo do usuário é armazenado

### 5. Ranking (Leaderboard)

O ranking mostra os melhores usuários em diferentes categorias e períodos:

#### Períodos
- **Diário**: Últimas 24 horas
- **Semanal**: Últimos 7 dias
- **Mensal**: Últimos 30 dias
- **Todos os Tempos**: Desde sempre

#### Categorias
- **Pontos**: Usuários com mais pontos
- **Vendas**: Produtores com mais vendas
- **Compras**: Compradores mais ativos
- **Avaliações**: Usuários que mais avaliaram

## API Endpoints

### Rotas Públicas/Usuário

#### GET `/api/v1/gamification/profile`
Retorna o perfil de gamificação do usuário autenticado.

**Autenticação**: Requerida

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "totalPoints": 1500,
    "currentLevel": 6,
    "currentStreak": 5,
    "longestStreak": 15,
    "coursesCompleted": 3,
    "totalPurchases": 5,
    "totalSales": 10,
    "reviewsMade": 8,
    "levelInfo": {
      "currentLevel": 6,
      "totalPoints": 1500,
      "pointsToNextLevel": 600,
      "progressPercentage": 60
    },
    "badges": [...],
    "missions": [...]
  }
}
```

#### GET `/api/v1/gamification/points-history`
Retorna o histórico de pontos do usuário.

**Autenticação**: Requerida

**Query Parameters**:
- `limit` (opcional): Número de registros (padrão: 50)
- `offset` (opcional): Offset para paginação (padrão: 0)

**Resposta**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "points": 50,
        "reason": "PURCHASE",
        "description": "Compra realizada",
        "createdAt": "2025-12-08T10:00:00.000Z"
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

#### POST `/api/v1/gamification/streak`
Atualiza o streak diário do usuário.

**Autenticação**: Requerida

**Resposta**:
```json
{
  "success": true,
  "data": {
    "streakContinued": true,
    "currentStreak": 5,
    "pointsEarned": 35
  },
  "message": "Streak de 5 dias! +35 pontos"
}
```

#### GET `/api/v1/gamification/leaderboard`
Retorna o ranking de usuários.

**Autenticação**: Opcional (mostra posição se autenticado)

**Query Parameters**:
- `period` (opcional): DAILY, WEEKLY, MONTHLY, ALL_TIME (padrão: ALL_TIME)
- `category` (opcional): POINTS, SALES, PURCHASES, REVIEWS (padrão: POINTS)
- `limit` (opcional): Número de usuários (padrão: 100)

**Resposta**:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "userName": "João Silva",
        "userAvatar": "url",
        "value": 5000
      }
    ],
    "userPosition": {...},
    "period": "ALL_TIME",
    "category": "POINTS"
  }
}
```

#### GET `/api/v1/gamification/badges`
Retorna todos os badges disponíveis.

**Autenticação**: Não requerida

#### GET `/api/v1/gamification/my-badges`
Retorna os badges conquistados pelo usuário.

**Autenticação**: Requerida

#### GET `/api/v1/gamification/missions`
Retorna todas as missões ativas.

**Autenticação**: Não requerida

#### GET `/api/v1/gamification/my-missions`
Retorna as missões do usuário.

**Autenticação**: Requerida

**Query Parameters**:
- `status` (opcional): Filtrar por status (ACTIVE, COMPLETED, EXPIRED, CLAIMED)

#### POST `/api/v1/gamification/missions/:missionId/claim`
Reivindica a recompensa de uma missão completada.

**Autenticação**: Requerida

### Rotas Administrativas

#### POST `/api/v1/gamification/admin/badges`
Cria um novo badge.

**Autenticação**: Admin

**Body**:
```json
{
  "name": "Nome do Badge",
  "description": "Descrição",
  "type": "FIRST_PURCHASE",
  "icon": "🏆",
  "requiredValue": 10,
  "points": 100,
  "rarity": "RARE"
}
```

#### POST `/api/v1/gamification/admin/missions`
Cria uma nova missão.

**Autenticação**: Admin

**Body**:
```json
{
  "title": "Título da Missão",
  "description": "Descrição",
  "type": "DAILY",
  "targetValue": 5,
  "pointsReward": 50,
  "icon": "🎯",
  "startDate": "2025-12-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.999Z",
  "maxCompletions": 30
}
```

#### PUT `/api/v1/gamification/admin/missions/:missionId`
Atualiza uma missão.

**Autenticação**: Admin

#### DELETE `/api/v1/gamification/admin/missions/:missionId`
Deleta uma missão.

**Autenticação**: Admin

#### GET `/api/v1/gamification/admin/stats`
Retorna estatísticas do sistema de gamificação.

**Autenticação**: Admin

**Resposta**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "totalPoints": 500000,
    "totalBadgesEarned": 2500,
    "totalMissionsCompleted": 5000,
    "averageLevel": 8
  }
}
```

## Integração

### Eventos Automaticamente Rastreados

O sistema de gamificação é automaticamente integrado com os seguintes eventos:

1. **Registro de Usuário**
   - Inicializa o perfil de gamificação
   - Local: [auth.controller.js](c:/projetos/backend/src/api/controllers/auth.controller.js)

2. **Login**
   - Atualiza streak diário
   - Local: [auth.controller.js](c:/projetos/backend/src/api/controllers/auth.controller.js)

3. **Compra Completada**
   - Adiciona pontos de compra
   - Verifica badges de compra
   - Local: [order.service.js](c:/projetos/backend/src/services/order.service.js)

4. **Venda Completada**
   - Adiciona pontos de venda
   - Verifica badges de venda
   - Local: [order.service.js](c:/projetos/backend/src/services/order.service.js)

### Adicionando Novos Eventos

Para adicionar novos eventos de gamificação:

```javascript
const gamificationService = require('../api/services/gamification.service');

// Exemplo: Ao criar uma review
gamificationService.handleReview(userId, reviewId, productId)
  .catch((err) => {
    logger.error('Failed to handle review gamification:', err);
  });

// Exemplo: Ao completar um curso
gamificationService.handleCourseCompletion(userId, productId)
  .catch((err) => {
    logger.error('Failed to handle course completion:', err);
  });
```

## Seed de Dados

Para popular o banco de dados com badges e missões iniciais:

```bash
node prisma/seeds/gamification.seed.js
```

Este comando irá:
1. Limpar dados existentes de gamificação
2. Criar 20 badges pré-configurados
3. Criar 9 missões pré-configuradas

## Modelos do Banco de Dados

### UserGamification
Armazena as estatísticas de gamificação do usuário.

### Badge
Define os badges disponíveis na plataforma.

### UserBadge
Relaciona usuários com badges conquistados.

### Mission
Define as missões disponíveis.

### UserMission
Rastreia o progresso das missões dos usuários.

### PointsHistory
Histórico de todas as transações de pontos.

### Leaderboard
Cache dos rankings para performance.

## Melhores Práticas

1. **Fire and Forget**: As chamadas de gamificação não devem bloquear operações principais
2. **Log de Erros**: Sempre log erros de gamificação sem quebrar o fluxo principal
3. **Cache**: Use o leaderboard para evitar queries pesadas
4. **Validação**: Sempre valide se o usuário existe antes de adicionar pontos
5. **Transações**: Use transações do Prisma para operações atômicas

## Próximas Funcionalidades

- [ ] Sistema de recompensas (cupons, descontos)
- [ ] Badges personalizados por administradores
- [ ] Missões dinâmicas baseadas em comportamento
- [ ] Sistema de conquistas secretas
- [ ] Notificações push para novos badges/níveis
- [ ] Compartilhamento social de conquistas
- [ ] Torneios e eventos especiais
- [ ] Sistema de times/guildas

## Suporte

Para dúvidas ou sugestões sobre o sistema de gamificação, entre em contato com a equipe de desenvolvimento.
