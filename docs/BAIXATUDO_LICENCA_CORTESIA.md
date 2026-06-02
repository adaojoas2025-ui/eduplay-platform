# BaixaTudo - Licenca cortesia administrativa

Data: 02/06/2026

Este documento registra como funciona a geracao de licencas BaixaTudo de presente, cortesia, suporte ou teste interno no EducaplayJA.

## Estado atual

O BaixaTudo Pro possui fluxo automatico de pagamento:

1. Usuario acessa `https://educaplayja.com.br/baixatudo`.
2. Escolhe plano mensal ou anual.
3. Mercado Pago confirma o pagamento.
4. Webhook do backend cria ou renova uma licenca `BT-...`.
5. A extensao sincroniza a licenca automaticamente pelo `deviceId` quando o fluxo de pagamento retorna ao site.
6. A chave tambem pode ser usada manualmente como recuperacao.

A cortesia administrativa tambem foi implementada, mas somente dentro do Admin interno do EducaplayJA.

## Local correto

Tela administrativa:

```text
/admin/extensions
```

Endpoint:

```text
POST /api/v1/admin/extensions/baixatudo/courtesy-licenses
```

Esta rota fica no Admin interno. Ela nao pertence ao menu financeiro do vendedor e nao deve ser confundida com `/seller`.

## Quando usar cortesia

O administrador pode dar uma licenca sem pagamento para:

- presente;
- teste controlado;
- parceria;
- compensacao de suporte;
- demonstracao para avaliador;
- ativacao propria do administrador.

Esse caso nao e venda. Ele deve ser registrado como cortesia.

## Regra oficial

Venda comercial:

```text
source = mercadopago
```

Cortesia administrativa:

```text
source = courtesy
```

A cortesia continua usando chave com prefixo BaixaTudo:

```text
BT-XXXX-XXXX-XXXX-XXXX
```

## Fluxo implementado

1. Administrador logado acessa `/admin/extensions`.
2. Seleciona BaixaTudo.
3. Informa email do usuario.
4. Escolhe prazo por horas, dias, meses ou anos.
5. Informa motivo obrigatorio.
6. Backend cria ou renova uma licenca `BT`.
7. Backend registra a origem como cortesia nas notas da licenca.
8. Backend envia email com chave e validade, se a opcao de email estiver marcada.

## Payload

```json
{
  "email": "usuario@email.com",
  "durationValue": 30,
  "durationUnit": "days",
  "reason": "presente do administrador",
  "sendEmail": true
}
```

Unidades aceitas:

```text
hours
days
months
years
```

Limites:

```text
minimo: 1 hora
maximo: 10 anos
```

## Resposta esperada

```json
{
  "success": true,
  "message": "Licenca cortesia criada com sucesso.",
  "data": {
    "source": "courtesy",
    "extension": "baixatudo",
    "product": "baixatudo",
    "email": "usuario@email.com",
    "licenseKey": "BT-XXXX-XXXX-XXXX-XXXX",
    "expiresAt": "2026-07-02T00:00:00.000Z",
    "status": "ACTIVE",
    "renewed": false,
    "emailSent": true,
    "duration": {
      "value": 30,
      "unit": "days",
      "days": 30,
      "label": "30 dias"
    }
  }
}
```

## Auditoria

As notas da licenca registram:

```text
source:courtesy
product:baixatudo
admin:<email do admin>
admin_id:<id do admin>
duration:<prazo escolhido>
reason:<motivo informado>
```

## O que nao fazer

- Nao colocar senha de administrador dentro da extensao.
- Nao liberar cortesia pela extensao.
- Nao usar `ADMIN_SECRET` como fluxo principal.
- Nao misturar cortesia com pagamento aprovado.
- Nao gerar cortesia sem motivo e prazo.
- Nao usar a rota antiga `/api/v1/licenses/admin/create` para prefixo `BT`.

## Precisa subir nova extensao?

Para gerar cortesia no EducaplayJA, nao precisa subir outro pacote da extensao. A extensao continua validando a chave `BT` pelo backend.

So sera necessario novo pacote se a regra visual ou a ativacao automatica dentro da extensao mudar.
