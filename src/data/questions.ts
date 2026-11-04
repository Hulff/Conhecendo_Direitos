// ============================================================
// BANCO DE PERGUNTAS — fonte única de verdade do quiz.
// Para editar: altere texto, alternativas, `answer` ou `basis` abaixo e mantenha
// a referência correspondente no mapa SOURCES.
// Nenhum outro arquivo deve conter perguntas.
//
// ATENÇÃO: o gabarito do PDF original tinha erros. Itens corrigidos
// (marcados com `corrigido: true`) devem passar por revisão jurídica:
//   trabalho: 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30
//   consumidor: 26, 29
// ============================================================

export type Area = "consumidor" | "trabalho";
export type Level = "facil" | "medio" | "dificil";
export type Letter = "A" | "B" | "C";

export interface Source {
    label: string;
    url: string;
}

export const POINTS: Record<Level, number> = { facil: 1, medio: 2, dificil: 3 };

export interface Question {
    id: string;
    area: Area;
    level: Level;
    points: number;
    text: string;
    options: [string, string, string]; // A, B, C
    answer: Letter;
    basis: string; // fundamento legal exibido ao mediador
    source?: Source;
    corrigido?: boolean; // gabarito diferente do PDF original
}

// ============================================================
const P = "https://www.planalto.gov.br/ccivil_03";
const CDC = `${P}/leis/l8078compilado.htm`;
const CLT = `${P}/decreto-lei/del5452compilado.htm`;
const CF = `${P}/constituicao/constituicao.htm`;
const FGTS = `${P}/leis/l8036consol.htm`;
const STJ_SUMULAS = "https://www.stj.jus.br/docs_internet/VerbetesSTJ_asc.pdf";
const TST_SUMULAS = "https://consultaunificada2.tst.jus.br/";

const s = (label: string, url: string): Source => ({ label, url });

