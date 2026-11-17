export interface Atleta {
    id: number;
    nome: string;
    categoria_id: number;
    categoria?: string;
    data_nascimento?: string;
    sexo?: string;
    peso_kg?: number;
    pcd?: boolean;
    ebike?: boolean;
    nivel?: string;
    tipo_inscricao?: string;
}

export interface Categoria {
    id: number;
    nome: string;
    descricao: string;
    sexo?: string;
    idade_min?: number;
    idade_max?: number;
    peso_min?: number;
    peso_max?: number;
    nivel?: string;
    exige_pcd?: boolean;
    exige_ebike?: boolean;
    exige_dupla?: boolean;
    competitiva?: boolean;
}
