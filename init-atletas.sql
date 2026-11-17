DROP TABLE IF EXISTS atletas CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE atletas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE
);

INSERT INTO categorias (id, nome, descricao) VALUES
(1, 'E-BIKE', 'Atletas com bicicletas assistidas por motor elétrico'),
(2, 'ELITE FEMININO', 'Atletas profissionais femininas - Alto rendimento'),
(3, 'ELITE MASCULINO', 'Atletas profissionais masculinos - Alto rendimento'),
(4, 'MASTER A1', 'Masculino 30 a 34 anos'),
(5, 'MASTER A2', 'Masculino 35 a 39 anos'),
(6, 'MASTER B1', 'Masculino 40 a 44 anos'),
(7, 'MASTER B2', 'Masculino 45 a 49 anos'),
(8, 'MASTER C1', 'Masculino 50 a 54 anos'),
(9, 'MASTER C2', 'Masculino 55 a 59 anos'),
(10, 'SUB 30', 'Masculino 23 a 29 anos'),
(11, 'JUNIOR', 'Masculino 17 a 18 anos'),
(12, 'MASTER D', 'Masculino 60 anos ou mais'),
(13, 'MASTER FEMININO', 'Feminino 30 anos ou mais'),
(14, 'SPORT A', 'Iniciantes Masculino 18 a 29 anos'),
(15, 'SPORT B', 'Iniciantes Masculino 30 a 39 anos'),
(16, 'SPORT C', 'Iniciantes Masculino 40 a 49 anos'),
(17, 'SPORT D', 'Iniciantes Masculino 50+ anos'),
(18, 'PESO PESADO 90KG', 'Atletas com peso corporal a partir de 90kg'),
(19, 'PESO PESADO 100KG', 'Atletas com peso corporal a partir de 100kg'),
(20, 'PNE', 'Portadores de Necessidades Especiais'),
(21, 'SPORT FEMININO', 'Iniciantes Feminino Geral'),
(22, 'SPORT A FEM', 'Iniciantes Feminino até 29 anos'),
(23, 'SPORT B FEM', 'Iniciantes Feminino 30 a 39 anos'),
(24, 'SPORT C FEM', 'Iniciantes Feminino 40 a 49 anos'),
(25, 'SPORT D FEM', 'Iniciantes Feminino 50+ anos'),
(26, 'DUPLA MISTA', 'Duplas formadas por um homem e uma mulher'),
(27, 'CICLOTURISMO', 'Categoria passeio sem fins competitivos de pódio');

