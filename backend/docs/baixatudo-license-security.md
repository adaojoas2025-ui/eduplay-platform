# BaixaTudo - regras de licenca

Atualizado em: 21/06/2026

## Vinculo de dispositivo

- Uma chave `BT-...` e vinculada ao primeiro `deviceId` que a ativa.
- Nova ativacao com outro `deviceId` deve retornar `valid: false` e `reason: device_changed`.
- A tentativa rejeitada nao pode substituir `activeDeviceId`.
- Liberacao ou troca de dispositivo deve ser feita pelo administrador.

## Cortesia

- Cada emissao de cortesia do BaixaTudo cria uma chave nova.
- O vencimento e calculado a partir do instante da emissao.
- Uma cortesia de `1 dia` vence exatamente 24 horas depois.
- Gerar nova cortesia nao renova nem amplia uma chave antiga.

## Separacao da IRP Master

A regra estrita e ativada somente pela rota do BaixaTudo com `strictDeviceBinding: true`. O fluxo de ativacao e renovacao da IRP Master permanece inalterado.

## Testes

Execute:

```powershell
node --test backend\tests\baixatudo-license-fix.test.js
```