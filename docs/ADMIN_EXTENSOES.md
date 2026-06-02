# Admin de Extensoes - EducaplayJA

Data: 02/06/2026

Esta documentacao registra a area administrativa criada para extensoes do EducaplayJA. Ela foi separada do fluxo de vendedor e financeiro para evitar confusao entre os dois menus de Admin.

## Local correto

Frontend:

```text
/admin/extensions
```

Backend:

```text
/api/v1/admin/extensions
```

A rota e protegida por login e perfil `ADMIN`. Ela nao faz parte do painel de vendedor, nao fica em `/seller` e nao deve ser usada para produtos comuns do marketplace.

## Objetivo

Centralizar extensoes como o BaixaTudo em uma area propria, preparada para crescer quando novas extensoes forem publicadas.

Hoje a primeira extensao cadastrada e:

```text
BaixaTudo
Prefixo de licenca: BT
Pagina publica: https://educaplayja.com.br/baixatudo
```

## Cortesia BaixaTudo

O Admin pode gerar ou renovar uma licenca de cortesia para um usuario sem pagamento. Isso serve para presente, suporte, teste interno, avaliador, parceria ou liberacao propria do administrador.

Endpoint:

```text
POST /api/v1/admin/extensions/baixatudo/courtesy-licenses
```

Payload:

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

Regras atuais:

- minimo: 1 hora;
- maximo: 10 anos;
- motivo obrigatorio;
- email valido obrigatorio;
- se o email ja tiver licenca BT, a licenca e renovada;
- se nao tiver, uma nova licenca BT e criada;
- o email de licenca e enviado automaticamente quando `sendEmail` for verdadeiro.

## Auditoria

A cortesia grava notas na licenca com:

```text
source:courtesy
product:baixatudo
admin:<email do admin>
admin_id:<id do admin>
duration:<prazo escolhido>
reason:<motivo>
```

Isso diferencia cortesia de venda Mercado Pago.

## Relacao com a extensao

A extensao BaixaTudo nao gera cortesia e nao recebe senha administrativa. A cortesia e criada no backend do EducaplayJA.

Implementar cortesia no site nao exige novo pacote da extensao, desde que a extensao ja valide licencas `BT` pelo backend. O pacote so precisa mudar se futuramente for desejado ativar a cortesia automaticamente sem o usuario colar chave ou sem sincronizacao existente.

---

## Atualizacao de acesso visual em 02/06/2026

O atalho da area de extensoes foi colocado no Admin Dashboard em:

```text
Admin Dashboard > Acoes Rapidas > BT Extensoes / Licencas cortesia
```

Link direto:

```text
https://educaplayja.com.br/#/admin/extensions
```

Observacao importante:

O atalho nao foi colocado no menu suspenso do usuario Admin, porque esse menu tambem exibe opcoes ligadas ao vendedor e ao financeiro. Para evitar confusao entre os dois Admins, a area de extensoes fica centralizada em `Acoes Rapidas` no dashboard administrativo interno.

Commit relacionado:

```text
f6873c2 chore: surface admin extensions shortcut
```
