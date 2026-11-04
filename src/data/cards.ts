// ============================================================
// CARTAS DO MODO STAND (Detetive dos Direitos) — editável.
// ============================================================
import type { Area, Source } from "./questions";

export interface Card {
    id: string;
    area: Area;
    situation: string;
    answer: boolean; // true = SIM (direito violado / pode contestar), false = NÃO
    learn: string; // explicação em uma frase (até ~15 s de leitura)
    source: Source;
    tag?: string; // ex.: "CLT", "CDC"
}

export const cards: Card[] = [
    {
        id: "k1", area: "trabalho", tag: "CLT",
        source: { label: "CLT, arts. 2º e 3º", url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm#art3" },
        situation: "Uma pessoa trabalha diariamente, recebe ordens do chefe e salário, mas não tem a carteira assinada. Isso pode indicar uma irregularidade?",
        answer: true,
        learn: "A ausência de registro não impede o reconhecimento de vínculo empregatício quando os requisitos legais estão presentes."
    },
    {
        id: "k2", area: "trabalho", tag: "CLT",
        source: { label: "CF/1988, art. 7º, XVI", url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm#art7" },
        situation: "O empregado faz horas extras autorizadas, mas nunca recebe por elas nem tem compensação válida. Isso pode violar seus direitos?",
        answer: true,
        learn: "As horas extras devem ser remuneradas com o adicional legal ou compensadas validamente, conforme as regras aplicáveis."
    },
    {
        id: "k3", area: "trabalho", tag: "CLT",
        source: { label: "CLT, arts. 129 e 134", url: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm#art129" },
        situation: "A empresa diz que o trabalhador não pode tirar férias porque está com muito serviço. Essa justificativa é suficiente?",
        answer: false,
        learn: "As férias são um direito previsto em lei e devem ser concedidas nos prazos legais."
    },
    {
        id: "k4", area: "consumidor", tag: "CDC",
        source: { label: "CDC, arts. 18 e 25, §1º", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm#art18" },
        situation: "Você comprou um produto com defeito. A loja pode simplesmente se recusar a atender você e mandar procurar o fabricante?",
        answer: false,
        learn: "Em regra, os fornecedores envolvidos respondem pelo vício do produto conforme o CDC."
    },
    {
        id: "k5", area: "consumidor", tag: "CDC",
        source: { label: "CDC, art. 39, I", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm#art39" },
        situation: "Uma loja anuncia um produto por determinado preço, mas exige a compra de outro produto para vender o primeiro. Isso pode ser abusivo?",
        answer: true,
        learn: "A prática pode configurar venda casada, vedada pelo Código de Defesa do Consumidor."
    },
    {
        id: "k6", area: "consumidor", tag: "CDC",
        source: { label: "CDC, arts. 6º, III, e 42", url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm#art42" },
        situation: "Apareceu na sua fatura uma cobrança por um serviço que você não contratou. Você pode contestá-la?",
        answer: true,
        learn: "O consumidor pode contestar cobranças indevidas e solicitar esclarecimentos e correção, conforme o caso."
    },
];