INSERT INTO atletas (id, nome, categoria_id) VALUES
(1, 'Guilherme Mendes', 1),
(2, 'Vitor Ferreira', 1),
(3, 'Felipe Nascimento', 1),
(4, 'Diego Barbosa', 1),
(5, 'Flávia Costa', 2),
(6, 'Juliet Oliveira', 2),
(7, 'Camila Santos', 2),
(8, 'Beatriz Martins', 2),
(9, 'Priscila Fernandes', 2),
(10, 'Marcelo Lopes', 3),
(11, 'Eduardo Gomes', 3),
(12, 'Thiago Rocha', 3),
(13, 'Gustavo Silva', 3),
(14, 'Caio Souza', 3),
(15, 'Rodrigo Alves', 4),
(16, 'Daniel Lima', 4),
(17, 'Henrique Moura', 4),
(18, 'Bruno Ribeiro', 4),
(19, 'Igor Cardoso', 4),
(20, 'Lucas Moreira', 5),
(21, 'Otávio Carvalho', 5),
(22, 'Enzo Pereira', 5),
(23, 'Renan Dias', 5),
(24, 'Alexandre Vieira', 5),
(25, 'Fábio Soares', 6),
(26, 'Murilo Nunes', 6),
(27, 'Vinicius Teixeira', 6),
(28, 'Leonardo Marques', 6),
(29, 'Rafael Barbosa', 6),
(30, 'João Rodrigues', 7),
(31, 'Luiz Martins', 7),
(32, 'Vitor Rocha', 7),
(33, 'André Nascimento', 7),
(34, 'Diego Gomes', 7),
(35, 'Bernardo Costa', 8),
(36, 'Samuel Ribeiro', 8),
(37, 'Felipe Lopes', 8),
(38, 'Paulo Souza', 8),
(39, 'Mateus Silva', 8),
(40, 'Gabriel Pereira', 9),
(41, 'Caio Alves', 9),
(42, 'Guilherme Moura', 9),
(43, 'Thiago Fernandes', 9),
(44, 'Igor Dias', 9),
(45, 'Henrique Santos', 10),
(46, 'Lucas Oliveira', 10),
(47, 'Murilo Lima', 10),
(48, 'Marcelo Carvalho', 10),
(49, 'Bruno Nunes', 10),
(50, 'Enzo Teixeira', 11),
(51, 'Daniel Marques', 11),
(52, 'Rafael Mendes', 11),
(53, 'Renan Soares', 11),
(54, 'Otávio Ferreira', 11),
(55, 'Fábio Cardoso', 12),
(56, 'Gustavo Vieira', 12),
(57, 'Luiz Moreira', 12),
(58, 'Bernardo Rocha', 12),
(59, 'Eduardo Silva', 12),
(60, 'Fernanda Costa', 13),
(61, 'Patrícia Ribeiro', 13),
(62, 'Larissa Alves', 13),
(63, 'Amanda Nascimento', 13),
(64, 'Carolina Lima', 13),
(65, 'João Santos', 14),
(66, 'Gabriel Souza', 14),
(67, 'Vitor Martins', 14),
(68, 'Paulo Gomes', 14),
(69, 'Samuel Pereira', 14),
(70, 'Mateus Lopes', 15),
(71, 'Diego Moura', 15),
(72, 'Rodrigo Carvalho', 15),
(73, 'Felipe Fernandes', 15),
(74, 'Guilherme Dias', 15),
(75, 'Igor Oliveira', 16),
(76, 'Bruno Silva', 16),
(77, 'Daniel Ferreira', 16),
(78, 'Henrique Nunes', 16),
(79, 'Lucas Soares', 16),
(80, 'Alexandre Ribeiro', 17),
(81, 'Caio Marques', 17),
(82, 'Eduardo Mendes', 17),
(83, 'Gustavo Vieira', 17),
(84, 'Marcelo Rocha', 17),
(85, 'Murilo Costa', 18),
(86, 'Otávio Barbosa', 18),
(87, 'Renan Santos', 18),
(88, 'Enzo Lima', 18),
(89, 'Rafael Moreira', 18),
(90, 'Thiago Pereira', 19),
(91, 'Vinicius Alves', 19),
(92, 'Bernardo Gomes', 19),
(93, 'Fábio Lopes', 19),
(94, 'Luiz Moura', 19),
(95, 'André Carvalho', 20),
(96, 'Paulo Martins', 20),
(97, 'Samuel Souza', 20),
(98, 'Vitor Fernandes', 20),
(99, 'Gabriel Silva', 20),
(100, 'Mariana Oliveira', 21),
(101, 'Júlia Nascimento', 21),
(102, 'Letícia Dias', 21),
(103, 'Aline Ferreira', 21),
(104, 'Vanessa Marques', 21),
(105, 'Renata Soares', 22),
(106, 'Daniela Ribeiro', 22),
(107, 'Gabriela Rocha', 22),
(108, 'Isabela Mendes', 22),
(109, 'Tatiana Costa', 22),
(110, 'Adriana Vieira', 23),
(111, 'Bianca Santos', 23),
(112, 'Cecília Lima', 23),
(113, 'Débora Pereira', 23),
(114, 'Elisa Alves', 23),
(115, 'Giovanna Gomes', 24),
(116, 'Helena Lopes', 24),
(117, 'Luana Carvalho', 24),
(118, 'Monique Barbosa', 24),
(119, 'Natalia Souza', 24),
(120, 'Paula Martins', 25),
(121, 'Sara Fernandes', 25),
(122, 'Priscila Moura', 25),
(123, 'Carla Moreira', 25),
(124, 'Bruna Nunes', 25),
(125, 'Dupla Lucas & Mariana', 26),
(126, 'Dupla Gabriel & Camila', 26),
(127, 'Dupla Rodrigo & Beatriz', 26),
(128, 'Dupla Mateus & Larissa', 26),
(129, 'Dupla Guilherme & Fernanda', 26),
(130, 'Caio Teixeira', 27),
(131, 'Igor Ribeiro', 27),
(132, 'Marcelo Dias', 27),
(133, 'Enzo Alves', 27),
(134, 'Renan Santos', 27),
(135, 'Paulo Rocha', 27),
(136, 'Jonas Vingegaard', 1),
(137, 'Tadej Pogačar', 1),
(138, 'Wout van Aert', 1),
(139, 'Mathieu van der Poel', 1),
(140, 'Remco Evenepoel', 1),
(141, 'Ana Paula Silva', 2),
(142, 'Raquel Viana', 2),
(143, 'Sabrina Costa', 2),
(144, 'Fernando Alonso', 3),
(145, 'Ayrton Senna', 3),
(146, 'Rubens Barrichello', 3),
(147, 'Felipe Massa', 3),
(148, 'Nelson Piquet', 3),
(149, 'Emerson Fittipaldi', 3),
(150, 'Christian Fittipaldi', 3),
(151, 'Carlos Eduardo', 4),
(152, 'Roberto Carlos', 4),
(153, 'Rivaldo Ferreira', 4),
(154, 'Ronaldo Nazário', 4),
(155, 'Ronaldinho Gaúcho', 4),
(156, 'Kaká', 5),
(157, 'Cafu', 5),
(158, 'Dida', 5),
(159, 'Lúcio', 5),
(160, 'Gilberto Silva', 5),
(161, 'Marcos Castro', 14),
(162, 'Fábio Porchat', 14),
(163, 'Gregório Duvivier', 14),
(164, 'João Vicente', 14),
(165, 'Antonio Tabet', 14),
(166, 'Danilo Gentili', 15),
(167, 'Rafinha Bastos', 15),
(168, 'Marcelo Tas', 15),
(169, 'Oscar Filho', 15),
(170, 'Felipe Andreoli', 15),
(171, 'Fernanda Montenegro', 21),
(172, 'Laura Cardoso', 21),
(173, 'Glória Pires', 21),
(174, 'Marieta Severo', 21),
(175, 'Lília Cabral', 21),
(176, 'Suzana Vieira', 21),
(177, 'Regina Duarte', 21),
(178, 'Cláudia Raia', 21),
(179, 'Tony Ramos', 21),
(180, 'Antônio Fagundes', 21),
(181, 'Dupla Marcos & Belutti', 26),
(182, 'Dupla Jorge & Mateus', 26),
(183, 'Dupla Henrique & Juliano', 26),
(184, 'Dupla Zé Neto & Cristiano', 26),
(185, 'Dupla Chitãozinho & Xororó', 26),
(186, 'Dupla Bruno & Marrone', 26),
(187, 'Dupla Zezé Di Camargo & Luciano', 26),
(188, 'Dupla Victor & Leo', 26),
(189, 'Dupla Fernando & Sorocaba', 26),
(190, 'Dupla Thaeme & Thiago', 26),
(191, 'José Wilker', 27),
(192, 'Tarcísio Meira', 27),
(193, 'Paulo José', 27),
(194, 'Lima Duarte', 27),
(195, 'Francisco Cuoco', 27),
(196, 'Juca de Oliveira', 27),
(197, 'Ary Fontoura', 27),
(198, 'Stênio Garcia', 27),
(199, 'Milton Gonçalves', 27),
(200, 'Osmar Prado', 27);

