-- ===============================================
-- 🙏 EXEMPLOS DE INTERCESSÕES PARA TESTE
-- ===============================================
-- IMPORTANTE: Altere o user_id para o ID do seu usuário!

-- Para descobrir seu user_id, execute:
-- SELECT id, name, email FROM users;

-- ===============================================
-- Inserir intercessões de exemplo (user_id = 1)
-- ===============================================

INSERT INTO intercessions (user_id, title, content, display_order)
VALUES
  (
    1,
    'Pela Família',
    'Senhor Jesus, intercedo por minha família para que sejam protegidos por Ti em todos os momentos. Que Tua paz reine em nossos corações e em nosso lar.

Protege meus pais, irmãos e todos os meus familiares. Guarda-os de todo mal e perigo.

Que nossa família seja sempre unida pelo amor de Deus.

Amém.',
    0
  ),
  (
    1,
    'Pelos Doentes',
    'Pai misericordioso, intercedo por todos os enfermos, especialmente aqueles que não têm quem reze por eles.

Derrama sobre eles Tua graça curadora. Consola os que sofrem e dá forças aos que cuidam deles.

Maria, Saúde dos Enfermos, rogai por eles!

Amém.',
    1
  ),
  (
    1,
    'Pelos Necessitados',
    'Deus providente, intercedo pelos que passam necessidade, pelos que não têm o pão de cada dia, pelos que não têm casa nem família.

Toca o coração dos que podem ajudar e multiplica os recursos para que ninguém falte o necessário.

Que eu possa ser instrumento de Tua caridade.

Amém.',
    2
  ),
  (
    1,
    'Pela Igreja',
    'Senhor Jesus, intercedo pela Santa Igreja, por nosso Papa, bispos, padres e religiosos.

Protege a Igreja de todo mal e divisão. Que o Espírito Santo ilumine nossos pastores e guie o povo de Deus.

Que a Igreja seja sempre fiel ao Evangelho.

Amém.',
    3
  ),
  (
    1,
    'Pelas Vocações',
    'Senhor da messe, intercedo pelas vocações sacerdotais e religiosas.

Chama muitos jovens para Te servirem de modo especial. Dá-lhes coragem para responderem "sim" ao Teu chamado.

Protege os seminaristas e noviços em sua formação.

Amém.',
    4
  );

-- ===============================================
-- Verificar as intercessões inseridas
-- ===============================================

SELECT
  id,
  title,
  LEFT(content, 80) || '...' as preview,
  display_order,
  created_at
FROM intercessions
WHERE user_id = 1
ORDER BY display_order;

-- ===============================================
-- Exemplos de operações CRUD
-- ===============================================

-- 1. Listar todas
SELECT * FROM intercessions WHERE user_id = 1 ORDER BY display_order;

-- 2. Adicionar nova
INSERT INTO intercessions (user_id, title, content, display_order)
VALUES (1, 'Pelos Jovens', 'Senhor, intercedo pelos jovens...', 5);

-- 3. Atualizar
UPDATE intercessions
SET title = 'Pela Família (atualizado)',
    content = 'Novo conteúdo aqui...'
WHERE id = 1 AND user_id = 1;

-- 4. Deletar
-- DELETE FROM intercessions WHERE id = 1 AND user_id = 1;

-- 5. Reordenar (mover ID 3 para primeira posição)
UPDATE intercessions SET display_order = 0 WHERE id = 3 AND user_id = 1;
UPDATE intercessions SET display_order = 1 WHERE id = 1 AND user_id = 1;
UPDATE intercessions SET display_order = 2 WHERE id = 2 AND user_id = 1;

-- ===============================================
-- Limpar todas as intercessões de um usuário
-- ===============================================
-- DELETE FROM intercessions WHERE user_id = 1;
