export interface CriteriosAtleta {
    idade: number;
    sexo: 'M' | 'F';
    peso_kg?: number;
    pcd?: boolean;
    ebike?: boolean;
    nivel?: 'INICIANTE' | 'AMADOR' | 'ELITE';
}

export interface ResultadoElegibilidade {
    elegivel: boolean;
    categorias_recomendadas: { id: number; nome: string; motivo: string }[];
    categorias_incompativeis: { id: number; nome: string; motivo: string }[];
    observacoes_regulamentares: string[];
}

export function avaliarElegibilidade(
    criterios: CriteriosAtleta, 
    categorias: any[]
): ResultadoElegibilidade {
    const recomendadas: { id: number; nome: string; motivo: string }[] = [];
    const incompativeis: { id: number; nome: string; motivo: string }[] = [];
    const obs: string[] = [];

    const { idade, sexo, peso_kg, pcd, ebike, nivel } = criterios;

    // Regra E-Bike: Se for bicicleta elétrica, OBRIGATORIAMENTE vai para E-BIKE
    if (ebike) {
        obs.push('Bicicletas com assistência elétrica (E-Bike) são restritas à categoria E-BIKE (Art. 42 Regulamento CBC). Não é permitida a participação em categorias convencionais.');
    }

    if (pcd) {
        obs.push('Atletas PCD possuem direito à inscrição na categoria PNE com apresentação de laudo médico comprobatório na secretaria de prova.');
    }

    for (const cat of categorias) {
        let compativel = true;
        const motivosRecusa: string[] = [];

        // 1. E-Bike
        if (cat.id === 1) { // E-BIKE
            if (!ebike) {
                compativel = false;
                motivosRecusa.push('Exige bicicleta assistida por motor elétrico.');
            } else if (idade < 18) {
                compativel = false;
                motivosRecusa.push('Idade mínima de 18 anos exigida para E-Bike.');
            }
        } else {
            if (ebike) {
                compativel = false;
                motivosRecusa.push('Categoria exclusiva para bicicletas convencionais sem motor.');
            }
        }

        // 2. PCD / PNE
        if (cat.id === 20) { // PNE
            if (!pcd) {
                compativel = false;
                motivosRecusa.push('Exige condição de Portador de Necessidades Especiais (PCD) com laudo.');
            }
        }

        // 3. Sexo
        if (cat.sexo && cat.sexo !== 'X') {
            if (cat.sexo !== sexo) {
                compativel = false;
                motivosRecusa.push(`Categoria exclusiva para sexo ${cat.sexo === 'M' ? 'Masculino' : 'Feminino'}.`);
            }
        }

        // 4. Idade
        if (cat.idade_min && idade < cat.idade_min) {
            compativel = false;
            motivosRecusa.push(`Idade ${idade} abaixo do mínimo permitido (${cat.idade_min} anos).`);
        }
        if (cat.idade_max && idade > cat.idade_max) {
            compativel = false;
            motivosRecusa.push(`Idade ${idade} acima do máximo permitido (${cat.idade_max} anos).`);
        }

        // 5. Peso
        if (cat.peso_min && (!peso_kg || peso_kg < cat.peso_min)) {
            compativel = false;
            motivosRecusa.push(`Peso corporal (${peso_kg || 'não informado'} kg) abaixo do mínimo exigido (${cat.peso_min} kg).`);
        }
        if (cat.peso_max && peso_kg && peso_kg > cat.peso_max) {
            compativel = false;
            motivosRecusa.push(`Peso corporal (${peso_kg} kg) acima do limite da categoria (${cat.peso_max} kg).`);
        }

        // 6. Nível esportivo
        if (cat.nivel === 'ELITE' && nivel === 'INICIANTE') {
            compativel = false;
            motivosRecusa.push('Categoria de Alto Rendimento (Elite), incompatível com nível iniciante declarado.');
        }
        if (cat.nivel === 'INICIANTE' && nivel === 'ELITE') {
            compativel = false;
            motivosRecusa.push('Atletas federados de nível Elite não podem competir nas categorias Sport/Iniciante.');
        }

        if (compativel) {
            recomendadas.push({
                id: cat.id,
                nome: cat.nome,
                motivo: `Enquadramento regulamentar perfeito para idade ${idade} anos, sexo ${sexo}${peso_kg ? ', ' + peso_kg + 'kg' : ''}.`
            });
        } else {
            incompativeis.push({
                id: cat.id,
                nome: cat.nome,
                motivo: motivosRecusa.join(' ')
            });
        }
    }

    return {
        elegivel: recomendadas.length > 0,
        categorias_recomendadas: recomendadas,
        categorias_incompativeis: incompativeis,
        observacoes_regulamentares: obs
    };
}