export const SOURCES: Record<string, Source> = {
    // ---------------- CONSUMIDOR ----------------
    c01: s("Lei 8.078/1990 (CDC)", CDC),
    c02: s("CDC, art. 49", `${CDC}#art49`),
    c03: s("CDC, art. 2º", `${CDC}#art2`),
    c04: s("Procons: reclamações e fiscalização (Gov.br)", "https://www.gov.br/anatel/pt-br/consumidor/quer-reclamar/anatel-procon-ou-juizados-especiais"),
    c05: s("CDC, art. 39, I", `${CDC}#art39`),
    c06: s("CDC, art. 26, II", `${CDC}#art26`),
    c07: s("CDC, art. 37", `${CDC}#art37`),
    c08: s("CDC, art. 31", `${CDC}#art31`),
    c09: s("CDC, art. 42", `${CDC}#art42`),
    c10: s("Lei 9.099/1995, art. 9º", `${P}/leis/l9099.htm#art9`),
    c11: s("CDC, art. 12", `${CDC}#art12`),
    c12: s("CDC, art. 6º, VIII", `${CDC}#art6`),
    c13: s("CDC, art. 27", `${CDC}#art27`),
    c14: s("CDC, art. 51", `${CDC}#art51`),
    c15: s("CDC, art. 42, parágrafo único", `${CDC}#art42`),
    c16: s("CDC, art. 26, §3º", `${CDC}#art26`),
    c17: s("CDC, art. 18, §1º", `${CDC}#art18`),
    c18: s("CDC, art. 40, §1º", `${CDC}#art40`),
    c19: s("CDC, art. 43, §1º", `${CDC}#art43`),
    c20: s("CDC, art. 54, §4º", `${CDC}#art54`),
    c21: s("Súmula 297 do STJ", STJ_SUMULAS),
    c22: s("Súmula 479 do STJ", STJ_SUMULAS),
    c23: s("CDC, art. 28, §5º", `${CDC}#art28`),
    c24: s("CDC, art. 13", `${CDC}#art13`),
    c25: s("CDC, art. 12, §3º", `${CDC}#art12`),
    c26: s("Súmula 385 do STJ", STJ_SUMULAS),
    c27: s("Súmula 302 do STJ", STJ_SUMULAS),
    c28: s("CDC, art. 17", `${CDC}#art17`),
    c29: s("CDC, art. 18, §3º", `${CDC}#art18`),
    c30: s("Súmula 130 do STJ", STJ_SUMULAS),

    // ---------------- TRABALHO ----------------
    t01: s("CF/1988, art. 7º, XIII", `${CF}#art7`),
    t02: s("CLT, art. 130", `${CLT}#art130`),
    t03: s("Lei 4.090/1962 (13º salário)", `${P}/leis/l4090.htm`),
    t04: s("CF/1988, art. 7º, XXXIII", `${CF}#art7`),
    t05: s("CLT, art. 29", `${CLT}#art29`),
    t06: s("Lei 8.036/1990, art. 15", `${FGTS}#art15`),
    t07: s("CF/1988, art. 7º, XVIII", `${CF}#art7`),
    t08: s("CF/1988, art. 7º, XV", `${CF}#art7`),
    t09: s("CF/1988, art. 7º, XVI", `${CF}#art7`),
    t10: s("CLT, art. 71", `${CLT}#art71`),
    t11: s("Lei 12.506/2011 (aviso prévio proporcional)", `${P}/_ato2011-2014/2011/lei/l12506.htm`),
    t12: s("Lei 8.036/1990, art. 18, §1º", `${FGTS}#art18`),
    t13: s("CF/1988, art. 7º, XXIX", `${CF}#art7`),
    t14: s("Súmulas 172 e 376 do TST", TST_SUMULAS),
    t15: s("CLT, art. 73", `${CLT}#art73`),
    t16: s("CLT, art. 192", `${CLT}#art192`),
    t17: s("ADCT, art. 10, II, b (CF/1988)", CF),
    t18: s("CLT, art. 445, parágrafo único", `${CLT}#art445`),
    t19: s("CLT, art. 59, §5º", `${CLT}#art59`),
    t20: s("CLT, art. 482, a", `${CLT}#art482`),
    t21: s("CLT, art. 58, §2º (Lei 13.467/2017)", `${CLT}#art58`),
    t22: s("CLT, art. 71, §4º", `${CLT}#art71`),
    t23: s("Súmula 331 do TST", TST_SUMULAS),
    t24: s("CLT, art. 59-A", `${CLT}#art59a`),
    t25: s("Súmula 443 do TST", TST_SUMULAS),
    t26: s("CLT, art. 461, §1º", `${CLT}#art461`),
    t27: s("CLT, art. 452-A, §2º", `${CLT}#art452a`),
    t28: s("CLT, art. 790, §3º", `${CLT}#art790`),
    t29: s("Súmula 366 do TST", TST_SUMULAS),
    t30: s("CLT, art. 895", `${CLT}#art895`),
};
const q = (
    id: string,
    area: Area,
    level: Level,
    text: string,
    options: [string, string, string],
    answer: Letter,
    basis: string,
    corrigido = false,
): Question => {
    const source = SOURCES[id];
    if (!source) throw new Error(`Fonte não cadastrada para a pergunta ${id}.`);
    return {
        id, area, level, points: POINTS[level], text, options, answer, basis, source,
        ...(corrigido ? { corrigido } : {}),
    };
};

