import re

# Ler o arquivo
with open('schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Adicionar orderBumps ao User (após combos)
user_pattern = r'(  combos\s+Combo\[\]\s+@relation\("ProducerCombos"\))'
user_replacement = r'\1\n  orderBumps              OrderBump[] @relation("ProducerOrderBumps")'
content = re.sub(user_pattern, user_replacement, content)

# 2. Adicionar orderBumps ao Product (após reviews)
product_pattern = r'(  reviews\s+Review\[\])'
product_replacement = r'\1\n  orderBumps          OrderBump[] @relation("OrderBumpProduct")'
content = re.sub(product_pattern, product_replacement, content)

# 3. Adicionar enum e modelo OrderBump antes de GAMIFICATION
gamification_comment = '// ========================================\n// GAMIFICATION MODELS\n// ========================================'

order_bump_section = '''// ========================================
// ORDER BUMP MODELS
// ========================================

enum OrderBumpTrigger {
  CATEGORY        // Mostrar para produtos de categoria X
  PRODUCT         // Mostrar quando produto Y está no carrinho
  ANY             // Mostrar sempre (universal)
}

model OrderBump {
  id              String            @id @default(uuid())

  // Produto que será oferecido como bump
  productId       String
  product         Product           @relation("OrderBumpProduct", fields: [productId], references: [id], onDelete: Cascade)

  // Configuração do bump
  title           String            // Ex: "Adicione este curso agora!"
  description     String            @db.Text // Descrição persuasiva
  discountPercent Float             @default(0) // Desconto opcional (ex: 20 = 20% off)

  // Regras de exibição
  triggerType     OrderBumpTrigger  @default(CATEGORY)
  triggerValues   String[]          @default([]) // IDs de categorias ou produtos

  // Controle
  producerId      String
  producer        User              @relation("ProducerOrderBumps", fields: [producerId], references: [id], onDelete: Cascade)
  isActive        Boolean           @default(true)
  priority        Int               @default(0) // Ordem de exibição (maior = mais prioritário)

  // Analytics
  impressions     Int               @default(0) // Quantas vezes foi mostrado
  clicks          Int               @default(0) // Quantas vezes foi clicado
  conversions     Int               @default(0) // Quantas vezes resultou em compra
  revenue         Float             @default(0) // Receita total gerada

  // Timestamps
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([producerId])
  @@index([isActive])
  @@index([triggerType])
  @@map("order_bumps")
}

'''

content = content.replace(gamification_comment, order_bump_section + gamification_comment)

# Escrever o arquivo
with open('schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema atualizado com sucesso!")