-- =====================================================================
-- MTBExpert - Enriquecimento do banco de atletas
-- Novas colunas, regras estruturadas de enquadramento e dados esportivos
-- Temporada de referencia: 2026
-- =====================================================================

ALTER TABLE categorias
    ADD COLUMN IF NOT EXISTS sexo         CHAR(1),
    ADD COLUMN IF NOT EXISTS idade_min    INT,
    ADD COLUMN IF NOT EXISTS idade_max    INT,
    ADD COLUMN IF NOT EXISTS peso_min     NUMERIC(5,1),
    ADD COLUMN IF NOT EXISTS peso_max     NUMERIC(5,1),
    ADD COLUMN IF NOT EXISTS nivel        VARCHAR(10),
    ADD COLUMN IF NOT EXISTS exige_pcd    BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS exige_ebike  BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS exige_dupla  BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS competitiva  BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE categorias SET idade_min = 18, exige_ebike = TRUE                          WHERE id = 1;  -- E-BIKE
UPDATE categorias SET sexo = 'F', idade_min = 19, nivel = 'ELITE'                 WHERE id = 2;  -- ELITE FEMININO
UPDATE categorias SET sexo = 'M', idade_min = 19, nivel = 'ELITE'                 WHERE id = 3;  -- ELITE MASCULINO
UPDATE categorias SET sexo = 'M', idade_min = 30, idade_max = 34                  WHERE id = 4;  -- MASTER A1
UPDATE categorias SET sexo = 'M', idade_min = 35, idade_max = 39                  WHERE id = 5;  -- MASTER A2
UPDATE categorias SET sexo = 'M', idade_min = 40, idade_max = 44                  WHERE id = 6;  -- MASTER B1
UPDATE categorias SET sexo = 'M', idade_min = 45, idade_max = 49                  WHERE id = 7;  -- MASTER B2
UPDATE categorias SET sexo = 'M', idade_min = 50, idade_max = 54                  WHERE id = 8;  -- MASTER C1
UPDATE categorias SET sexo = 'M', idade_min = 55, idade_max = 59                  WHERE id = 9;  -- MASTER C2
UPDATE categorias SET sexo = 'M', idade_min = 23, idade_max = 29                  WHERE id = 10; -- SUB 30
UPDATE categorias SET sexo = 'M', idade_min = 17, idade_max = 18                  WHERE id = 11; -- JUNIOR
UPDATE categorias SET sexo = 'M', idade_min = 60                                  WHERE id = 12; -- MASTER D
UPDATE categorias SET sexo = 'F', idade_min = 30                                  WHERE id = 13; -- MASTER FEMININO
UPDATE categorias SET sexo = 'M', idade_min = 18, idade_max = 29, nivel = 'INICIANTE' WHERE id = 14; -- SPORT A
UPDATE categorias SET sexo = 'M', idade_min = 30, idade_max = 39, nivel = 'INICIANTE' WHERE id = 15; -- SPORT B
UPDATE categorias SET sexo = 'M', idade_min = 40, idade_max = 49, nivel = 'INICIANTE' WHERE id = 16; -- SPORT C
UPDATE categorias SET sexo = 'M', idade_min = 50, nivel = 'INICIANTE'             WHERE id = 17; -- SPORT D
UPDATE categorias SET idade_min = 18, peso_min = 90.0, peso_max = 99.9            WHERE id = 18; -- PESO PESADO 90KG
UPDATE categorias SET idade_min = 18, peso_min = 100.0                            WHERE id = 19; -- PESO PESADO 100KG
UPDATE categorias SET idade_min = 16, exige_pcd = TRUE                            WHERE id = 20; -- PNE
UPDATE categorias SET sexo = 'F', idade_min = 18, nivel = 'INICIANTE'             WHERE id = 21; -- SPORT FEMININO
UPDATE categorias SET sexo = 'F', idade_min = 18, idade_max = 29, nivel = 'INICIANTE' WHERE id = 22; -- SPORT A FEM
UPDATE categorias SET sexo = 'F', idade_min = 30, idade_max = 39, nivel = 'INICIANTE' WHERE id = 23; -- SPORT B FEM
UPDATE categorias SET sexo = 'F', idade_min = 40, idade_max = 49, nivel = 'INICIANTE' WHERE id = 24; -- SPORT C FEM
UPDATE categorias SET sexo = 'F', idade_min = 50, nivel = 'INICIANTE'             WHERE id = 25; -- SPORT D FEM
UPDATE categorias SET sexo = 'X', idade_min = 18, exige_dupla = TRUE              WHERE id = 26; -- DUPLA MISTA
UPDATE categorias SET idade_min = 16, competitiva = FALSE                         WHERE id = 27; -- CICLOTURISMO

