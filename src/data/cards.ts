// ============================================================
// CARTAS DO MODO STAND (Detetive dos Direitos) — editável.
// ============================================================
import type { Area } from "./questions";

export interface Card {
    id: string;
    area: Area;
    situation: string;
    answer: boolean; // true = SIM (direito violado / pode contestar), false = NÃO
    learn: string; // explicação em uma frase (até ~15 s de leitura)
    tag?: string; // ex.: "CLT", "CDC"
}

export const cards: Card[] = [
    {
        id: "k1", area: "trabalho", tag: "CLT",
        situation: "Uma pessoa trabalha diariamente, recebe ordens do chefe e salário, mas não tem a carteira assinada. Isso pode indicar uma irregularidade?",
        answer: true,
        learn: "A ausência de registro não impede o reconhecimento de vínculo empregatício quando os requisitos legais estão presentes."
    },
    {
        id: "k2", area: "trabalho", tag: "CLT",
        situation: "O empregado faz horas extras autorizadas, mas nunca recebe por elas nem tem compensação válida. Isso pode violar seus direitos?",
        answer: true,
        learn: "As horas extras devem ser remuneradas com o adicional legal ou compensadas validamente, conforme as regras aplicáveis."
    },
    {
        id: "k3", area: "trabalho", tag: "CLT",
        situation: "A empresa diz que o trabalhador não pode tirar férias porque está com muito serviço. Essa justificativa é suficiente?",
        answer: false,
        learn: "As férias são um direito previsto em lei e devem ser concedidas nos prazos legais."
    },
    {
        id: "k4", area: "consumidor", tag: "CDC",
        situation: "Você comprou um produto com defeito. A loja pode simplesmente se recusar a atender você e mandar procurar o fabricante?",
        answer: false,
        learn: "Em regra, os fornecedores envolvidos respondem pelo vício do produto conforme o CDC."
    },
    {
        id: "k5", area: "consumidor", tag: "CDC",
        situation: "Uma loja anuncia um produto por determinado preço, mas exige a compra de outro produto para vender o primeiro. Isso pode ser abusivo?",
        answer: true,
        learn: "A prática pode configurar venda casada, vedada pelo Código de Defesa do Consumidor."
    },
    {
        id: "k6", area: "consumidor", tag: "CDC",
        situation: "Apareceu na sua fatura uma cobrança por um serviço que você não contratou. Você pode contestá-la?",
        answer: true,
        learn: "O consumidor pode contestar cobranças indevidas e solicitar esclarecimentos e correção, conforme o caso."
    },
];