export const questions: Question[] = [
    // ---------------- DIREITO DO CONSUMIDOR ----------------
    // Fácil
    q("c01", "consumidor", "facil", "Qual lei institui o Código de Defesa do Consumidor (CDC)?",
        ["Lei nº 8.078/1990", "Lei nº 10.406/2002 (Código Civil)", "Lei nº 9.099/1995 (Juizados Especiais)"], "A", "Lei 8.078, de 11/09/1990."),
    q("c02", "consumidor", "facil", "Em compras feitas fora do estabelecimento comercial (internet, telefone), em quanto tempo o consumidor pode desistir sem precisar justificar?",
        ["24 horas", "30 dias", "7 dias, contados da assinatura ou do recebimento do produto"], "C", "Direito de arrependimento: art. 49 do CDC."),
    q("c03", "consumidor", "facil", "Segundo o CDC, consumidor é:",
        ["somente quem compra produtos para revender", "toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final", "apenas pessoa física maior de 18 anos"], "B", "Art. 2º do CDC."),
    q("c04", "consumidor", "facil", "Qual órgão é conhecido por receber reclamações de consumidores e fiscalizar práticas abusivas?",
        ["Junta Comercial", "Procon", "Receita Federal"], "B", "O Procon integra o Sistema Nacional de Defesa do Consumidor."),
    q("c05", "consumidor", "facil", "Condicionar a venda de um produto à compra de outro (venda casada) é:",
        ["prática abusiva, proibida pelo CDC", "permitida se informada no balcão", "permitida apenas em promoções"], "A", "Art. 39, I, do CDC."),
    q("c06", "consumidor", "facil", "Qual é o prazo para reclamar de vício aparente ou de fácil constatação em produto durável?",
        ["7 dias", "30 dias", "90 dias"], "C", "Art. 26, II, do CDC (30 dias é para produtos não duráveis)."),
    q("c07", "consumidor", "facil", "A publicidade enganosa, que induz o consumidor a erro sobre características do produto, é:",
        ["permitida, desde que o preço seja baixo", "proibida pelo CDC", "permitida, desde que veiculada apenas na internet"], "B", "Art. 37 do CDC."),
    q("c08", "consumidor", "facil", "Em que idioma devem ser prestadas as informações sobre produtos e serviços (preço, composição, riscos)?",
        ["Língua portuguesa", "Inglês", "Qualquer idioma escolhido pelo fornecedor"], "A", "Art. 31 do CDC."),
    q("c09", "consumidor", "facil", "O consumidor inadimplente pode ser exposto ao ridículo ou constrangido na cobrança de uma dívida?",
        ["Sim, se a dívida for alta", "Sim, se o credor avisar antes", "Não; o CDC proíbe a cobrança vexatória"], "C", "Art. 42, caput, do CDC."),
    q("c10", "consumidor", "facil", "Nos Juizados Especiais Cíveis, a presença de advogado é facultativa em causas de valor até:",
        ["5 salários mínimos", "20 salários mínimos", "100 salários mínimos"], "B", "Art. 9º da Lei 9.099/1995."),
    // Médio
    q("c11", "consumidor", "medio", "A responsabilidade do fornecedor pelos danos causados por defeito do produto (fato do produto) é, em regra:",
        ["subjetiva, exigindo prova de culpa do fornecedor", "inexistente se o consumidor usou o produto por mais de 30 dias", "objetiva, ou seja, independe de culpa"], "C", "Art. 12 do CDC."),
    q("c12", "consumidor", "medio", "A inversão do ônus da prova em favor do consumidor depende de:",
        ["decisão do juiz, quando a alegação for verossímil ou o consumidor hipossuficiente", "pedido feito antes da compra", "concordância do fornecedor"], "A", "Art. 6º, VIII, do CDC."),
    q("c13", "consumidor", "medio", "Qual o prazo prescricional para pedir reparação por danos causados por fato do produto ou do serviço?",
        ["1 ano", "5 anos, contados do conhecimento do dano e de sua autoria", "10 anos"], "B", "Art. 27 do CDC."),
    q("c14", "consumidor", "medio", "As cláusulas contratuais abusivas previstas no CDC são:",
        ["anuláveis apenas se o consumidor reclamar em 30 dias", "válidas se o consumidor assinou o contrato", "nulas de pleno direito"], "C", "Art. 51 do CDC."),
    q("c15", "consumidor", "medio", "A cobrança indevida de quantia já paga pelo consumidor gera, em regra, direito à restituição:",
        ["em dobro, salvo engano justificável", "simples, sem correção", "em triplo, em todos os casos"], "A", "Art. 42, parágrafo único, do CDC."),
    q("c16", "consumidor", "medio", "Em caso de vício oculto, o prazo decadencial para reclamar começa a contar:",
        ["da data de fabricação do produto", "do momento em que o defeito ficar evidenciado", "da data do vencimento da garantia"], "B", "Art. 26, §3º, do CDC."),
    q("c17", "consumidor", "medio", "Apresentado vício de qualidade no produto, quanto tempo o fornecedor tem para saná-lo antes de o consumidor exigir substituição, restituição ou abatimento?",
        ["7 dias", "90 dias", "30 dias"], "C", "Art. 18, §1º, do CDC."),
    q("c18", "consumidor", "medio", "Salvo estipulação em contrário, o orçamento de serviço tem validade de:",
        ["10 dias, contados do recebimento pelo consumidor", "30 dias", "24 horas"], "A", "Art. 40, §1º, do CDC."),
    q("c19", "consumidor", "medio", "As informações negativas do consumidor em cadastros de inadimplentes não podem permanecer arquivadas por mais de:",
        ["2 anos", "5 anos", "10 anos"], "B", "Art. 43, §1º, do CDC."),
    q("c20", "consumidor", "medio", "Em contratos de adesão, as cláusulas que limitem direitos do consumidor devem ser:",
        ["escritas em letras pequenas, ao final do contrato", "verbais, para agilizar a contratação", "redigidas com destaque, permitindo sua fácil e imediata compreensão"], "C", "Art. 54, §4º, do CDC."),
    // Difícil
    q("c21", "consumidor", "dificil", "Segundo a Súmula 297 do STJ, o CDC:",
        ["não se aplica a contratos bancários", "é aplicável às instituições financeiras", "aplica-se apenas a bancos públicos"], "B", "Súmula 297 do STJ."),
    q("c22", "consumidor", "dificil", "Segundo a Súmula 479 do STJ, as instituições financeiras respondem por fraudes praticadas por terceiros em operações bancárias:",
        ["objetivamente, por se tratar de fortuito interno", "somente se houver culpa comprovada do banco", "nunca, pois a fraude é fato de terceiro"], "A", "Súmula 479 do STJ."),
    q("c23", "consumidor", "dificil", "Na desconsideração da personalidade jurídica prevista no art. 28, §5º, do CDC (teoria menor), basta que:",
        ["fique provado abuso de direito com dolo dos sócios", "a empresa tenha sido extinta há mais de 5 anos", "a personalidade da empresa seja obstáculo ao ressarcimento dos prejuízos causados aos consumidores"], "C", "Art. 28, §5º, do CDC."),
    q("c24", "consumidor", "dificil", "Quanto ao fato do produto (acidente de consumo), o comerciante responde:",
        ["somente nas hipóteses do art. 13: fabricante não identificado, produto sem identificação clara ou perecíveis mal conservados", "sempre, em qualquer hipótese, no lugar do fabricante", "nunca, pois só o fabricante responde pelo fato do produto"], "A", "Art. 13 do CDC."),
    q("c25", "consumidor", "dificil", "Segundo o art. 12, §3º, do CDC, o fabricante só não é responsabilizado se provar:",
        ["que não colocou o produto no mercado, que o defeito inexiste ou que a culpa é exclusiva do consumidor ou de terceiro", "que o consumidor leu o manual de instruções", "que o produto estava em promoção"], "A", "Art. 12, §3º, do CDC."),
    q("c26", "consumidor", "dificil", "Segundo a Súmula 385 do STJ, havendo anotação irregular em cadastro de inadimplentes, não cabe indenização por dano moral quando:",
        ["a inscrição durar menos de 30 dias", "já existir inscrição legítima preexistente, ressalvado o direito ao cancelamento", "a dívida for de baixo valor"], "B", "Súmula 385 do STJ.", true),
    q("c27", "consumidor", "dificil", "Segundo a Súmula 302 do STJ, a cláusula de plano de saúde que limita no tempo a internação hospitalar do segurado é:",
        ["válida, se constar do contrato em destaque", "abusiva", "válida, se o limite for superior a 30 dias"], "B", "Súmula 302 do STJ."),
    q("c28", "consumidor", "dificil", "O art. 17 do CDC equipara a consumidores todas as vítimas do evento danoso (consumidor bystander). Isso significa que:",
        ["terceiros que sofram dano em acidente de consumo também são protegidos pelo CDC, mesmo sem ter comprado o produto", "só quem celebrou o contrato de compra pode ajuizar ação", "somente parentes do comprador têm direito à indenização"], "A", "Art. 17 do CDC."),
    q("c29", "consumidor", "dificil", "Em que situação o consumidor pode exigir de imediato substituição, restituição ou abatimento, sem aguardar os 30 dias do art. 18, §1º?",
        ["Somente se o produto tiver mais de 1 ano de uso", "Quando a substituição das partes comprometer a qualidade, diminuir o valor ou se tratar de produto essencial", "Nunca; o prazo de 30 dias é sempre obrigatório"], "B", "Art. 18, §3º, do CDC.", true),
    q("c30", "consumidor", "dificil", "Segundo a Súmula 130 do STJ, a empresa responde perante o cliente por dano ou furto de veículo ocorrido em seu estacionamento?",
        ["Não, pois o estacionamento é uma cortesia", "Sim, responde pela reparação do dano", "Não, se houver placa avisando que a empresa não se responsabiliza"], "B", "Súmula 130 do STJ; placas de isenção não afastam a responsabilidade."),

    // ---------------- DIREITO DO TRABALHO ----------------
    // Fácil
    q("t01", "trabalho", "facil", "Qual a duração normal máxima do trabalho prevista na Constituição Federal?",
        ["6 horas diárias e 30 semanais", "8 horas diárias e 44 semanais", "10 horas diárias e 48 semanais"], "B", "Art. 7º, XIII, da CF."),
    q("t02", "trabalho", "facil", "Após cada 12 meses de vigência do contrato, quantos dias de férias tem o empregado (sem faltas injustificadas relevantes)?",
        ["30 dias", "15 dias", "20 dias"], "A", "Art. 130 da CLT."),
    q("t03", "trabalho", "facil", "O 13º salário também é conhecido como:",
        ["adicional de férias", "participação nos lucros", "gratificação natalina"], "C", "Lei 4.090/1962."),
    q("t04", "trabalho", "facil", "Qual a idade mínima para o contrato de aprendizagem?",
        ["12 anos", "14 anos", "16 anos"], "B", "Art. 7º, XXXIII, da CF."),
    q("t05", "trabalho", "facil", "Qual documento registra o contrato de trabalho, anotando data de admissão e remuneração?",
        ["Carteira de Trabalho e Previdência Social (CTPS)", "Certidão de Antecedentes Criminais", "Título de Eleitor"], "A", "Art. 29 da CLT."),
    q("t06", "trabalho", "facil", "O empregador deve depositar mensalmente na conta vinculada do FGTS do empregado:",
        ["2% da remuneração", "20% da remuneração", "8% da remuneração"], "C", "Art. 15 da Lei 8.036/1990."),
    q("t07", "trabalho", "facil", "A licença-maternidade prevista na Constituição Federal tem duração de:",
        ["120 dias", "60 dias", "90 dias"], "A", "Art. 7º, XVIII, da CF (a Empresa Cidadã pode prorrogar por 60 dias)."),
    q("t08", "trabalho", "facil", "O descanso semanal remunerado deve ser concedido, preferencialmente, aos:",
        ["sábados", "domingos", "feriados"], "B", "Art. 7º, XV, da CF."),
    q("t09", "trabalho", "facil", "O adicional mínimo constitucional para as horas extras é de:",
        ["10%", "20%", "50% sobre a hora normal"], "C", "Art. 7º, XVI, da CF."),
    q("t10", "trabalho", "facil", "Em jornada superior a 6 horas, o intervalo mínimo para repouso ou alimentação é de:",
        ["1 hora", "15 minutos", "30 minutos"], "A", "Art. 71 da CLT (15 minutos se a jornada for de 4 a 6 horas)."),
    // Médio
    q("t11", "trabalho", "medio", "Um empregado com 5 anos completos de serviço é dispensado sem justa causa. Qual o aviso prévio a que tem direito (Lei 12.506/2011)?",
        ["30 dias", "45 dias", "60 dias"], "B", "30 dias + 3 dias por ano completo de serviço = 45 dias."),
    q("t12", "trabalho", "medio", "Na dispensa sem justa causa, o empregador deve pagar sobre os depósitos do FGTS uma multa de:",
        ["10%", "20%", "40%"], "C", "Art. 18, §1º, da Lei 8.036/1990."),
    q("t13", "trabalho", "medio", "Qual o prazo prescricional para ajuizar ação trabalhista após a extinção do contrato de trabalho?",
        ["2 anos, limitada a cobrança aos últimos 5 anos", "5 anos, sem limitação", "1 ano"], "A", "Art. 7º, XXIX, da CF."),
    q("t14", "trabalho", "medio", "Horas extras habituais, em regra, refletem (integram o cálculo) em:",
        ["férias, 13º salário, FGTS e descanso semanal remunerado", "apenas no salário do mês em que foram feitas", "nenhuma verba, por terem natureza indenizatória"], "A", "Súmulas 172 e 376 do TST.", true),
    q("t15", "trabalho", "medio", "O adicional noturno do trabalhador urbano (22h às 5h) é de, no mínimo:",
        ["50%", "20% sobre a hora diurna", "10%"], "B", "Art. 73 da CLT.", true),
    q("t16", "trabalho", "medio", "Os percentuais do adicional de insalubridade nos graus mínimo, médio e máximo são, respectivamente:",
        ["10%, 20% e 40%", "5%, 10% e 20%", "20%, 40% e 60%"], "A", "Art. 192 da CLT."),
    q("t17", "trabalho", "medio", "A empregada gestante tem estabilidade provisória desde a confirmação da gravidez até:",
        ["5 meses após o parto", "30 dias após o parto", "o fim da licença-maternidade de 120 dias"], "A", "Art. 10, II, b, do ADCT.", true),
    q("t18", "trabalho", "medio", "O contrato de experiência pode durar, no máximo:",
        ["180 dias", "90 dias", "30 dias"], "B", "Art. 445, parágrafo único, da CLT.", true),
    q("t19", "trabalho", "medio", "O banco de horas estabelecido por acordo individual escrito deve ter as horas compensadas em até:",
        ["6 meses", "1 ano", "30 dias"], "A", "Art. 59, §5º, da CLT (acordo individual: até 6 meses; convenção/acordo coletivo: até 1 ano)."),
    q("t20", "trabalho", "medio", "Qual das hipóteses abaixo pode configurar justa causa para a dispensa do empregado (art. 482 da CLT)?",
        ["ato de improbidade", "pedir aumento de salário", "chegar atrasado uma única vez por causa do trânsito"], "A", "Art. 482, a, da CLT.", true),
    // Difícil
    q("t21", "trabalho", "dificil", "Após a Reforma Trabalhista (Lei 13.467/2017), o tempo gasto no deslocamento da residência até o posto de trabalho (e no retorno) é:",
        ["computado apenas se o transporte for fornecido pelo empregador", "não computado na jornada, por não ser tempo à disposição do empregador", "sempre computado como hora extra"], "B", "Art. 58, §2º, da CLT.", true),
    q("t22", "trabalho", "dificil", "Pelo art. 71, §4º, da CLT, o intervalo intrajornada não concedido ou reduzido gera pagamento:",
        ["apenas do período suprimido, com acréscimo de 50% e natureza indenizatória", "da hora integral com acréscimo de 100% e natureza salarial", "de multa fixa de 1 salário mínimo"], "A", "Art. 71, §4º, da CLT, com redação da Lei 13.467/2017."),
    q("t23", "trabalho", "dificil", "Pela Súmula 331 do TST, na terceirização lícita, se a empresa prestadora não pagar as verbas trabalhistas, a tomadora de serviços responde:",
        ["subsidiariamente, desde que tenha participado da relação processual e conste do título executivo", "solidariamente, sem qualquer condição", "de nenhuma forma, pois o vínculo é só com a prestadora"], "A", "Súmula 331, IV, do TST.", true),
    q("t24", "trabalho", "dificil", "A jornada de 12 horas de trabalho por 36 de descanso (12x36) pode ser estabelecida, segundo o art. 59-A da CLT, por:",
        ["apenas por sentença normativa", "acordo individual escrito, convenção coletiva ou acordo coletivo", "exclusivamente por lei federal"], "B", "Art. 59-A da CLT.", true),
    q("t25", "trabalho", "dificil", "Pela Súmula 443 do TST, a dispensa de empregado portador do vírus HIV ou de outra doença grave que suscite estigma ou preconceito é:",
        ["presumidamente discriminatória, com direito à reintegração", "válida, pois o empregador pode dispensar sem justa causa", "válida, desde que paga a multa de 40% do FGTS"], "A", "Súmula 443 do TST."),
    q("t26", "trabalho", "dificil", "Pelo art. 461 da CLT (pós-reforma), na equiparação salarial a diferença de tempo na função entre paradigma e equiparando não pode ser superior a:",
        ["2 anos", "4 anos", "1 ano"], "A", "Art. 461, §1º: até 2 anos na função (e até 4 anos de tempo de serviço para o mesmo empregador).", true),
    q("t27", "trabalho", "dificil", "No contrato de trabalho intermitente, o empregado convocado tem quanto tempo para responder ao chamado, presumindo-se, no silêncio, a recusa?",
        ["3 dias corridos", "1 dia útil", "5 dias úteis"], "B", "Art. 452-A, §2º, da CLT (3 dias corridos é a antecedência mínima da convocação).", true),
    q("t28", "trabalho", "dificil", "Pelo art. 790, §3º, da CLT, o juiz pode conceder gratuidade de justiça a quem perceba salário igual ou inferior a:",
        ["40% do limite máximo dos benefícios do RGPS", "o dobro do salário mínimo", "60% do limite máximo dos benefícios do RGPS"], "A", "Art. 790, §3º, da CLT (também possível mediante comprovação de insuficiência de recursos, §4º)."),
    q("t29", "trabalho", "dificil", "Pela Súmula 366 do TST, não serão descontadas nem computadas como extras as variações de horário no registro de ponto não excedentes de:",
        ["5 minutos, observado o limite máximo de 10 minutos diários", "10 minutos por registro, sem limite diário", "15 minutos por dia, no total"], "A", "Súmula 366 do TST.", true),
    q("t30", "trabalho", "dificil", "O prazo para interposição de recurso ordinário na Justiça do Trabalho é de:",
        ["15 dias úteis", "8 dias úteis", "5 dias úteis"], "B", "Art. 895 da CLT; prazos contados em dias úteis (art. 775).", true),
];