ALTER TABLE atletas
    ADD COLUMN IF NOT EXISTS data_nascimento DATE,
    ADD COLUMN IF NOT EXISTS sexo            CHAR(1),
    ADD COLUMN IF NOT EXISTS peso_kg         NUMERIC(5,1),
    ADD COLUMN IF NOT EXISTS pcd             BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ebike           BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS nivel           VARCHAR(10) NOT NULL DEFAULT 'AMADOR',
    ADD COLUMN IF NOT EXISTS tipo_inscricao  VARCHAR(10) NOT NULL DEFAULT 'INDIVIDUAL';

WITH perfil AS (
    SELECT
        a.id,
        c.idade_min + ((a.id * 7) % (COALESCE(c.idade_max, c.idade_min + 12) - c.idade_min + 1)) AS idade,
        CASE
            WHEN c.peso_min IS NOT NULL
                THEN c.peso_min + ((a.id * 13) % (COALESCE(c.peso_max, c.peso_min + 15) - c.peso_min)::INT) + (a.id % 10) / 10.0
            WHEN c.sexo = 'F' THEN 52 + ((a.id * 13) % 18) + (a.id % 10) / 10.0
            ELSE 64 + ((a.id * 13) % 22) + (a.id % 10) / 10.0
        END AS peso,
        c.sexo AS cat_sexo,
        c.nivel AS cat_nivel,
        c.exige_pcd AS cat_pcd,
        c.exige_ebike AS cat_ebike,
        c.exige_dupla AS cat_dupla
    FROM atletas a
    JOIN categorias c ON c.id = a.categoria_id
)
UPDATE atletas a SET
    data_nascimento = make_date(2026 - p.idade, 1 + (a.id * 5) % 12, 1 + (a.id * 11) % 28),
    sexo            = COALESCE(p.cat_sexo, 'M'),
    peso_kg         = p.peso,
    pcd             = p.cat_pcd,
    ebike           = p.cat_ebike,
    nivel           = COALESCE(p.cat_nivel, 'AMADOR'),
    tipo_inscricao  = CASE WHEN p.cat_dupla THEN 'DUPLA' ELSE 'INDIVIDUAL' END
FROM perfil p
WHERE p.id = a.id;

-- Casos de auditoria/irregularidades intencionais para teste do Comissario Virtual
UPDATE atletas SET sexo = 'M' WHERE id IN (181, 182, 183, 184, 185, 186, 187, 188, 189);
UPDATE atletas SET data_nascimento = DATE '2005-03-10' WHERE id = 54;
UPDATE atletas SET peso_kg = 86.4 WHERE id = 89;
UPDATE atletas SET ebike = TRUE WHERE id = 150;
UPDATE atletas SET pcd = FALSE WHERE id = 99;
UPDATE atletas SET nivel = 'ELITE' WHERE id = 161;
