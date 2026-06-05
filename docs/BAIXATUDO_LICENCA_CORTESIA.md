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

## Correcao operacional em 02/06/2026

Foi identificado erro 500 ao gerar cortesia em producao. A causa provavel era tabela antiga de licencas sem todas as colunas usadas pelo fluxo atual.

Foi ajustado:

- o script de inicializacao do backend agora garante as colunas da tabela `IrpLicense` com `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`;
- o script tambem garante as colunas da tabela `IrpLicenseEvent`;
- o envio de email de cortesia nao bloqueia mais a criacao da licenca, caso o provedor de email falhe;
- o backend registra log detalhado com `Courtesy license generation failed` quando ainda houver erro.

Depois do deploy, se a tela `/admin/extensions` ainda mostrar erro, consultar os logs do backend no Render procurando por:

```text
Courtesy license generation failed
```

## Pacotes Chrome e Firefox

Nao misturar os pacotes:

- Chrome / Chrome Web Store: usar pacote Manifest V3 com `background.service_worker`;
- Firefox: usar pacote proprio com `background.scripts`.

Se carregar o pacote do Firefox no Chrome, o Chrome mostra erro parecido com:

```text
'background.scripts' requires manifest version of 2 or lower
```

Esse erro nao e da licenca nem da cortesia. Ele significa apenas que o pacote errado foi carregado no navegador errado.
