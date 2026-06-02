# BaixaTudo - Licenca cortesia administrativa

Data: 02/06/2026

Este documento registra como deve funcionar a geracao de licencas BaixaTudo de presente, cortesia, suporte ou teste interno no EducaplayJA.

## Estado atual

O BaixaTudo Pro ja possui fluxo automatico de pagamento:

1. Usuario acessa `https://educaplayja.com.br/baixatudo`.
2. Escolhe plano mensal ou anual.
3. Mercado Pago confirma o pagamento.
4. Webhook do backend cria ou renova uma licenca `BT-...`.
5. A extensao sincroniza a licenca automaticamente pelo `deviceId`.
6. A chave tambem pode ser usada manualmente como recuperacao.

A criacao manual comum esta bloqueada para BaixaTudo. As rotas antigas de administracao nao devem criar `BT`, para evitar liberar produto pago sem controle.

## Necessidade

O administrador pode precisar dar uma licenca para alguem sem pagamento, por exemplo:

- presente;
- teste controlado;
- parceria;
- compensacao de suporte;
- demonstracao para avaliador;
- ativacao propria do administrador.

Esse caso nao e venda. Deve ser registrado como cortesia.

## Regra oficial

Venda comercial:

```text
source = mercadopago
```

Cortesia administrativa:

```text
source = courtesy
```

A cortesia deve continuar usando chave com prefixo BaixaTudo:

```text
BT-XXXX-XXXX-XXXX-XXXX
```

Mas precisa de nota/evento identificando que foi criada manualmente por administrador.

## Fluxo recomendado

1. Administrador logado no EducaplayJA acessa o painel de licencas.
2. Clica em `Gerar cortesia BaixaTudo`.
3. Informa email do usuario.
4. Escolhe prazo: 30 dias, 365 dias ou personalizado.
5. Informa motivo obrigatorio.
6. Backend gera ou renova uma licenca `BT`.
7. Backend registra evento de auditoria.
8. Backend envia email com chave e validade.
9. Usuario ativa pela extensao ou sincroniza quando houver recurso de sincronizacao por email.

## Endpoint sugerido

```text
POST /api/v1/baixatudo/admin/courtesy-license
```

Autenticacao obrigatoria:

```text
JWT de administrador EducaplayJA
```

Payload:

```json
{
  "email": "usuario@email.com",
  "days": 365,
  "reason": "presente do administrador",
  "sendEmail": true
}
```

Resposta:

```json
{
  "ok": true,
  "source": "courtesy",
  "licenseKey": "BT-XXXX-XXXX-XXXX-XXXX",
  "expiresAt": "2027-06-02T00:00:00.000Z"
}
```

## Auditoria obrigatoria

Registrar no minimo:

```text
licenseId
email
adminUserId
adminEmail
reason
days
source = courtesy
createdAt
```

Evento sugerido:

```text
courtesy:created
```

## O que nao fazer

- Nao colocar senha de administrador dentro da extensao.
- Nao liberar cortesia pela extensao.
- Nao usar `ADMIN_SECRET` como fluxo principal.
- Nao misturar cortesia com pagamento aprovado.
- Nao gerar cortesia sem motivo e prazo.
- Nao usar a rota antiga `/api/v1/licenses/admin/create` para prefixo `BT`.

## Relacao com pagamento automatico

O fluxo de pagamento automatico continua sendo o oficial para clientes pagantes. A cortesia e uma excecao administrativa rastreada.

Isso permite presentear usuarios sem quebrar a logica comercial do BaixaTudo e sem depender de senha manual na extensao.
